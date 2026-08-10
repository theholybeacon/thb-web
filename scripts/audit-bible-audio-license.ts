/**
 * Reports how many Bibles in the DB are cleared for audio narration.
 * Read-only — makes no changes. Run before the backfill to see the real cost
 * of the licence gate.
 *
 * Usage: npx tsx scripts/audit-bible-audio-license.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { isAudioLicensedBible, audioLicenseFor } from "../src/lib/bibleLicense";

const MAJOR = new Set(["English", "Spanish", "Portuguese", "French", "German", "German, Standard", "Italian"]);

async function main() {
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const { rows } = await pool.query(
		`SELECT "apiId", "name", "version", "language" FROM "bible" ORDER BY "language", "version"`
	);

	const licensed = rows.filter((r) => isAudioLicensedBible(r));
	const major = rows.filter((r) => MAJOR.has(r.language));
	const majorLicensed = major.filter((r) => isAudioLicensedBible(r));

	console.log(`All Bibles:              ${String(licensed.length).padStart(3)} / ${rows.length} audio-enabled`);
	console.log(`Major-language Bibles:   ${String(majorLicensed.length).padStart(3)} / ${major.length} audio-enabled\n`);

	console.log("MAJOR-LANGUAGE BIBLES — audio status");
	console.log("-".repeat(84));
	for (const r of major) {
		const lic = audioLicenseFor(r);
		const mark = lic ? "AUDIO" : "  --  ";
		const note = lic ? lic.kind : "not cleared (narrates our own content only)";
		console.log(
			`${mark} | ${String(r.language).padEnd(16)}| ${String(r.version).padEnd(10)}| ${note}`
		);
	}

	await pool.end();
}

main().catch((e) => {
	console.error("ERROR:", e.message);
	process.exit(1);
});
