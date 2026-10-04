/**
 * Localizes character names so inline people links work outside English.
 *
 * WHY: people are joined to a verse canonically (entity_mention), but the
 * reader links a name only where it can FIND it in the verse text, and the
 * theographic dataset names everyone in English. "Moses" never matches "Moïse",
 * so before this ran, French/German/Spanish/Portuguese/Italian readers saw
 * fewer than a quarter of mentions linked (npm run audit:study-links).
 *
 * For each recommended translation (RECOMMENDED_BIBLES), per person:
 *
 *   1. Strong's bridge. The BSB alignment tags "Moses" with H4872. Collect the
 *      Strong's ids on BSB words that spell the person's English name in their
 *      mention verses, keep the dominant ones, store them in entity.strongs.
 *   2. Exact names. Where the translation has its own alignment (JND, L1912),
 *      the word carrying H4872 in the same verse IS the localized name —
 *      "Moïse", "Mose". Stored with source='alignment'.
 *   3. Model names. Where there is no alignment (RVR09, BLT, DB1885), or it
 *      left a person uncovered, gpt-4o-mini reads the person's actual verses
 *      in that translation and copies out the spelling used. source='ai'.
 *   4. Validation. EVERY term, from either route, is kept only if it occurs as
 *      a whole word in at least one of that person's mention verses in the
 *      recommended translation — using the same matcher the reader uses
 *      (src/lib/nameMatch.ts). A stored alias is therefore always one that
 *      links somewhere; a hallucinated spelling cannot survive.
 *
 * Only verses already stored in the DB are used. Warm the translation first
 * (scripts/warm-bible-text.ts) or coverage is limited to what readers opened.
 *
 * Usage:
 *   npm run seed:people-i18n -- --dry-run                 # every language, report only
 *   npm run seed:people-i18n -- --lang fr --limit 50 --dry-run
 *   npm run seed:people-i18n -- --lang de --load-alignment # fetch L1912 chapters first (api.bible quota!)
 *   npm run seed:people-i18n -- --lang es --skip-ai
 *
 * Idempotent: inserts are ON CONFLICT DO NOTHING, and people who already have
 * `ai` aliases for a language are not sent to the model again (unless --force).
 *
 * ⚠️ .env.local points at PRODUCTION. Use --dry-run first.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import OpenAI from "openai";
import { Pool } from "pg";
import { RECOMMENDED_BIBLES, type RecommendedBible } from "../src/lib/recommendedBible";
import { sourceForVersion } from "../src/app/common/alignment/model/AlignmentSource";
import { buildNamePattern, normalizeName } from "../src/lib/nameMatch";

/** A Strong's id must carry at least this share of the top id's votes to count. */
const STRONGS_MIN_SHARE = 0.2;
/** Same idea for alignment surfaces: drops one-off mis-tags. */
const SURFACE_MIN_SHARE = 0.1;
/** People whose own verses already link at this rate are not sent to the model. */
const AI_SKIP_COVERAGE = 0.8;
const AI_BATCH = 20;
const AI_SAMPLE_VERSES = 3;
const AI_MODEL = "gpt-4o-mini";

interface Args {
	langs: string[];
	dryRun: boolean;
	limit: number | null;
	slug: string | null;
	skipAi: boolean;
	loadAlignment: boolean;
	force: boolean;
}

interface Person {
	id: string;
	slug: string;
	name: string;
	aliases: string[];
	strongs: string[];
	mentions: number;
}

interface MentionVerse {
	ref: string;
	book: string;
	chapter: number;
	verse: number;
	text: string;
}

function parseArgs(): Args {
	const argv = process.argv.slice(2);
	const value = (flag: string) => {
		const i = argv.indexOf(flag);
		return i >= 0 ? argv[i + 1] : undefined;
	};
	const lang = value("--lang");
	const limit = value("--limit");
	return {
		langs: lang ? lang.split(",").map((l) => l.trim()) : RECOMMENDED_BIBLES.map((r) => r.lang).filter((l) => l !== "en"),
		dryRun: argv.includes("--dry-run"),
		limit: limit ? Number(limit) : null,
		slug: value("--slug") ?? null,
		skipAi: argv.includes("--skip-ai"),
		loadAlignment: argv.includes("--load-alignment"),
		force: argv.includes("--force"),
	};
}

/** "Jacob (Israel)" -> ["Jacob", "Israel"]; capitalised aliases only, since
 * the dataset also carries generic ones ("last", "hosts") that would vote for
 * common-word Strong's ids. */
