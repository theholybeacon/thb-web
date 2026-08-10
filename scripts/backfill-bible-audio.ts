/**
 * Sets `bible.audioEnabled` on Bibles that were seeded before the column existed.
 * New imports get it from BibleExternalAPIDao; this is for the existing rows.
 *
 * Idempotent — safe to re-run whenever src/lib/bibleLicense.ts changes.
 *
 * Usage: npx tsx scripts/backfill-bible-audio.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { isAudioLicensedBible } from "../src/lib/bibleLicense";

async function main() {
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });

	const { rows } = await pool.query(`SELECT "id", "version", "audioEnabled" FROM "bible"`);

	const enable: string[] = [];
	const disable: string[] = [];
	for (const r of rows) {
		const should = isAudioLicensedBible(r);
		if (should && !r.audioEnabled) enable.push(r.id);
		if (!should && r.audioEnabled) disable.push(r.id);
	}

	if (enable.length > 0) {
		await pool.query(`UPDATE "bible" SET "audioEnabled" = true WHERE "id" = ANY($1::uuid[])`, [enable]);
	}
	if (disable.length > 0) {
		await pool.query(`UPDATE "bible" SET "audioEnabled" = false WHERE "id" = ANY($1::uuid[])`, [disable]);
	}

	const { rows: after } = await pool.query(
		`SELECT count(*)::int AS enabled FROM "bible" WHERE "audioEnabled" = true`
	);

	console.log(`Enabled:  ${enable.length}`);
	console.log(`Disabled: ${disable.length}`);
	console.log(`Total audio-enabled Bibles: ${after[0].enabled} / ${rows.length}`);

	await pool.end();
}

main().catch((e) => {
	console.error("ERROR:", e.message);
	process.exit(1);
});
