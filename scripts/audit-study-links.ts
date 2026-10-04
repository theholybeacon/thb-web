/**
 * Read-only audit: are alignment, dictionary and people actually connected for
 * every recommended translation?
 *
 * The three study links join to a translation three different ways —
 * alignment on `bible.version`, dictionary on the language, people on the
 * canonical reference plus name matching in the verse text — and nothing else
 * checks that any of them works outside English. This prints one block per
 * RECOMMENDED_BIBLES entry and exits non-zero if a hard check fails.
 *
 * SELECTs only: it never triggers a lazy load, a model call or a cache write,
 * so it is safe to point at production (which .env.local does).
 *
 * Usage: npm run audit:study-links [-- --lang fr]
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { RECOMMENDED_BIBLES, type RecommendedBible } from "../src/lib/recommendedBible";
import { languageNameToIso } from "../src/lib/bibleLanguage";
import { FALLBACK_SOURCE_CODE, sourceForVersion } from "../src/app/common/alignment/model/AlignmentSource";
import { ALIGNMENT_ANCHORS } from "../src/app/common/alignment/model/alignmentAnchors";
import { buildNamePattern } from "../src/lib/nameMatch";

/** Verses every translation should resolve original-language words for. */
const SAMPLE_VERSES: [string, number, number][] = [
	["GEN", 1, 1],
	["PSA", 23, 1],
	["JHN", 3, 16],
];

/** Below this share of mentions linking inline, the people check is flagged. */
const PEOPLE_MIN_COVERAGE = 0.6;

type Check = { label: string; ok: boolean; detail: string; hard: boolean };

function pct(n: number, d: number): string {
	return d === 0 ? "n/a" : `${((100 * n) / d).toFixed(1)}%`;
}

