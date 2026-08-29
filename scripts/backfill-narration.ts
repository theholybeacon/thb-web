/**
 * Pre-generates chapter narration so the Content API has audio — and, more to the
 * point, verse-level TIMING — to hand out.
 *
 * WHY: narration is produced the first time a premium reader presses Listen. That
 * is right for the product, but it means GET /api/content/v1/narration/{ref}
 * answers 404 for almost every passage, and the verse offsets that make animation
 * sync possible do not exist until someone has listened. This pre-generates a
 * chosen set of chapters.
 *
 * Generation is audioChapterGenerate() — the same code the player runs, so a
 * chapter produced here is byte-identical to one produced by a reader and is
 * shared by every canon variant carrying the same text. This script only chooses
 * WHICH chapters; it does not reimplement HOW.
 *
 * THIS ONE COSTS REAL MONEY. Every chapter is a text-to-speech call per verse.
 * `--dry-run` is the cost gate: it prints exact character counts and projected
 * audio minutes and generates nothing. Run it first, every time.
 *
 * Usage:
 *   npm run backfill:narration -- --chapters psa-23,jhn-3 --dry-run
 *   npm run backfill:narration -- --chapters psa-23,jhn-3
 *   npm run backfill:narration -- --chapters psa-23 --voice onyx
 *   npm run backfill:narration -- --daily-verses --dry-run   # every chapter the daily rotation needs
 *
 * Refuses translations not cleared for narration, and chapters whose text is not
 * cached yet (run `npm run warm:bible` first). Idempotent: a chapter already
 * `ready` for that voice is skipped.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { parseReference } from "../src/lib/contentApi/reference";
import { DAILY_VERSES } from "../src/lib/dailyVerses";

/**
 * audioChapterGenerate reaches the shared Drizzle client, which calls
 * neon(process.env.DATABASE_URL) at module load. A static import is hoisted above
 * the config() call above, so it would construct the client before the env file is
 * read. Imported inside main() instead.
 */
type GenerateFn = typeof import("../src/app/common/audio/service/audioChapterGenerate").audioChapterGenerate;

/**
 * Calibration for the cost estimate, measured from the one asset that already
 * exists: Genesis 2 in bsb-en, 4,254 characters of verse text -> 241,992 ms of
 * audio. That is ~56.9 ms per character. Close enough to plan a spend against;
 * the real duration is whatever the synthesis returns.
 */
const MS_PER_CHAR = 56.9;

interface Args {
	chapters: string[];
	translation: string;
	voice: string;
	dryRun: boolean;
	dailyVerses: boolean;
}

function parseArgs(): Args {
	const argv = process.argv.slice(2);
	const value = (flag: string) => {
		const i = argv.indexOf(flag);
		return i >= 0 ? argv[i + 1] : undefined;
	};
	const raw = value("--chapters");
	return {
		chapters: raw ? raw.split(",").map((c) => c.trim()).filter(Boolean) : [],
		translation: value("--translation") ?? "bsb-en",
		voice: value("--voice") ?? "sage",
		dryRun: argv.includes("--dry-run"),
		dailyVerses: argv.includes("--daily-verses"),
	};
}

type Target = {
	ref: string;
	usfm: string;
	chapter: number;
	bookName: string;
	verses: number;
	chars: number;
	hasText: boolean;
	alreadyReady: boolean;
};

function formatMs(ms: number): string {
	const total = Math.round(ms / 1000);
	return `${Math.floor(total / 60)}m${String(total % 60).padStart(2, "0")}s`;
}

