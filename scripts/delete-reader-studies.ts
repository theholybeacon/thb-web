/**
 * Deletes every study readers own (generated or adopted from the catalog) and
 * every session, so readers start fresh on the catalog's plans and stories.
 * The catalog itself (study.isGlobal) is never touched, and notes stay.
 *
 * Goes with them: user_study_progress and session_step_completion rows (per
 * session), and the steps of the deleted studies (their audio_asset rows
 * cascade). A study builder conversation keeps its messages; its link to the
 * study is set to NULL by the foreign key.
 *
 * One transaction: either everything is deleted or nothing is.
 *
 *   npx tsx scripts/delete-reader-studies.ts          # counts only, changes nothing
 *   npx tsx scripts/delete-reader-studies.ts --yes    # deletes
 *
 * Run against another database with its env, e.g.
 *   doppler run --config prd -- npx tsx scripts/delete-reader-studies.ts
 * Take a backup (a Neon branch) first: this cannot be undone.
 */
import { config } from "dotenv";
// An already-set DATABASE_URL (doppler run) wins over the worktree's env file.
config({ path: ".env.local" });

import { Pool, PoolClient } from "pg";

const confirm = process.argv.includes("--yes");

async function exists(client: PoolClient, table: string): Promise<boolean> {
	const { rows } = await client.query<{ t: string | null }>("SELECT to_regclass($1) AS t", [`public.${table}`]);
	return rows[0].t !== null;
}

async function count(client: PoolClient, sql: string): Promise<number> {
	const { rows } = await client.query<{ n: string }>(sql);
	return Number(rows[0].n);
}

async function main() {
	const url = process.env.DATABASE_URL;
	if (!url) throw new Error("DATABASE_URL is not set");
	console.log(`Database: ${new URL(url).host}`);

	const pool = new Pool({ connectionString: url, max: 1 });
	const client = await pool.connect();
	try {
		const hasProgress = await exists(client, "user_study_progress");
		const hasConversations = await exists(client, "study_builder_conversation");

		const before = {
			readerStudies: await count(client, `SELECT count(*) AS n FROM study WHERE "isGlobal" = false`),
			readerStudySteps: await count(client, `SELECT count(*) AS n FROM study_step WHERE "studyId" IN (SELECT id FROM study WHERE "isGlobal" = false)`),
			sessions: await count(client, `SELECT count(*) AS n FROM session`),
			stepCompletions: await count(client, `SELECT count(*) AS n FROM session_step_completion`),
			progressRows: hasProgress ? await count(client, `SELECT count(*) AS n FROM user_study_progress`) : 0,
			linkedConversations: hasConversations
				? await count(client, `SELECT count(*) AS n FROM study_builder_conversation WHERE "studyId" IN (SELECT id FROM study WHERE "isGlobal" = false)`)
				: 0,
			catalogStudies: await count(client, `SELECT count(*) AS n FROM study WHERE "isGlobal" = true`),
			notes: await count(client, `SELECT count(*) AS n FROM note`),
		};
		console.log("Before:", JSON.stringify(before, null, 2));

		if (!confirm) {
			console.log("\nCounts only. Run with --yes to delete the reader studies and sessions above.");
			return;
		}

		await client.query("BEGIN");
		if (hasProgress) await client.query(`DELETE FROM user_study_progress`);
		await client.query(`DELETE FROM session`);
		await client.query(`DELETE FROM study_step WHERE "studyId" IN (SELECT id FROM study WHERE "isGlobal" = false)`);
		await client.query(`DELETE FROM study WHERE "isGlobal" = false`);

		const after = {
			readerStudies: await count(client, `SELECT count(*) AS n FROM study WHERE "isGlobal" = false`),
			sessions: await count(client, `SELECT count(*) AS n FROM session`),
			stepCompletions: await count(client, `SELECT count(*) AS n FROM session_step_completion`),
			catalogStudies: await count(client, `SELECT count(*) AS n FROM study WHERE "isGlobal" = true`),
			notes: await count(client, `SELECT count(*) AS n FROM note`),
		};
		if (after.readerStudies || after.sessions || after.stepCompletions
			|| after.catalogStudies !== before.catalogStudies || after.notes !== before.notes) {
			throw new Error(`Unexpected state after delete, rolled back: ${JSON.stringify(after)}`);
		}
		await client.query("COMMIT");
		console.log("\nDeleted. After:", JSON.stringify(after, null, 2));
	} catch (e) {
		await client.query("ROLLBACK").catch(() => undefined);
		throw e;
	} finally {
		client.release();
		await pool.end();
	}
}

main().catch((e) => {
	console.error("FAILED:", e instanceof Error ? e.message : e);
	process.exit(1);
});
