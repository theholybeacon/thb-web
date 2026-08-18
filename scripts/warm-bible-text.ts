/**
 * Pre-populates Bible text so the reader serves chapters from our own database
 * instead of fetching them from api.bible on demand.
 *
 * WHY: the catalogue holds ~404 translations and text was hydrated lazily at
 * read time. With the daily API quota spent, every chapter we did not already
 * hold rendered as "No content available for this chapter". Warming the curated
 * translations takes them off the live path entirely.
 *
 * The worklist IS the resume mechanism — completed chapters simply stop
 * appearing in it, so a run picks up exactly where the last one stopped. There
 * is no checkpoint file to keep in sync.
 *
 * Usage:
 *   npx tsx scripts/warm-bible-text.ts                       # curated translations
 *   npx tsx scripts/warm-bible-text.ts --max 4000 --sleep 250
 *   npx tsx scripts/warm-bible-text.ts --bible vbl-sp-2      # one translation
 *   npx tsx scripts/warm-bible-text.ts --dry-run             # show the worklist only
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { INDEXED_TRANSLATION_SLUGS } from "../src/lib/seo";
import { chapterContentHash } from "../src/lib/chapterHash";
import { parseChapterText } from "../src/app/common/chapter/model/parseChapterText";

const BASE_URL = "https://api.scripture.api.bible/v1/";
const API_KEY = process.env.BIBLE_API_KEY;

interface Args {
	max: number;
	sleepMs: number;
	bibles: string[];
	dryRun: boolean;
}

function parseArgs(): Args {
	const argv = process.argv.slice(2);
	const value = (flag: string) => {
		const i = argv.indexOf(flag);
		return i >= 0 ? argv[i + 1] : undefined;
	};
	const bible = value("--bible");
	return {
		// Default leaves headroom under a 5,000/day cap so live reader traffic
		// still has quota to spend while a warm run is in progress.
		max: Number(value("--max") ?? 4000),
		sleepMs: Number(value("--sleep") ?? 250),
		bibles: bible ? [bible] : [...INDEXED_TRANSLATION_SLUGS],
		dryRun: argv.includes("--dry-run"),
	};
}

interface WorkItem {
	bible_slug: string;
	bible_api_id: string;
	book_id: string;
	book_api_id: string;
	book_name: string;
	chapter_number: number;
	chapter_id: string | null;
	num_verses: number;
	have: number;
}

/**
 * Every chapter the books claim exist, minus the ones we already hold whole.
 *
 * `generate_series` rather than a join on "chapter" on purpose: most missing
 * chapters have no row at all, so a chapter-driven query would not see them.
 */
const WORKLIST_SQL = `
SELECT bi.slug              AS bible_slug,
       bi."apiId"           AS bible_api_id,
       bk.id                AS book_id,
       bk."apiId"           AS book_api_id,
       bk.name              AS book_name,
       gs.n                 AS chapter_number,
       c.id                 AS chapter_id,
       coalesce(c."numVerses", 0) AS num_verses,
       (SELECT count(*) FROM "verse" v WHERE v."chapterId" = c.id)::int AS have
  FROM "bible" bi
  JOIN "book" bk ON bk."bibleId" = bi.id
  CROSS JOIN LATERAL generate_series(1, coalesce(bk."numChapters", 1)) AS gs(n)
  LEFT JOIN "chapter" c ON c."bookId" = bk.id AND c."chapterNumber" = gs.n
 WHERE bi.slug = ANY($1)
 ORDER BY bi.slug, bk."bookOrder", gs.n
`;