async function main() {
	const args = parseArgs();

	// Every chapter the daily rotation touches — the set most worth narrating,
	// since that is what a daily pipeline reaches for.
	const refs = args.dailyVerses
		? [...new Set(DAILY_VERSES.map((v) => `${v.bookAbbreviation.toLowerCase()}-${v.chapter}`))]
		: args.chapters;

	if (refs.length === 0) {
		console.error("Nothing to do. Pass --chapters gen-1,psa-23 or --daily-verses.");
		process.exit(1);
	}

	const pool = new Pool({ connectionString: process.env.DATABASE_URL });

	const bible = await pool.query<{ id: string; name: string; audioEnabled: boolean }>(
		`SELECT id, name, "audioEnabled" FROM "bible" WHERE slug = $1`,
		[args.translation],
	);
	if (bible.rowCount === 0) {
		console.error(`No translation with slug "${args.translation}".`);
		await pool.end();
		process.exit(1);
	}
	if (!bible.rows[0].audioEnabled) {
		// The licence gate would refuse anyway; failing here says why, once,
		// instead of once per chapter.
		console.error(
			`${bible.rows[0].name} is not cleared for narration (bible.audioEnabled = false).\n` +
				`Only public-domain / open-licensed translations may be synthesized — see src/lib/bibleLicense.ts.`,
		);
		await pool.end();
		process.exit(1);
	}
	const bibleId = bible.rows[0].id;

	const targets: Target[] = [];
	for (const raw of refs) {
		let parsed;
		try {
			parsed = parseReference(raw);
		} catch (err) {
			console.error(`  ! "${raw}" is not a reference: ${err instanceof Error ? err.message : err}`);
			continue;
		}

		// Verse text, and whether narration for this exact text + voice already
		// exists. Matched on contentHash because that is the real storage key.
		const { rows } = await pool.query<{
			book_name: string;
			verses: number;
			chars: number;
			ready: boolean;
		}>(
			`SELECT bk.name AS book_name,
                    count(v.id)::int AS verses,
                    coalesce(sum(length(btrim(v.content))), 0)::int AS chars,
                    EXISTS (
                      SELECT 1 FROM "audio_asset" a
                       WHERE a."cacheKey" = 'chapter:' || c."contentHash" || ':' || $4
                         AND a."generationStatus" = 'ready'
                    ) AS ready
               FROM "chapter" c
               JOIN "book" bk ON bk.id = c."bookId"
               LEFT JOIN "verse" v ON v."chapterId" = c.id
              WHERE bk."bibleId" = $1
                AND upper(bk.abbreviation) = $2
                AND c."chapterNumber" = $3
              GROUP BY bk.name, c."contentHash"`,
			[bibleId, parsed.usfm, parsed.chapter, args.voice],
		);

		const row = rows[0];
		targets.push({
			ref: raw,
			usfm: parsed.usfm,
			chapter: parsed.chapter,
			bookName: row?.book_name ?? parsed.book.englishName,
			verses: row?.verses ?? 0,
			chars: row?.chars ?? 0,
			hasText: (row?.verses ?? 0) > 0,
			alreadyReady: row?.ready ?? false,
		});
	}

	const cold = targets.filter((t) => !t.hasText);
	const ready = targets.filter((t) => t.hasText && t.alreadyReady);
	const todo = targets.filter((t) => t.hasText && !t.alreadyReady);

	console.log(`Translation: ${bible.rows[0].name} (${args.translation})   Voice: ${args.voice}\n`);

	if (ready.length > 0) {
		console.log(`Already narrated (${ready.length}): ${ready.map((t) => t.ref).join(", ")}\n`);
	}
	if (cold.length > 0) {
		console.log(`No cached text — cannot narrate (${cold.length}):`);
		console.log(`  ${cold.map((t) => t.ref).join(", ")}`);
		console.log(`  Fix with: npm run warm:bible -- --bible ${args.translation}\n`);
	}

	if (todo.length === 0) {
		console.log("Nothing to generate.");
		await pool.end();
		return;
	}

	const totalChars = todo.reduce((n, t) => n + t.chars, 0);
	const totalVerses = todo.reduce((n, t) => n + t.verses, 0);
	const estMs = totalChars * MS_PER_CHAR;

	console.log(`To generate (${todo.length}):\n`);
	console.log(`  ${"chapter".padEnd(22)} ${"verses".padStart(6)} ${"chars".padStart(8)} ${"est. audio".padStart(11)}`);
	for (const t of todo) {
		const label = `${t.bookName} ${t.chapter}`;
		console.log(
			`  ${label.padEnd(22)} ${String(t.verses).padStart(6)} ${String(t.chars).padStart(8)} ${formatMs(t.chars * MS_PER_CHAR).padStart(11)}`,
		);
	}
	console.log(`  ${"".padEnd(22)} ${"------".padStart(6)} ${"--------".padStart(8)} ${"-----------".padStart(11)}`);
	console.log(
		`  ${"TOTAL".padEnd(22)} ${String(totalVerses).padStart(6)} ${String(totalChars).padStart(8)} ${formatMs(estMs).padStart(11)}`,
	);

	console.log(
		`\nCOST: ${totalVerses + todo.length} text-to-speech calls (one per verse, plus a heading per chapter),\n` +
			`      producing roughly ${formatMs(estMs)} of audio. Estimate is calibrated from an existing\n` +
			`      chapter at ~${MS_PER_CHAR}ms per character; check it against the current\n` +
			`      gpt-4o-mini-tts rate before running without --dry-run.`,
	);

	if (args.dryRun) {
		console.log("\n(--dry-run: nothing generated, nothing spent)");
		await pool.end();
		return;
	}

	const audioChapterGenerate: GenerateFn = (
		await import("../src/app/common/audio/service/audioChapterGenerate")
	).audioChapterGenerate;

	console.log("\nGenerating (sequential — TTS is the slow, billable part)…\n");

	let done = 0;
	let failed = 0;

	for (const t of todo) {
		process.stdout.write(`  ${t.bookName} ${t.chapter} … `);
		try {
			const asset = await audioChapterGenerate({
				bibleId,
				bookAbbreviation: t.usfm,
				chapterNumber: t.chapter,
				voice: args.voice,
			});

			if (asset?.generationStatus === "ready") {
				done++;
				console.log(
					`✓ ${formatMs(asset.durationMs ?? 0)}, ${asset.segments.length} segments, ` +
						`${Math.round((asset.byteSize ?? 0) / 1024)} KB`,
				);
			} else {
				failed++;
				console.log(`✗ ${asset?.error ?? asset?.generationStatus ?? "unknown"}`);
			}
		} catch (err) {
			failed++;
			console.log(`✗ ${err instanceof Error ? err.message : String(err)}`);
		}
	}

	console.log("\n====================================================");
	console.log(`Narrated: ${done}`);
	console.log(`Failed:   ${failed}`);

	await pool.end();
}

main().catch((err) => {
	console.error(`\nERROR: ${err instanceof Error ? err.message : String(err)}`);
	process.exit(1);
});
