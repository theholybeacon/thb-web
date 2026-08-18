/**
 * Seeds the Strong's lexicon and word-level alignment data.
 *
 * Idempotent: the lexicon upserts by Strong's id, and each alignment source is
 * deleted and re-inserted wholesale, so re-running never duplicates rows.
 *
 *   npm run seed:alignment                # lexicon + every extracted source
 *   npm run seed:alignment -- bsb         # one source
 *   npm run seed:alignment -- --lexicon   # lexicon only
 *
 * Alignment JSONL must be produced first — see scripts/alignment/extract_sword.py.
 * Uses a raw `pg` Pool rather than the drizzle/neon-http client because this
 * writes ~380k rows per source and the HTTP driver round-trips every statement.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createReadStream, existsSync } from "fs";
import { createInterface } from "readline";
import { join } from "path";
import { Pool } from "pg";
import { normalizeStrongs } from "../src/lib/strongs";
import { parseAlignmentVerse, type AlignmentJsonlVerse } from "../src/app/common/alignment/model/parseAlignmentJsonl";

const DATA_DIR = join(process.cwd(), "scripts", "alignment", "data");

const LEXICONS = [
	{
		language: "greek" as const,
		url: "https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js",
		global: "strongsGreekDictionary",
	},
	{
		language: "hebrew" as const,
		url: "https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js",
		global: "strongsHebrewDictionary",
	},
];

/** Greek uses `translit`; Hebrew uses `xlit` + `pron`. Same file family, different keys. */
interface LexiconRecord {
	lemma?: string;
	translit?: string;
	xlit?: string;
	pron?: string;
	strongs_def?: string;
	kjv_def?: string;
	derivation?: string;
}

const INSERT_BATCH = 1000;

/**
 * Hand-verified anchors, checked after every import.
 *
 * A source can be perfectly licensed, parse cleanly and report "100% tagged"
 * while its Strong's numbers sit on the wrong words — CrossWire's ASV attaches
 * G3004 (λέγω, "saith") to "to" and leaves "lovest thou" unwrapped. Nothing
 * mechanical caught that; only reading the output did. So every source must
 * assert a few known word→Strong's pairs, and adding a source means adding its
 * anchors here first.
 *
 * Keep these to unambiguous cases: proper nouns, and the ἀγαπάω/φιλέω contrast
 * in John 21 that the whole feature exists to surface.
 */
const ANCHORS: Record<string, { ref: [string, number, number]; surface: string; strongs: string }[]> = {
	bsb: [
		{ ref: ["JHN", 21, 15], surface: "do you love", strongs: "G0025" },
		{ ref: ["JHN", 21, 17], surface: "do you love", strongs: "G5368" },
		{ ref: ["GEN", 1, 1], surface: "god", strongs: "H0430" },
	],
	frejnd: [
		{ ref: ["JHN", 21, 15], surface: "aimes", strongs: "G0025" },
		{ ref: ["JHN", 21, 17], surface: "aimes", strongs: "G5368" },
		{ ref: ["GEN", 1, 1], surface: "dieu", strongs: "H0430" },
	],
	// Fetched live from api.bible rather than seeded from JSONL, so it is loaded
	// a chapter at a time and only the chapters readers have opened exist. The
	// anchors therefore stay inside John 21 — a Genesis anchor would fail merely
	// because nobody had read Genesis yet. Verify with:
	//   npm run seed:alignment -- --verify-only l1912
	l1912: [
		{ ref: ["JHN", 21, 15], surface: "lieber", strongs: "G0025" },
		{ ref: ["JHN", 21, 15], surface: "liebhabe", strongs: "G5368" },
		{ ref: ["JHN", 21, 17], surface: "lieb", strongs: "G5368" },
	],
};

