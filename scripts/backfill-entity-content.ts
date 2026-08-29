/**
 * Pre-generates character profiles so they exist before anyone asks for them.
 *
 * WHY: profiles are written the first time a reader opens /bible/people/{slug}.
 * That is right for the product — nobody pays to generate 3,000 pages nobody
 * reads — but it means the Content API returns `profile.status: "not_generated"`
 * for almost every character. Anything consuming the API (the marketing pipeline
 * above all) then has scripture mentions but no narrative to work from.
 *
 * This fills that in deliberately, most-mentioned first, so the recognisable
 * names are covered without generating the ~2,700-person tail.
 *
 * Generation itself is entityContentGenerate() — the same code the page runs,
 * including the citation filtering that keeps profiles honest. This script only
 * chooses WHO; it does not reimplement HOW.
 *
 * Usage:
 *   npm run backfill:profiles -- --dry-run           # show the worklist only
 *   npm run backfill:profiles -- --top 100           # 100 most-mentioned people
 *   npm run backfill:profiles -- --slug moses_2108   # one person
 *   npm run backfill:profiles -- --top 50 --concurrency 4
 *
 * Costs one small model call per character. Idempotent: anything already `ready`
 * is skipped, so re-running only fills gaps.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";

/**
 * entityContentGenerate reaches the shared Drizzle client, which calls
 * neon(process.env.DATABASE_URL) at module load. A static import is hoisted
 * above the config() call above, so the client would be constructed before the
 * env file is read and throw "No database connection string". Imported inside
 * main() instead, once the environment exists.
 */
type GenerateFn = typeof import("../src/app/common/entity/service/entityContentGenerate").entityContentGenerate;

/**
 * A row left `generating` by a crashed run would never be retried:
 * claimForGeneration only claims `pending` or `failed`, and entity_content — unlike
 * audio_asset — has no reclaim sweep anywhere in the app. So this script does it.
 */
const STALE_GENERATION_MS = 10 * 60 * 1000;

interface Args {
	top: number;
	slug: string | null;
	dryRun: boolean;
	concurrency: number;
}

function parseArgs(): Args {
	const argv = process.argv.slice(2);
	const value = (flag: string) => {
		const i = argv.indexOf(flag);
		return i >= 0 ? argv[i + 1] : undefined;
	};
	return {
		top: Number(value("--top") ?? 100),
		slug: value("--slug") ?? null,
		dryRun: argv.includes("--dry-run"),
		// Modest by default: these are model calls, and a burst buys little.
		concurrency: Math.max(1, Number(value("--concurrency") ?? 3)),
	};
}

type WorkItem = { id: string; slug: string; name: string; mentions: number; status: string | null };

/**
 * Ranked by how many verses name the person. That is the same signal the product
 * uses to decide which character pages are substantial enough to index, so the
 * worklist front-loads exactly the people worth writing about.
 */
const WORKLIST_SQL = `
SELECT e.id,
       e.slug,
       e.name,
       count(m.id)::int      AS mentions,
       ec."generationStatus" AS status
  FROM "entity" e
  LEFT JOIN "entity_mention" m ON m."entityId" = e.id
  LEFT JOIN "entity_content" ec ON ec."entityId" = e.id
 WHERE ($1::text IS NULL OR e.slug = $1)
 GROUP BY e.id, e.slug, e.name, ec."generationStatus"
 ORDER BY count(m.id) DESC, e.name ASC
`;

async function main() {
	const args = parseArgs();
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });

	const entityContentGenerate: GenerateFn = (
		await import("../src/app/common/entity/service/entityContentGenerate")
	).entityContentGenerate;

	// Return crashed generations to `failed` so claimForGeneration can pick them
	// up. Age-guarded, so a run happening right now is never stolen.
	const reclaimed = await pool.query(
		`UPDATE "entity_content"
            SET "generationStatus" = 'failed',
                "error" = 'reclaimed: generation stalled',
                "updatedAt" = now()
          WHERE "generationStatus" = 'generating'
            AND "updatedAt" < now() - ($1::int * interval '1 millisecond')
        RETURNING "entityId"`,
		[STALE_GENERATION_MS],
	);
	if (reclaimed.rowCount) {
		console.log(`Reclaimed ${reclaimed.rowCount} stalled generation(s).`);
	}

	const { rows } = await pool.query<WorkItem>(WORKLIST_SQL, [args.slug]);

	if (args.slug && rows.length === 0) {
		console.error(`\nNo character with slug "${args.slug}".`);
		await pool.end();
		process.exit(1);
	}

	const pending = rows.filter((r) => r.status !== "ready");
	const worklist = args.slug ? pending : pending.slice(0, args.top);

	const alreadyReady = rows.length - pending.length;
	console.log(`Characters considered: ${rows.length}`);
	console.log(`  already generated:   ${alreadyReady}`);
	console.log(`  to generate now:     ${worklist.length}`);
	if (!args.slug && pending.length > worklist.length) {
		// Never let a cap look like completeness.
		console.log(`  left after this run: ${pending.length - worklist.length} (raise --top to go deeper)`);
	}

	if (worklist.length === 0) {
		console.log("\nNothing to do.");
		await pool.end();
		return;
	}

	console.log("\nWorklist (most-mentioned first):");
	for (const item of worklist.slice(0, 15)) {
		console.log(`  ${item.name.padEnd(28)} ${String(item.mentions).padStart(5)} mentions  ${item.slug}`);
	}
	if (worklist.length > 15) console.log(`  … and ${worklist.length - 15} more`);

	if (args.dryRun) {
		console.log("\n(--dry-run: nothing generated)");
		await pool.end();
		return;
	}

	console.log(`\nGenerating with concurrency ${args.concurrency}…\n`);

	let done = 0;
	let failed = 0;
	let skipped = 0;
	const queue = [...worklist];

	const worker = async () => {
		for (;;) {
			const item = queue.shift();
			if (!item) return;

			try {
				const { generated, content } = await entityContentGenerate(item.id);
				if (!generated) {
					skipped++;
					console.log(`  ~ ${item.name} (already claimed elsewhere)`);
				} else if (content?.generationStatus === "ready") {
					done++;
					const flag = content.citationsValid ? "" : "  [citations flagged]";
					console.log(`  ✓ ${item.name}${flag}`);
				} else {
					failed++;
					console.log(`  ✗ ${item.name}: ${content?.error ?? "unknown error"}`);
				}
			} catch (err) {
				failed++;
				console.log(`  ✗ ${item.name}: ${err instanceof Error ? err.message : String(err)}`);
			}
		}
	};

	await Promise.all(Array.from({ length: args.concurrency }, worker));

	console.log("\n====================================================");
	console.log(`Generated: ${done}`);
	console.log(`Skipped:   ${skipped}`);
	console.log(`Failed:    ${failed}`);
	if (failed > 0) {
		console.log("\nFailed rows are marked `failed` and will be retried on the next run.");
	}

	await pool.end();
}

main().catch((err) => {
	console.error(`\nERROR: ${err instanceof Error ? err.message : String(err)}`);
	process.exit(1);
});
