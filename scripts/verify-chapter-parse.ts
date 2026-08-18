/**
 * Proves the whole-chapter fetch reproduces what the old per-verse fetch stored.
 *
 * The reader's paragraph and poetry layout is derived from whitespace inside
 * verse.content (see src/app/common/verse/model/verseLayout.ts), so a change in
 * how that text is obtained is only safe if the resulting bytes match. This
 * fetches a chapter we ALREADY hold and diffs the parse against the stored
 * rows, verse by verse.
 *
 * Run this before a warm run, and any time api.bible's payload might have
 * changed. It costs one request per chapter checked.
 *
 * Usage:
 *   npx tsx scripts/verify-chapter-parse.ts                  # a few known chapters
 *   npx tsx scripts/verify-chapter-parse.ts --bible kjv-en --book GEN --chapter 1
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { parseChapterText } from "../src/app/common/chapter/model/parseChapterText";

const BASE_URL = "https://api.scripture.api.bible/v1/";
const API_KEY = process.env.BIBLE_API_KEY;

interface Target { bible: string; book: string; chapter: number }

function targets(): Target[] {
	const argv = process.argv.slice(2);
	const val = (f: string) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
	const bible = val("--bible");
	if (bible) {
		return [{ bible, book: val("--book") ?? "GEN", chapter: Number(val("--chapter") ?? 1) }];
	}
	// Prose, poetry and a non-English edition — the shapes the layout code cares
	// about. All three already hold stored text to diff against; the KJV entry
	// also exercises the leading-¶ paragraph convention.
	return [
		{ bible: "kjv-en", book: "GEN", chapter: 1 },
		{ bible: "asv-en", book: "PRO", chapter: 3 },
		{ bible: "rvr09-sp", book: "GEN", chapter: 1 },
	];
}

async function main() {
	if (!API_KEY) { console.error("BIBLE_API_KEY is not set"); process.exit(1); }
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	let mismatches = 0;
	let checked = 0;

	for (const t of targets()) {
		const { rows: meta } = await pool.query<{ bible_api_id: string; chapter_id: string }>(
			`SELECT bi."apiId" AS bible_api_id, c.id AS chapter_id
			   FROM "bible" bi
			   JOIN "book" bk ON bk."bibleId" = bi.id
			   JOIN "chapter" c ON c."bookId" = bk.id AND c."chapterNumber" = $3
			  WHERE bi.slug = $1 AND bk."apiId" = $2
			  LIMIT 1`,
			[t.bible, t.book, t.chapter],
		);
		if (!meta[0]) {
			console.log(`SKIP ${t.bible} ${t.book} ${t.chapter} — no stored chapter to compare against`);
			continue;
		}

		const { rows: stored } = await pool.query<{ verseNumber: number; content: string }>(
			`SELECT "verseNumber", "content" FROM "verse" WHERE "chapterId" = $1 ORDER BY "verseNumber"`,
			[meta[0].chapter_id],
		);
		if (stored.length === 0) {
			console.log(`SKIP ${t.bible} ${t.book} ${t.chapter} — stored chapter is empty`);
			continue;
		}

		const url =
			`${BASE_URL}bibles/${meta[0].bible_api_id}/chapters/${t.book}.${t.chapter}` +
			`?content-type=text&include-verse-numbers=true` +
			`&include-notes=false&include-titles=false&include-chapter-numbers=false` +
			`&include-verse-spans=false&use-org-id=false`;
		const res = await fetch(url, { headers: { "api-key": API_KEY } });
		if (!res.ok) {
			console.log(`FAIL ${t.bible} ${t.book} ${t.chapter} — HTTP ${res.status} ${(await res.text()).slice(0, 100)}`);
			mismatches++;
			continue;
		}
		const body = (await res.json()) as { data?: { content?: string; verseCount?: number } };
		const raw = body.data?.content ?? "";
		const parsed = parseChapterText(raw);

		console.log(`\n=== ${t.bible} ${t.book} ${t.chapter} ===`);
		console.log(`stored ${stored.length} verses | parsed ${parsed.length} | api verseCount ${body.data?.verseCount ?? "-"}`);
		console.log(`raw payload head: ${JSON.stringify(raw.slice(0, 160))}`);

		checked++;
		const byNumber = new Map(parsed.map((v) => [v.verseNumber, v.content]));
		let exact = 0, trimmed = 0, differs = 0, missing = 0;
		for (const s of stored) {
			const p = byNumber.get(s.verseNumber);
			if (p === undefined) { missing++; continue; }
			if (p === s.content) exact++;
			else if (p.trim() === s.content.trim()) trimmed++;
			else {
				differs++;
				if (differs <= 2) {
					console.log(`  v${s.verseNumber} stored: ${JSON.stringify(s.content.slice(0, 90))}`);
					console.log(`  v${s.verseNumber} parsed: ${JSON.stringify(p.slice(0, 90))}`);
				}
			}
		}
		console.log(`  exact ${exact} | whitespace-only diff ${trimmed} | text differs ${differs} | missing ${missing}`);
		if (differs > 0 || missing > 0) mismatches++;
	}

	console.log(`\n${"=".repeat(52)}`);
	if (checked === 0) console.log("Nothing checked.");
	else if (mismatches === 0) console.log("PASS — parsed text matches stored text.");
	else console.log(`REVIEW — ${mismatches} chapter(s) did not match. Do not warm until resolved.`);

	await pool.end();
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