/** Fails loudly rather than shipping a source that answers confidently wrong. */
async function verifySource(pool: Pool, code: string): Promise<boolean> {
	const anchors = ANCHORS[code];
	if (!anchors) {
		console.log(`  ${code}: NO ANCHORS DEFINED — add them to ANCHORS before trusting this source.`);
		return false;
	}
	let ok = true;
	for (const { ref, surface, strongs } of anchors) {
		const [book, chapter, verse] = ref;
		const { rows } = await pool.query(
			`SELECT "strongs" FROM alignment_word
			 WHERE "sourceCode"=$1 AND "bookAbbreviation"=$2 AND chapter=$3 AND verse=$4
			   AND "surfaceNorm"=$5 ORDER BY "wordIndex" LIMIT 1`,
			[code, book, chapter, verse, surface]);
		const got: string[] = rows[0]?.strongs ?? [];
		if (!got.includes(strongs)) {
			ok = false;
			console.log(`  ✗ ${code} ${book} ${chapter}:${verse} "${surface}" expected ${strongs}, got ${got.length ? got.join(",") : "(no row)"}`);
		}
	}
	if (ok) console.log(`  ✓ ${code}: ${anchors.length} anchors verified`);
	return ok;
}

async function importLexicon(pool: Pool): Promise<void> {
	for (const { language, url, global } of LEXICONS) {
		process.stdout.write(`  ${language}: downloading… `);
		const res = await fetch(url);
		if (!res.ok) throw new Error(`lexicon fetch failed: ${res.status}`);
		const js = await res.text();

		// The file is a CommonJS module wrapping one big object literal. Slice the
		// literal out rather than eval'ing third-party JS.
		const start = js.indexOf("{", js.indexOf(`var ${global}`));
		const end = js.lastIndexOf("};");
		if (start === -1 || end === -1) throw new Error(`could not locate ${global} object literal`);
		const dict = JSON.parse(js.slice(start, end + 1)) as Record<string, LexiconRecord>;

		const rows: unknown[][] = [];
		for (const [rawId, rec] of Object.entries(dict)) {
			const strongs = normalizeStrongs(rawId);
			if (!strongs) continue; // out-of-range ids are grammar codes, not lexemes
			rows.push([
				strongs,
				language,
				rec.lemma ?? null,
				rec.translit ?? rec.xlit ?? null,
				rec.pron ?? null,
				(rec.strongs_def ?? "").trim() || null,
				(rec.kjv_def ?? "").trim() || null,
				(rec.derivation ?? "").trim() || null,
				"openscriptures",
			]);
		}

		for (let i = 0; i < rows.length; i += INSERT_BATCH) {
			const batch = rows.slice(i, i + INSERT_BATCH);
			const values = batch
				.map((_, r) => `(${Array.from({ length: 9 }, (_, c) => `$${r * 9 + c + 1}`).join(",")})`)
				.join(",");
			await pool.query(
				`INSERT INTO strongs_entry
				   ("strongs","language","lemma","translit","pronunciation","definition","shortDefinition","derivation","source")
				 VALUES ${values}
				 ON CONFLICT ("strongs") DO UPDATE SET
				   "language"=excluded."language", "lemma"=excluded."lemma",
				   "translit"=excluded."translit", "pronunciation"=excluded."pronunciation",
				   "definition"=excluded."definition", "shortDefinition"=excluded."shortDefinition",
				   "derivation"=excluded."derivation", "source"=excluded."source",
				   "updatedAt"=now()`,
				batch.flat(),
			);
		}
		console.log(`${rows.length} entries`);
	}

	// Same reasoning as the book rows: tell the runtime the lexicon is present so
	// strongsLexiconEnsureSS does not re-download it on the next lookup.
	await pool.query(
		`INSERT INTO alignment_book ("sourceCode","bookAbbreviation","status","wordCount","loadedAt")
		 VALUES ('__lexicon__','__all__','ready',(SELECT count(*) FROM strongs_entry),now())
		 ON CONFLICT ("sourceCode","bookAbbreviation") DO UPDATE SET
		   "status"='ready', "wordCount"=excluded."wordCount",
		   "loadedAt"=now(), "error"=null, "updatedAt"=now()`);
}