function englishNameTerms(p: Person): string[] {
	const terms = new Set<string>();
	const paren = p.name.match(/^(.*?)\s*\((.*)\)\s*$/);
	if (paren) {
		terms.add(paren[1]);
		terms.add(paren[2]);
	} else {
		terms.add(p.name);
	}
	for (const a of p.aliases) if (/^\p{Lu}/u.test(a)) terms.add(a);
	return [...terms].map(normalizeName).filter(Boolean);
}

/** "l’Éternel" -> "Éternel", trims punctuation. Returns "" for non-names. */
function cleanSurface(surface: string): string {
	const s = normalizeName(surface)
		.replace(/^(?:[ldjnmstc]|qu)['’]/iu, "")
		.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
	// A proper name or divine title is capitalised in every recommended translation.
	return /^\p{Lu}/u.test(s) ? s : "";
}

function dominant(counts: Map<string, number>, minShare: number): string[] {
	const top = Math.max(0, ...counts.values());
	return [...counts.entries()].filter(([, n]) => n >= Math.max(1, top * minShare)).map(([k]) => k);
}

function linkedCount(verses: MentionVerse[], terms: string[]): number {
	const pattern = buildNamePattern(terms);
	if (!pattern) return 0;
	let n = 0;
	for (const v of verses) {
		pattern.lastIndex = 0;
		if (pattern.test(v.text)) n++;
	}
	return n;
}

/** Terms that occur as a whole word in at least one of the person's verses. */
function validate(terms: string[], verses: MentionVerse[], known: string[]): string[] {
	const knownLower = new Set(known.map((k) => k.toLowerCase()));
	const out = new Set<string>();
	for (const raw of terms) {
		const t = normalizeName(raw);
		if (t.length < 2 || knownLower.has(t.toLowerCase())) continue;
		if (linkedCount(verses, [t]) > 0) out.add(t);
	}
	return [...out];
}

async function loadPeople(pool: Pool, args: Args): Promise<Person[]> {
	const { rows } = await pool.query(
		`SELECT e.id, e.slug, e.name, e.aliases, e.strongs, count(m.id)::int AS mentions
		   FROM entity e JOIN entity_mention m ON m."entityId" = e.id
		  ${args.slug ? `WHERE e.slug = $1` : ""}
		  GROUP BY e.id
		  ORDER BY mentions DESC, e.slug
		  ${args.limit ? `LIMIT ${Math.floor(args.limit)}` : ""}`,
		args.slug ? [args.slug] : [],
	);
	return rows.map((r) => ({ ...r, aliases: r.aliases ?? [], strongs: r.strongs ?? [] }));
}

/** Mention verses of these people, as text in one Bible. Unloaded verses are absent. */
async function loadMentionVerses(pool: Pool, bibleId: string, ids: string[]): Promise<Map<string, MentionVerse[]>> {
	const { rows } = await pool.query(
		`SELECT m."entityId" AS id, m."bookAbbreviation" AS book, m.chapter, m.verse, v.content
		   FROM entity_mention m
		   JOIN book b ON b."bibleId" = $1 AND b."apiId" = m."bookAbbreviation"
		   JOIN chapter c ON c."bookId" = b.id AND c."chapterNumber" = m.chapter
		   JOIN verse v ON v."chapterId" = c.id AND v."verseNumber" = m.verse
		  WHERE m."entityId" = ANY($2::uuid[])`,
		[bibleId, ids],
	);
	const byPerson = new Map<string, MentionVerse[]>();
	for (const r of rows) {
		const list = byPerson.get(r.id) ?? byPerson.set(r.id, []).get(r.id)!;
		list.push({
			ref: `${r.book} ${r.chapter}:${r.verse}`,
			book: r.book,
			chapter: r.chapter,
			verse: r.verse,
			text: String(r.content).normalize("NFC"),
		});
	}
	return byPerson;
}

/** Step 1: the Strong's ids behind each person's English name, voted from BSB. */
async function deriveStrongs(pool: Pool, people: Person[], args: Args): Promise<void> {
	const todo = people.filter((p) => args.force || p.strongs.length === 0);
	if (todo.length === 0) return;
	process.stdout.write(`Deriving Strong's for ${todo.length} people from the BSB alignment… `);

	const { rows } = await pool.query(
		`SELECT m."entityId" AS id, w.surface, w.strongs
		   FROM entity_mention m
		   JOIN alignment_word w ON w."sourceCode" = 'bsb'
		    AND w."bookAbbreviation" = m."bookAbbreviation" AND w.chapter = m.chapter AND w.verse = m.verse
		  WHERE m."entityId" = ANY($1::uuid[]) AND w.surface ~ '[[:upper:]]'`,
		[todo.map((p) => p.id)],
	);
	const byPerson = new Map<string, { surface: string; strongs: string[] }[]>();
	for (const r of rows) (byPerson.get(r.id) ?? byPerson.set(r.id, []).get(r.id)!).push(r);

	let found = 0;
	for (const p of todo) {
		const pattern = buildNamePattern(englishNameTerms(p));
		if (!pattern) continue;
		const votes = new Map<string, number>();
		for (const w of byPerson.get(p.id) ?? []) {
			pattern.lastIndex = 0;
			if (!pattern.test(w.surface)) continue;
			for (const s of w.strongs ?? []) votes.set(s, (votes.get(s) ?? 0) + 1);
		}
		p.strongs = dominant(votes, STRONGS_MIN_SHARE);
		if (p.strongs.length) found++;
		if (!args.dryRun && p.strongs.length) {
			await pool.query(`UPDATE entity SET strongs = $2, "updatedAt" = now() WHERE id = $1`, [p.id, p.strongs]);
		}
	}
	console.log(`${found} bridged.`);
}

/** Step 2 candidates: words carrying the person's Strong's in the translation's own alignment. */
async function alignmentCandidates(pool: Pool, sourceCode: string, people: Person[]): Promise<Map<string, string[]>> {
	const bridged = people.filter((p) => p.strongs.length > 0);
	const { rows } = await pool.query(
		`SELECT s.id, w.surface, count(*)::int AS n
		   FROM jsonb_to_recordset($2::jsonb) AS s(id uuid, strongs text[])
		   JOIN entity_mention m ON m."entityId" = s.id
		   JOIN alignment_word w ON w."sourceCode" = $1
		    AND w."bookAbbreviation" = m."bookAbbreviation" AND w.chapter = m.chapter AND w.verse = m.verse
		    AND w.strongs && s.strongs::varchar[]
		  GROUP BY s.id, w.surface`,
		[sourceCode, JSON.stringify(bridged.map((p) => ({ id: p.id, strongs: p.strongs })))],
	);
	const counts = new Map<string, Map<string, number>>();
	for (const r of rows) {
		const term = cleanSurface(r.surface);
		if (!term) continue;
		const m = counts.get(r.id) ?? counts.set(r.id, new Map()).get(r.id)!;
		m.set(term, (m.get(term) ?? 0) + r.n);
	}
	return new Map([...counts.entries()].map(([id, m]) => [id, dominant(m, SURFACE_MIN_SHARE)]));
}

/** Optional: pull an api.bible-backed alignment (L1912) for every mention chapter. */
async function loadLiveAlignment(pool: Pool, sourceCode: string, people: Person[]): Promise<void> {
	const { alignmentBookEnsureSS } = await import("../src/app/common/alignment/service/server/alignmentBookEnsureSS");
	const { rows } = await pool.query(
		`SELECT DISTINCT m."bookAbbreviation" AS book, m.chapter
		   FROM entity_mention m
		  WHERE m."entityId" = ANY($1::uuid[])
		    AND NOT EXISTS (SELECT 1 FROM alignment_book ab
		                     WHERE ab."sourceCode" = $2 AND ab."bookAbbreviation" = m."bookAbbreviation"
		                       AND ab.chapter = m.chapter AND ab.status = 'ready')
		  ORDER BY 1, 2`,
		[people.map((p) => p.id), sourceCode],
	);
	console.log(`  loading ${rows.length} ${sourceCode} chapters from api.bible…`);
	let done = 0;
	for (const r of rows) {
		try {
			await alignmentBookEnsureSS(sourceCode, r.book, r.chapter);
		} catch (e) {
			console.log(`    ${r.book} ${r.chapter}: ${e instanceof Error ? e.message : e}`);
		}
		if (++done % 50 === 0) console.log(`    ${done}/${rows.length}`);
		await new Promise((res) => setTimeout(res, 250));
	}
}

/** Step 3: ask the model how each person is spelled in their own verses. */
async function aiCandidates(
	client: OpenAI,
	r: RecommendedBible,
	batch: { person: Person; lemmas: string[]; samples: MentionVerse[] }[],
): Promise<Map<string, string[]>> {
	const items = batch.map((b, i) => ({
		key: String(i + 1),
		english: b.person.name,
		original: b.lemmas.join(" / ") || undefined,
		verses: b.samples.map((v) => `${v.ref} ${v.text}`),
	}));
	const system = `You identify how biblical people are named in a ${r.label} (${r.lang}) Bible text.

For each item you get the person's English name, their Hebrew/Greek name when known, and verses from this translation that mention them.
Return every spelling of THIS person's name or title that appears in those verses, copied EXACTLY as written (same accents and capitalisation; singular, without articles, prepositions or elided prefixes like "l'").
Only include words present verbatim in the given verses. If none of the verses names them, return an empty array.

Respond with a single JSON object: {"results": {"<key>": string[]}}`;

	const chat = await client.chat.completions.create({
		model: AI_MODEL,
		temperature: 0,
		max_tokens: 2000,
		response_format: { type: "json_object" },
		messages: [
			{ role: "system", content: system },
			{ role: "user", content: JSON.stringify(items) },
		],
	});
	const parsed = JSON.parse(chat.choices[0]?.message?.content ?? "{}") as { results?: Record<string, unknown> };
	const out = new Map<string, string[]>();
	batch.forEach((b, i) => {
		const terms = parsed.results?.[String(i + 1)];
		if (Array.isArray(terms)) out.set(b.person.id, terms.filter((t): t is string => typeof t === "string"));
	});
	return out;
}

async function lemmasFor(pool: Pool, people: Person[]): Promise<Map<string, string>> {
	const ids = [...new Set(people.flatMap((p) => p.strongs))];
	if (ids.length === 0) return new Map();
	const { rows } = await pool.query(`SELECT strongs, lemma FROM strongs_entry WHERE strongs = ANY($1)`, [ids]);
	return new Map(rows.filter((x) => x.lemma).map((x) => [x.strongs, x.lemma]));
}

async function existingAliases(pool: Pool, lang: string): Promise<Map<string, { term: string; source: string }[]>> {
	const { rows } = await pool.query(`SELECT "entityId", term, source FROM entity_alias WHERE lang = $1`, [lang]);
	const out = new Map<string, { term: string; source: string }[]>();
	for (const r of rows) (out.get(r.entityId) ?? out.set(r.entityId, []).get(r.entityId)!).push(r);
	return out;
}

async function insertAliases(pool: Pool, lang: string, source: "alignment" | "ai", rows: { id: string; term: string }[]): Promise<void> {
	for (let i = 0; i < rows.length; i += 500) {
		const chunk = rows.slice(i, i + 500);
		const values = chunk.map((_, k) => `($${k * 2 + 1}, '${lang}', $${k * 2 + 2}, '${source}')`).join(",");
		await pool.query(
			`INSERT INTO entity_alias ("entityId", lang, term, source) VALUES ${values}
			 ON CONFLICT ("entityId", lang, term) DO NOTHING`,
			chunk.flatMap((c) => [c.id, c.term]),
		);
	}
}

async function localize(pool: Pool, client: OpenAI | null, r: RecommendedBible, people: Person[], args: Args): Promise<void> {
	console.log(`\n=== ${r.lang.toUpperCase()} ${r.slug} (${r.label}) ===`);
	if (!/^[a-z]{2,3}$/.test(r.lang)) throw new Error(`unexpected lang ${r.lang}`);

	const { rows: bibles } = await pool.query(`SELECT id, version FROM bible WHERE slug = $1`, [r.slug]);
	if (!bibles[0]) {
		console.log("  bible row missing — skipped");
		return;
	}
	const verses = await loadMentionVerses(pool, bibles[0].id, people.map((p) => p.id));
	const withText = people.filter((p) => (verses.get(p.id)?.length ?? 0) > 0);
	const totalVerses = [...verses.values()].reduce((n, v) => n + v.length, 0);
	console.log(`  ${withText.length}/${people.length} people have loaded verses (${totalVerses} mention verses)`);

	const existing = await existingAliases(pool, r.lang);
	const localized = new Map<string, string[]>(people.map((p) => [p.id, (existing.get(p.id) ?? []).map((a) => a.term)]));
	const englishTerms = (p: Person) => [p.name, ...p.aliases];
	const before = withText.reduce((n, p) => n + linkedCount(verses.get(p.id)!, [...englishTerms(p), ...localized.get(p.id)!]), 0);

	// Step 2 — exact alignment.
	const own = sourceForVersion(bibles[0].version);
	const alignmentRows: { id: string; term: string }[] = [];
	if (own) {
		if (args.loadAlignment && own.origin.kind === "apibible") await loadLiveAlignment(pool, own.code, withText);
		const candidates = await alignmentCandidates(pool, own.code, withText);
		for (const p of withText) {
			const kept = validate(candidates.get(p.id) ?? [], verses.get(p.id)!, [...englishTerms(p), ...localized.get(p.id)!]);
			for (const term of kept) alignmentRows.push({ id: p.id, term });
			localized.get(p.id)!.push(...kept);
		}
		console.log(`  alignment (${own.code}): ${alignmentRows.length} names for ${new Set(alignmentRows.map((a) => a.id)).size} people`);
		if (!args.dryRun) await insertAliases(pool, r.lang, "alignment", alignmentRows);
	}

	// Step 3 — model, for people whose verses still mostly fail to link.
	const aiRows: { id: string; term: string }[] = [];
	if (client) {
		const lemmas = await lemmasFor(pool, withText);
		const queue = withText
			.filter((p) => args.force || !(existing.get(p.id) ?? []).some((a) => a.source === "ai"))
			.map((p) => {
				const vs = verses.get(p.id)!;
				const pattern = buildNamePattern([...englishTerms(p), ...localized.get(p.id)!]);
				const unlinked = vs.filter((v) => {
					if (!pattern) return true;
					pattern.lastIndex = 0;
					return !pattern.test(v.text);
				});
				return { person: p, lemmas: p.strongs.map((s) => lemmas.get(s)).filter((l): l is string => Boolean(l)), unlinked, total: vs.length };
			})
			.filter((q) => q.unlinked.length > 0 && 1 - q.unlinked.length / q.total < AI_SKIP_COVERAGE)
			.map((q) => ({ person: q.person, lemmas: q.lemmas, samples: q.unlinked.slice(0, AI_SAMPLE_VERSES) }));

		console.log(`  model: ${queue.length} people need names (${Math.ceil(queue.length / AI_BATCH)} calls)`);
		for (let i = 0; i < queue.length; i += AI_BATCH) {
			const batch = queue.slice(i, i + AI_BATCH);
			let proposed: Map<string, string[]>;
			try {
				proposed = await aiCandidates(client, r, batch);
			} catch (e) {
				console.log(`    batch ${i / AI_BATCH + 1} failed: ${e instanceof Error ? e.message : e}`);
				continue;
			}
			const batchRows: { id: string; term: string }[] = [];
			for (const { person } of batch) {
				const kept = validate(proposed.get(person.id) ?? [], verses.get(person.id)!, [...englishTerms(person), ...localized.get(person.id)!]);
				for (const term of kept) batchRows.push({ id: person.id, term });
				localized.get(person.id)!.push(...kept);
			}
			aiRows.push(...batchRows);
			if (!args.dryRun) await insertAliases(pool, r.lang, "ai", batchRows);
			if ((i / AI_BATCH + 1) % 10 === 0) console.log(`    ${Math.min(i + AI_BATCH, queue.length)}/${queue.length}`);
		}
		console.log(`  model: ${aiRows.length} validated names for ${new Set(aiRows.map((a) => a.id)).size} people`);
	}

	const after = withText.reduce((n, p) => n + linkedCount(verses.get(p.id)!, [...englishTerms(p), ...localized.get(p.id)!]), 0);
	const pct = (n: number) => (totalVerses ? `${((100 * n) / totalVerses).toFixed(1)}%` : "n/a");
	console.log(`  inline coverage: ${pct(before)} -> ${pct(after)}${args.dryRun ? " (dry run, nothing written)" : ""}`);

	const sample = [...alignmentRows, ...aiRows].slice(0, 12);
	if (sample.length) {
		const bySlug = new Map(people.map((p) => [p.id, p.name]));
		console.log(`  e.g. ${sample.map((s) => `${bySlug.get(s.id)} → ${s.term}`).join(", ")}`);
	}
}

async function main() {
	const args = parseArgs();
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });

	const { rows: t } = await pool.query(`SELECT to_regclass('entity_alias') IS NOT NULL AS present`);
	if (!t[0].present) throw new Error("entity_alias missing — npm run migrate -- 0034_entity_localized_names.sql");

	const targets = RECOMMENDED_BIBLES.filter((r) => r.lang !== "en" && args.langs.includes(r.lang));
	if (targets.length === 0) throw new Error(`no recommended translation for --lang ${args.langs.join(",")}`);

	const people = await loadPeople(pool, args);
	console.log(`${people.length} people with mentions${args.dryRun ? " — DRY RUN" : ""}`);
	await deriveStrongs(pool, people, args);

	const client = args.skipAi ? null : new OpenAI();
	for (const r of targets) await localize(pool, client, r, people, args);

	await pool.end();
}

main().catch((e) => {
	console.error("\nERROR:", e instanceof Error ? e.message : e);
	process.exit(1);
});