async function auditBible(pool: Pool, r: RecommendedBible, bsbBibleId: string | null, hasAliasTable: boolean): Promise<Check[]> {
	const checks: Check[] = [];

	// --- Bible row ---------------------------------------------------------
	const { rows: bibles } = await pool.query(
		`SELECT id, "language", "version" FROM bible WHERE slug = $1`,
		[r.slug],
	);
	const bible = bibles[0];
	checks.push({ label: "bible row", ok: Boolean(bible), detail: bible ? `version=${bible.version}` : "missing", hard: true });
	if (!bible) return checks;

	// --- Dictionary ----------------------------------------------------------
	const iso = languageNameToIso(bible.language);
	checks.push({
		label: "dictionary lang",
		ok: iso === r.lang,
		detail: `"${bible.language}" -> ${iso ?? "null"} (expected ${r.lang})`,
		hard: true,
	});
	const { rows: dictRows } = await pool.query(
		`SELECT count(*) FILTER (WHERE status = 'ready' AND jsonb_array_length(coalesce(payload->'entries', '[]'::jsonb)) > 0)::int AS ok,
		        count(*) FILTER (WHERE status = 'failed')::int AS failed,
		        count(*)::int AS total
		   FROM dictionary_entry WHERE lang = $1`,
		[r.lang],
	);
	checks.push({
		label: "dictionary cache",
		ok: true,
		detail: `${dictRows[0].ok}/${dictRows[0].total} cached lookups have definitions, ${dictRows[0].failed} failed (informational)`,
		hard: false,
	});

	// --- Alignment -----------------------------------------------------------
	const own = sourceForVersion(bible.version);
	const expectExact = r.features.alignment === "exact";
	checks.push({
		label: "alignment tier",
		ok: expectExact === Boolean(own),
		detail: own ? `exact via "${own.code}"` : `no own source -> ${r.features.alignment}`,
		hard: true,
	});

	const tierSource = own?.code ?? FALLBACK_SOURCE_CODE;
	const { rows: bookRows } = await pool.query(
		`SELECT status, count(*)::int AS n FROM alignment_book
		  WHERE "sourceCode" = $1 GROUP BY status`,
		[tierSource],
	);
	const byStatus = Object.fromEntries(bookRows.map((b) => [b.status, b.n]));
	checks.push({
		label: "alignment load",
		ok: !byStatus.failed,
		detail: `${tierSource}: ${JSON.stringify(byStatus)} (units; api.bible sources load per chapter on demand)`,
		hard: false,
	});

	if (own) {
		let passed = 0;
		const anchors = ALIGNMENT_ANCHORS[own.code] ?? [];
		for (const a of anchors) {
			const { rows } = await pool.query(
				`SELECT "strongs" FROM alignment_word
				  WHERE "sourceCode"=$1 AND "bookAbbreviation"=$2 AND chapter=$3 AND verse=$4 AND "surfaceNorm"=$5
				  ORDER BY "wordIndex" LIMIT 1`,
				[own.code, ...a.ref, a.surface],
			);
			if ((rows[0]?.strongs ?? []).includes(a.strongs)) passed++;
		}
		checks.push({
			label: "alignment anchors",
			ok: anchors.length > 0 && passed === anchors.length,
			detail: `${passed}/${anchors.length} (an unloaded chapter counts as a miss)`,
			hard: false,
		});
	}

	// The verse tier (and model inference, which is seeded from it) needs the
	// fallback source's words for the verse.
	const missing: string[] = [];
	for (const [book, ch, v] of SAMPLE_VERSES) {
		const { rows } = await pool.query(
			`SELECT 1 FROM alignment_word
			  WHERE "sourceCode"=$1 AND "bookAbbreviation"=$2 AND chapter=$3 AND verse=$4 LIMIT 1`,
			[FALLBACK_SOURCE_CODE, book, ch, v],
		);
		if (rows.length === 0) missing.push(`${book} ${ch}:${v}`);
	}
	checks.push({
		label: "verse tier",
		ok: missing.length === 0,
		detail: missing.length ? `no ${FALLBACK_SOURCE_CODE} words for ${missing.join(", ")}` : "sample verses resolvable",
		hard: true,
	});

	if (!own) {
		const { rows } = await pool.query(
			`SELECT status, count(*)::int AS n FROM alignment_inferred WHERE "bibleVersion" = $1 GROUP BY status`,
			[bible.version],
		);
		checks.push({
			label: "inferred cache",
			ok: true,
			detail: rows.length ? JSON.stringify(Object.fromEntries(rows.map((x) => [x.status, x.n]))) : "empty (fills on first lookup)",
			hard: false,
		});
	}

	// --- Versification ---------------------------------------------------------
	// Alignment and people are anchored to BSB numbering. Compare the chapters
	// both translations have loaded.
	if (bsbBibleId && r.slug !== "bsb-en") {
		const { rows } = await pool.query(
			`SELECT b."apiId" AS book, c."chapterNumber" AS ch, c."numVerses" AS n, bc."numVerses" AS bsb
			   FROM chapter c
			   JOIN book b ON b.id = c."bookId" AND b."bibleId" = $1
			   JOIN book bb ON bb."bibleId" = $2 AND bb."apiId" = b."apiId"
			   JOIN chapter bc ON bc."bookId" = bb.id AND bc."chapterNumber" = c."chapterNumber"
			  WHERE c."numVerses" > 0 AND bc."numVerses" > 0`,
			[bible.id, bsbBibleId],
		);
		const diffs = rows.filter((x) => x.n !== x.bsb);
		checks.push({
			label: "versification",
			ok: diffs.length === 0,
			detail:
				`${rows.length} shared chapters, ${diffs.length} differ` +
				(diffs.length ? `: ${diffs.slice(0, 8).map((d) => `${d.book} ${d.ch} (${d.n} vs ${d.bsb})`).join(", ")}${diffs.length > 8 ? ", …" : ""}` : ""),
			hard: false,
		});
	}

	// --- People ----------------------------------------------------------------
	const { rows: mentions } = await pool.query(
		`SELECT e.id, e.name, e.aliases, v.content,
		        ${hasAliasTable
		          ? `coalesce((SELECT array_agg(a.term) FROM entity_alias a WHERE a."entityId" = e.id AND a.lang = $2), '{}')`
		          : `'{}'::text[]`} AS localized
		   FROM entity_mention m
		   JOIN entity e ON e.id = m."entityId"
		   JOIN book b ON b."bibleId" = $1 AND b."apiId" = m."bookAbbreviation"
		   JOIN chapter c ON c."bookId" = b.id AND c."chapterNumber" = m.chapter
		   JOIN verse v ON v."chapterId" = c.id AND v."verseNumber" = m.verse
		  WHERE $2::text IS NOT NULL`,
		[bible.id, r.lang],
	);
	let linked = 0;
	const unlinked = new Map<string, number>();
	for (const m of mentions) {
		const terms = [m.name, ...((m.aliases as string[]) ?? []), ...((m.localized as string[]) ?? [])];
		const pattern = buildNamePattern(terms);
		if (pattern && pattern.test(String(m.content).normalize("NFC"))) linked++;
		else unlinked.set(m.name, (unlinked.get(m.name) ?? 0) + 1);
	}
	const worst = [...unlinked.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
	checks.push({
		label: "people inline",
		ok: mentions.length > 0 && linked / mentions.length >= PEOPLE_MIN_COVERAGE,
		detail:
			`${linked}/${mentions.length} mentions in loaded verses link (${pct(linked, mentions.length)})` +
			(worst.length ? `; top misses: ${worst.map(([n, c]) => `${n}×${c}`).join(", ")}` : ""),
		hard: false,
	});

	return checks;
}

async function main() {
	const langIdx = process.argv.indexOf("--lang");
	const onlyLang = langIdx >= 0 ? process.argv[langIdx + 1] : null;

	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const { rows: bsb } = await pool.query(`SELECT id FROM bible WHERE slug = 'bsb-en'`);
	const bsbBibleId: string | null = bsb[0]?.id ?? null;

	const { rows: aliasTable } = await pool.query(`SELECT to_regclass('entity_alias') IS NOT NULL AS present`);
	const hasAliasTable: boolean = aliasTable[0].present;
	if (!hasAliasTable) console.log("note: entity_alias not migrated yet — people coverage uses dataset names only.");

	let hardFailures = 0;
	for (const r of RECOMMENDED_BIBLES) {
		if (onlyLang && r.lang !== onlyLang) continue;
		console.log(`\n${r.lang.toUpperCase()}  ${r.slug}  (${r.label})`);
		for (const c of await auditBible(pool, r, bsbBibleId, hasAliasTable)) {
			const mark = c.ok ? "✓" : c.hard ? "✗" : "!";
			if (!c.ok && c.hard) hardFailures++;
			console.log(`  ${mark} ${c.label.padEnd(18)} ${c.detail}`);
		}
	}

	await pool.end();
	console.log(hardFailures ? `\n${hardFailures} hard failure(s).` : "\nNo hard failures.");
	process.exit(hardFailures ? 1 : 0);
}

main().catch((e) => {
	console.error("ERROR:", e.message);
	process.exit(1);
});
