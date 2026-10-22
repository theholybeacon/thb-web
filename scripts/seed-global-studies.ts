/**
 * Seeds the global study catalog — the ready-made plans and stories every user
 * can adopt from /study.
 *
 * The plans are authored in code (src/app/common/study/model/plans) rather than
 * in a migration so they can be reviewed in a diff and validated before they
 * are written. This script is the only thing that creates or updates a study
 * row with isGlobal = true.
 *
 * Idempotent: rows are keyed on `study.slug`, so re-running updates the plan in
 * place instead of creating a second copy. Steps are replaced wholesale, which
 * is safe because no session ever points at a global study's steps — a reader
 * adopts a plan, which copies it (studyAdoptSS), and sessions run on the copy.
 *
 * That copy is a snapshot: editing a plan here and re-seeding does NOT rewrite
 * the plans readers have already taken. Deliberate — rewriting someone's step 47
 * out from under them mid-plan would move their progress.
 *
 * Prerequisites: migrations up to 0036_study_kinds_and_rich_steps.sql applied,
 * DATABASE_URL set. Character steps are checked against the entity table, so the
 * people must be imported (npm run seed:people) — even for --dry-run.
 *
 * Run:  npx tsx scripts/seed-global-studies.ts
 *       npx tsx scripts/seed-global-studies.ts --dry-run   (validate only)
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq, inArray } from "drizzle-orm";
import { studyTable } from "../src/db/schema/study";
import { studyStepTable } from "../src/db/schema/studyStep";
import { entityTable } from "../src/db/schema/entity";
import { GLOBAL_STUDIES } from "../src/app/common/study/model/globalStudyCatalog";
import {
	globalStudyChapterCount,
	globalStudyStepInserts,
	isScriptureStepDef,
	validateGlobalStudy,
} from "../src/app/common/study/model/globalStudy";

const dryRun = process.argv.includes("--dry-run");

if (!process.env.DATABASE_URL) {
	console.error("DATABASE_URL is not set — nothing to connect to.");
	process.exit(1);
}

function describeDatabase(url: string): string {
	try {
		return new URL(url).host;
	} catch {
		return "<unparseable DATABASE_URL>";
	}
}

async function main() {
	// Validate everything before writing anything: a plan is long hand-written
	// data whose failure mode is silent (a mistyped chapter just drops a chapter
	// out of "the whole Bible"), so a bad plan must not reach the database.
	let invalid = false;
	for (const def of GLOBAL_STUDIES) {
		const problems = validateGlobalStudy(def);
		const summary = `${def.steps.length} steps, ${globalStudyChapterCount(def)} chapters`;
		if (problems.length) {
			invalid = true;
			console.error(`✗ ${def.slug} (${summary})`);
			for (const problem of problems) console.error(`    ${problem}`);
		} else {
			console.log(`✓ ${def.slug} (${summary})`);
		}
	}
	if (invalid) {
		console.error("\nNothing written — fix the plans above first.");
		process.exit(1);
	}

	const db = drizzle(neon(process.env.DATABASE_URL!));

	// A character step names a profile by slug; one that does not exist would
	// render as an empty step, so it is a seed failure like a bad chapter.
	const slugs = [...new Set(GLOBAL_STUDIES.flatMap((def) => def.steps.flatMap((step) =>
		!isScriptureStepDef(step) && step.content.kind === "character" ? [step.content.entitySlug] : [])))];
	if (slugs.length) {
		const found = new Set((await db.select({ slug: entityTable.slug }).from(entityTable)
			.where(inArray(entityTable.slug, slugs))).map((row) => row.slug));
		const missing = slugs.filter((slug) => !found.has(slug));
		if (missing.length) {
			console.error(`\nNo character profile for: ${missing.join(", ")}\nNothing written.`);
			process.exit(1);
		}
	}

	if (dryRun) {
		console.log("\nDry run — nothing written.");
		return;
	}

	console.log(`\nSeeding ${GLOBAL_STUDIES.length} studies into ${describeDatabase(process.env.DATABASE_URL!)}\n`);

	for (const def of GLOBAL_STUDIES) {
		const fields = {
			name: def.name,
			description: def.description,
			topic: def.topic,
			depth: def.depth,
			length: def.length,
			sortOrder: def.sortOrder,
			kind: def.kind ?? "plan",
			language: def.language ?? "en",
			isGlobal: true as const,
			// The catalog is designed by The Holy Beacon, which is a NULL creator.
			creatorId: null,
			// A template belongs to nobody and is read in no particular
			// translation; the copy made at adoption time carries both.
			ownerId: null,
			bibleId: null,
			updatedAt: new Date(),
		};

		const existing = await db
			.select({ id: studyTable.id })
			.from(studyTable)
			.where(and(eq(studyTable.slug, def.slug), eq(studyTable.isGlobal, true)));

		let studyId: string;
		if (existing.length) {
			studyId = existing[0].id;
			await db.update(studyTable).set(fields).where(eq(studyTable.id, studyId));
			await db.delete(studyStepTable).where(eq(studyStepTable.studyId, studyId));
			console.log(`  updated ${def.slug} (${studyId})`);
		} else {
			const inserted = await db
				.insert(studyTable)
				.values({ ...fields, slug: def.slug })
				.returning({ id: studyTable.id });
			studyId = inserted[0].id;
			console.log(`  created ${def.slug} (${studyId})`);
		}

		const steps = globalStudyStepInserts(def).map((step) => ({ ...step, studyId }));
		await db.insert(studyStepTable).values(steps);
		console.log(`    ${steps.length} steps written`);
	}

	console.log("\nDone.");
}

main().catch((e) => {
	console.error("\nFAILED:", e instanceof Error ? e.message : e);
	process.exit(1);
});