function needsWork(item: WorkItem): boolean {
	// -1 means upstream has no such chapter. Never spend a request on it again.
	if (item.num_verses < 0) return false;
	if (item.have === 0) return true;

	// numVerses was never written before this change, so every legacy row reads
	// 0 — and a chapter the old per-verse loop truncated at verse 5 looks just
	// as complete as a whole one. Re-fetching those is the only way to tell, and
	// it is what repairs them: the insert fills the gaps and the count is
	// recorded, so the chapter drops out of this worklist for good.
	if (item.num_verses === 0) return true;

	return item.have < item.num_verses;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type FetchOutcome =
	| { kind: "ok"; verses: { verseNumber: number; content: string }[]; verseCount: number | null }
	| { kind: "quota" }
	| { kind: "not_found" }
	| { kind: "retry"; afterMs: number }
	| { kind: "error"; detail: string };

async function fetchChapter(
	bibleApiId: string,
	bookApiId: string,
	chapterNumber: number,
): Promise<FetchOutcome> {
	const chapterId = `${bookApiId}.${chapterNumber === 0 ? "intro" : chapterNumber}`;
	const url =
		`${BASE_URL}bibles/${bibleApiId}/chapters/${chapterId}` +
		`?content-type=text&include-verse-numbers=true` +
		`&include-notes=false&include-titles=false&include-chapter-numbers=false` +
		`&include-verse-spans=false&use-org-id=false`;

	let res: Response;
	try {
		res = await fetch(url, {
			headers: { "api-key": API_KEY! },
			signal: AbortSignal.timeout(20_000),
		});
	} catch (e) {
		return { kind: "error", detail: e instanceof Error ? e.message : String(e) };
	}

	if (res.status === 404) return { kind: "not_found" };
	if (res.status === 403) {
		const body = await res.text().catch(() => "");
		if (/limit/i.test(body)) return { kind: "quota" };
		return { kind: "error", detail: `403 ${body.slice(0, 120)}` };
	}
	if (res.status === 429) {
		const retryAfter = Number(res.headers.get("retry-after"));
		return { kind: "retry", afterMs: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 5000 };
	}
	if (!res.ok) {
		return { kind: "error", detail: `${res.status} ${(await res.text().catch(() => "")).slice(0, 120)}` };
	}

	const body = (await res.json()) as { data?: { content?: string; verseCount?: number } };
	const verses = parseChapterText(body.data?.content ?? "");
	if (verses.length === 0) {
		return { kind: "error", detail: "parsed 0 verses (payload shape changed?)" };
	}
	return { kind: "ok", verses, verseCount: body.data?.verseCount ?? null };
}

async function main() {
	if (!API_KEY) {
		console.error("BIBLE_API_KEY is not set");
		process.exit(1);
	}
	const args = parseArgs();
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });

	const { rows } = await pool.query<WorkItem>(WORKLIST_SQL, [args.bibles]);
	const work = rows.filter(needsWork);

	const byBible = new Map<string, number>();
	for (const item of work) byBible.set(item.bible_slug, (byBible.get(item.bible_slug) ?? 0) + 1);

	console.log(`Translations: ${args.bibles.join(", ")}`);
	console.log(`Chapters known: ${rows.length}  |  needing text: ${work.length}`);
	for (const [slug, n] of [...byBible].sort()) console.log(`  ${slug.padEnd(12)} ${n}`);
	console.log(`Request budget: ${args.max}  |  delay: ${args.sleepMs}ms\n`);

	if (args.dryRun) {
		await pool.end();
		return;
	}

	let requests = 0;
	let filled = 0;
	let versesWritten = 0;
	let notFound = 0;
	let failed = 0;
	let stoppedOnQuota = false;

	for (const item of work) {
		if (requests >= args.max) {
			console.log(`\nRequest budget of ${args.max} reached — stopping.`);
			break;
		}

		let outcome = await fetchChapter(item.bible_api_id, item.book_api_id, item.chapter_number);
		requests++;

		// One retry for a rate limit; anything more and the daily cap is the real
		// constraint, not the per-second one.
		if (outcome.kind === "retry") {
			await sleep(outcome.afterMs);
			outcome = await fetchChapter(item.bible_api_id, item.book_api_id, item.chapter_number);
			requests++;
		}

		if (outcome.kind === "quota") {
			stoppedOnQuota = true;
			break;
		}

		const label = `${item.bible_slug} ${item.book_name} ${item.chapter_number}`;

		if (outcome.kind === "retry") {
			// Still rate limited after backing off once. Leave it for the next run
			// rather than spinning on it.
			failed++;
			console.log(`  429  ${label} — still rate limited, skipping`);
			await sleep(args.sleepMs);
			continue;
		}

		if (outcome.kind === "not_found") {
			notFound++;
			// Record it so tomorrow's run does not pay for the same 404.
			const chapterId = await ensureChapter(pool, item);
			await pool.query(`UPDATE "chapter" SET "numVerses" = -1, "updatedAt" = now() WHERE id = $1`, [chapterId]);
			console.log(`  404  ${label}`);
		} else if (outcome.kind === "error") {
			failed++;
			console.log(`  ERR  ${label} — ${outcome.detail}`);
		} else {
			const chapterId = await ensureChapter(pool, item);

			// One multi-row insert. ON CONFLICT DO NOTHING makes a re-run over a
			// partially written chapter fill only the gaps.
			const values: unknown[] = [];
			const tuples = outcome.verses.map((v, i) => {
				values.push(chapterId, v.verseNumber, v.content);
				return `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`;
			});
			const inserted = await pool.query(
				`INSERT INTO "verse" ("chapterId", "verseNumber", "content") VALUES ${tuples.join(", ")}
				 ON CONFLICT DO NOTHING RETURNING id`,
				values,
			);

			const numVerses = outcome.verseCount ?? outcome.verses.length;
			// Hash here too, so audio cache-sharing is warm before the first listener.
			const hash = outcome.verses.length === numVerses ? chapterContentHash(outcome.verses) : null;
			await pool.query(
				`UPDATE "chapter" SET "numVerses" = $2, "contentHash" = coalesce($3, "contentHash"), "updatedAt" = now() WHERE id = $1`,
				[chapterId, numVerses, hash],
			);

			filled++;
			versesWritten += inserted.rowCount ?? 0;
			if (filled % 25 === 0) console.log(`  ...${filled} chapters, ${requests} requests`);
		}

		await sleep(args.sleepMs);
	}

	console.log(`\n${"=".repeat(52)}`);
	if (stoppedOnQuota) {
		console.log("STOPPED: api.bible daily limit exceeded.");
		console.log("Re-run tomorrow — the worklist resumes where this left off.");
	}
	console.log(`Requests used:   ${requests}`);
	console.log(`Chapters filled: ${filled}`);
	console.log(`Verses written:  ${versesWritten}`);
	console.log(`Absent upstream: ${notFound}`);
	console.log(`Failed:          ${failed}`);
	console.log(`Remaining:       ${Math.max(0, work.length - filled - notFound)}`);

	await pool.end();
}

/** The chapter row for this work item, creating it only if it is missing. */
async function ensureChapter(pool: Pool, item: WorkItem): Promise<string> {
	if (item.chapter_id) return item.chapter_id;
	const inserted = await pool.query<{ id: string }>(
		`INSERT INTO "chapter" ("bookId", "chapterNumber") VALUES ($1, $2)
		 ON CONFLICT DO NOTHING RETURNING id`,
		[item.book_id, item.chapter_number],
	);
	if (inserted.rows[0]) return inserted.rows[0].id;
	const existing = await pool.query<{ id: string }>(
		`SELECT id FROM "chapter" WHERE "bookId" = $1 AND "chapterNumber" = $2 LIMIT 1`,
		[item.book_id, item.chapter_number],
	);
	return existing.rows[0].id;
}

main().catch((e) => {
	console.error("ERROR:", e.message);
	process.exit(1);
});
