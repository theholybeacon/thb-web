import { Pool } from "pg";
import type { TestReader } from "../flows/account";
import { GlobalStudyDef, globalStudyStepInserts } from "../../src/app/common/study/model/globalStudy";
import type { StepContent } from "../../src/app/common/studyStep/model/StepContent";

/**
 * Data helpers for the signed-in tests, on top of the test readers of
 * flows/account.ts. Those readers live on between runs (one per test), so a
 * test that starts something starts by clearing what its reader did last time.
 */

/** Clears what a reader did in an earlier run: studies, sessions, notes, media sources. */
export async function resetReader(reader: TestReader): Promise<void> {
	const { db, userId } = reader;
	await db.query(`DELETE FROM note WHERE "ownerId" = $1`, [userId]);
	await db.query(`DELETE FROM session WHERE "userId" = $1`, [userId]);
	await db.query(`DELETE FROM study_step WHERE "studyId" IN (SELECT id FROM study WHERE "ownerId" = $1)`, [userId]);
	await db.query(`DELETE FROM study WHERE "ownerId" = $1`, [userId]);
	await db.query(`DELETE FROM media_source WHERE "addedById" = $1`, [userId]);
	await db.query(`UPDATE "user" SET "defaultBibleId" = (SELECT id FROM bible WHERE slug = 'bsb-en') WHERE id = $1`, [userId]);
}

/**
 * Makes the reader an admin, or not. Only ever in a test database: the app
 * itself never writes user.isAdmin, it is set by hand.
 */
export async function setAdmin(reader: TestReader, isAdmin: boolean): Promise<void> {
	await reader.db.query(`UPDATE "user" SET "isAdmin" = $2 WHERE id = $1`, [reader.userId, isAdmin]);
}

/** A study the reader designed: Psalm 23, then the given steps. */
export async function createOwnStudy(reader: TestReader, name: string, steps: { title: string; content: StepContent }[]): Promise<string> {
	const { db, userId } = reader;
	const { rows } = await db.query<{ id: string }>(
		`INSERT INTO study (name, description, topic, kind, language, "ownerId", "creatorId", "bibleId")
		 VALUES ($1, $2, $2, 'plan', 'en', $3, $3, (SELECT id FROM bible WHERE slug = 'bsb-en')) RETURNING id`,
		[name, `${name}, made by the e2e tests.`, userId],
	);
	const studyId = rows[0].id;
	await db.query(
		`INSERT INTO study_step ("studyId", "stepNumber", kind, "stepType", title, explanation, "bookAbbreviation", "startChapter", "endChapter")
		 VALUES ($1, 1, 'scripture', 'SingleChapter', 'Psalm 23', 'The Lord is my shepherd.', 'PSA', 23, 23)`,
		[studyId],
	);
	for (const [index, step] of steps.entries()) {
		await db.query(
			`INSERT INTO study_step ("studyId", "stepNumber", kind, title, explanation, content) VALUES ($1, $2, $3, $4, '', $5)`,
			[studyId, index + 2, step.content.kind, step.title, JSON.stringify(step.content)],
		);
	}
	return studyId;
}

let pool: Pool | null = null;

/**
 * Makes sure a catalog study exists in this database, from its definition in
 * code, without touching it if it is already there (seeded, or by a parallel
 * test). The same rows `npm run seed:studies` writes.
 */
export async function ensureGlobalStudy(def: GlobalStudyDef): Promise<void> {
	pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const { rows } = await client.query<{ id: string }>(
			`INSERT INTO study (name, description, topic, depth, length, "sortOrder", kind, language, "isGlobal", slug)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)
			 ON CONFLICT (slug) DO NOTHING RETURNING id`,
			[def.name, def.description, def.topic, def.depth, def.length, def.sortOrder, def.kind ?? "plan", def.language ?? "en", def.slug],
		);
		if (rows.length) {
			for (const step of globalStudyStepInserts(def)) {
				await client.query(
					`INSERT INTO study_step ("studyId", "stepNumber", kind, "stepType", title, explanation, content,
					   "bookAbbreviation", "startChapter", "endChapter", "startVerse", "endVerse")
					 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
					[rows[0].id, step.stepNumber, step.kind, step.stepType, step.title, step.explanation,
						step.content ? JSON.stringify(step.content) : null, step.bookAbbreviation, step.startChapter,
						step.endChapter, step.startVerse, step.endVerse],
				);
			}
		}
		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
}
