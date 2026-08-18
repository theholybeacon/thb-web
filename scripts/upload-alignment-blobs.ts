/**
 * Uploads the alignment corpora and Strong's lexicon to Vercel Blob, so the app
 * can rebuild `alignment_word` and `strongs_entry` on demand instead of needing
 * a developer with a Python toolchain after every database reset.
 *
 *   npm run upload:alignment              # every extracted source + the lexicon
 *   npm run upload:alignment -- bsb       # one source
 *   npm run upload:alignment -- --lexicon # lexicon only
 *   npm run upload:alignment -- --audit   # report what is in Blob, upload nothing
 *
 * Requires the JSONL produced by scripts/alignment/extract_sword.py. Idempotent:
 * pathnames are deterministic, so re-running overwrites in place.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createReadStream, existsSync } from "fs";
import { createInterface } from "readline";
import { join } from "path";
import {
	AlignmentBlobDao,
	bookPathname,
	lexiconPathname,
} from "../src/app/common/alignment/dao/AlignmentBlobDao";

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

/** Groups a source's single JSONL into one payload per book, in file order. */
async function splitByBook(file: string): Promise<Map<string, string[]>> {
	const byBook = new Map<string, string[]>();
	const reader = createInterface({ input: createReadStream(file, "utf8"), crlfDelay: Infinity });
	for await (const line of reader) {
		if (!line.trim()) continue;
		const book = (JSON.parse(line) as { b?: string }).b;
		if (!book) continue;
		const bucket = byBook.get(book);
		if (bucket) bucket.push(line);
		else byBook.set(book, [line]);
	}
	return byBook;
}

async function uploadSource(dao: AlignmentBlobDao, code: string): Promise<void> {
	const file = join(DATA_DIR, `${code}.jsonl`);
	if (!existsSync(file)) {
		console.log(`  ${code}: no JSONL at ${file} — run extract_sword.py first. Skipping.`);
		return;
	}

	process.stdout.write(`  ${code}: splitting… `);
	const byBook = await splitByBook(file);
	console.log(`${byBook.size} books`);

	let done = 0;
	let bytes = 0;
	for (const [book, lines] of byBook) {
		const body = lines.join("\n") + "\n";
		bytes += body.length;
		await dao.upload(bookPathname(code, book), body, "application/x-ndjson");
		done++;
		if (done % 10 === 0) process.stdout.write(`    ${done}/${byBook.size}…\n`);
	}
	console.log(`    ${done} books uploaded, ${Math.round(bytes / 1024 / 1024)} MB`);
}

/**
 * Normalises the openscriptures CommonJS modules into plain JSON before upload,
 * so the runtime loader never has to slice a JS object literal out of a file it
 * fetched over the network.
 */
async function uploadLexicon(dao: AlignmentBlobDao): Promise<void> {
	for (const { language, url, global } of LEXICONS) {
		process.stdout.write(`  ${language}: downloading… `);
		const res = await fetch(url);
		if (!res.ok) throw new Error(`lexicon fetch failed: ${res.status}`);
		const js = await res.text();

		const start = js.indexOf("{", js.indexOf(`var ${global}`));
		const end = js.lastIndexOf("};");
		if (start === -1 || end === -1) throw new Error(`could not locate ${global} object literal`);
		const json = js.slice(start, end + 1);
		JSON.parse(json); // fail here rather than at runtime

		await dao.upload(lexiconPathname(language), json, "application/json");
		console.log(`uploaded ${Math.round(json.length / 1024)} kB`);
	}
}

async function audit(dao: AlignmentBlobDao, codes: string[]): Promise<void> {
	for (const code of codes) {
		const books = await dao.listBooks(code);
		console.log(`  ${code}: ${books.length} books in Blob`);
		if (books.length && books.length !== 66) {
			console.log(`    ⚠ expected 66 — present: ${books.join(",")}`);
		}
	}
	for (const { language } of LEXICONS) {
		const url = await dao.resolveUrl(lexiconPathname(language));
		console.log(`  lexicon/${language}: ${url ? "present" : "MISSING"}`);
	}
}

async function main() {
	if (!process.env.BLOB_READ_WRITE_TOKEN) {
		console.error("BLOB_READ_WRITE_TOKEN is not set — cannot reach Vercel Blob.");
		process.exit(1);
	}

	const args = process.argv.slice(2);
	const lexiconOnly = args.includes("--lexicon");
	const auditOnly = args.includes("--audit");
	const codes = args.filter((a) => !a.startsWith("--"));
	const targets = codes.length > 0 ? codes : ["bsb", "frejnd"];

	const dao = new AlignmentBlobDao();

	if (auditOnly) {
		console.log("Blob audit:");
		await audit(dao, targets);
		return;
	}

	if (!codes.length || lexiconOnly) {
		console.log("Lexicon:");
		await uploadLexicon(dao);
	}

	if (!lexiconOnly) {
		console.log("\nAlignment sources:");
		for (const code of targets) await uploadSource(dao, code);
	}

	console.log("\nFinal audit:");
	await audit(dao, targets);
}

main().catch((e) => {
	console.error("\nFAILED:", e);
	process.exit(1);
});