async function importSource(pool: Pool, code: string): Promise<void> {
	const file = join(DATA_DIR, `${code}.jsonl`);
	if (!existsSync(file)) {
		console.log(`  ${code}: no JSONL at ${file} — run extract_sword.py first. Skipping.`);
		return;
	}

	process.stdout.write(`  ${code}: clearing… `);
	await pool.query(`DELETE FROM alignment_word WHERE "sourceCode" = $1`, [code]);

	let verses = 0;
	let inserted = 0;
	let pending: unknown[][] = [];

	const flush = async () => {
		if (pending.length === 0) return;
		const values = pending
			.map((_, r) => `(${Array.from({ length: 10 }, (_, c) => `$${r * 10 + c + 1}`).join(",")})`)
			.join(",");
		await pool.query(
			`INSERT INTO alignment_word
			   ("sourceCode","bookAbbreviation","chapter","verse","wordIndex","occurrence","surface","surfaceNorm","strongs","lemma")
			 VALUES ${values}`,
			pending.flat(),
		);
		inserted += pending.length;
		pending = [];
	};

	const reader = createInterface({ input: createReadStream(file, "utf8"), crlfDelay: Infinity });
	for await (const line of reader) {
		if (!line.trim()) continue;
		const verse = JSON.parse(line) as AlignmentJsonlVerse;

		// Row derivation lives in parseAlignmentJsonl so the seeder and the runtime
		// lazy loader cannot drift — see the note there on why `occurrence` makes
		// that a correctness issue rather than a tidiness one.
		for (const w of parseAlignmentVerse(code, verse)) {
			pending.push([
				w.sourceCode, w.bookAbbreviation, w.chapter, w.verse, w.wordIndex,
				w.occurrence, w.surface, w.surfaceNorm, w.strongs, w.lemma,
			]);
			if (pending.length >= INSERT_BATCH) await flush();
		}
		verses++;
		if (verses % 5000 === 0) process.stdout.write(`${verses}v… `);
	}
	await flush();

	// Mark the books ready in alignment_book, or the runtime would treat this
	// freshly seeded data as "never loaded" and re-fetch every book from Blob on
	// first read — undoing the whole point of seeding.
	await pool.query(
		`INSERT INTO alignment_book ("sourceCode","bookAbbreviation","status","wordCount","loadedAt")
		 SELECT "sourceCode","bookAbbreviation",'ready',count(*),now()
		 FROM alignment_word WHERE "sourceCode" = $1
		 GROUP BY "sourceCode","bookAbbreviation"
		 ON CONFLICT ("sourceCode","bookAbbreviation") DO UPDATE SET
		   "status"='ready', "wordCount"=excluded."wordCount",
		   "loadedAt"=now(), "error"=null, "updatedAt"=now()`,
		[code]);

	console.log(`${verses} verses, ${inserted} words`);
}

async function main() {
	const args = process.argv.slice(2);
	const lexiconOnly = args.includes("--lexicon");
	const verifyOnly = args.includes("--verify-only");
	const codes = args.filter((a) => !a.startsWith("--"));

	const pool = new Pool({ connectionString: process.env.DATABASE_URL });

	if (verifyOnly) {
		// Anchors read the database, not the JSONL, so this also covers sources
		// that have no corpus at all (api.bible-backed ones).
		console.log("Verifying anchors:");
		let allOk = true;
		for (const code of codes.length > 0 ? codes : Object.keys(ANCHORS)) {
			allOk = (await verifySource(pool, code)) && allOk;
		}
		await pool.end();
		process.exit(allOk ? 0 : 1);
	}

	console.log("Strong's lexicon:");
	await importLexicon(pool);

	if (!lexiconOnly) {
		const targets = codes.length > 0 ? codes : ["bsb", "frejnd"];
		console.log("\nAlignment sources:");
		for (const code of targets) await importSource(pool, code);
	}

	if (!lexiconOnly) {
		const targets = codes.length > 0 ? codes : ["bsb", "frejnd"];
		console.log("\nVerifying anchors:");
		let allOk = true;
		for (const code of targets) allOk = (await verifySource(pool, code)) && allOk;
		if (!allOk) {
			console.error("\nANCHOR VERIFICATION FAILED — this source's Strong's numbers sit on the wrong");
			console.error("words. Do NOT register it in ALIGNMENT_SOURCES; tier 3 is better than wrong.");
			await pool.end();
			process.exit(1);
		}
	}

	const { rows } = await pool.query(
		`SELECT "sourceCode", count(*)::int AS n FROM alignment_word GROUP BY "sourceCode" ORDER BY 1`);
	const lex = await pool.query(`SELECT "language", count(*)::int AS n FROM strongs_entry GROUP BY 1 ORDER BY 1`);
	console.log("\nTotals:");
	for (const r of lex.rows) console.log(`  strongs_entry  ${r.language}: ${r.n}`);
	for (const r of rows) console.log(`  alignment_word ${r.sourceCode}: ${r.n}`);

	await pool.end();
}

main().catch((e) => {
	console.error("\nFAILED:", e);
	process.exit(1);
});
