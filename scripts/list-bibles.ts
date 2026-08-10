/**
 * Read-only audit: lists every Bible in the DB so we can confirm which
 * translations are license-safe for TTS audio generation.
 *
 * Usage: npx tsx scripts/list-bibles.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";

async function main() {
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const { rows } = await pool.query(
		`SELECT "apiId", "name", "version", "language", "slug" FROM "bible" ORDER BY "language", "version"`
	);

	console.log(`TOTAL BIBLES: ${rows.length}\n`);
	console.log(
		`${"LANGUAGE".padEnd(14)}| ${"VERSION".padEnd(14)}| ${"NAME".padEnd(46)}| API ID`
	);
	console.log("-".repeat(120));
	for (const r of rows) {
		console.log(
			`${String(r.language ?? "").padEnd(14)}| ${String(r.version ?? "").padEnd(14)}| ${String(r.name ?? "").slice(0, 45).padEnd(46)}| ${r.apiId}`
		);
	}

	await pool.end();
}

main().catch((e) => {
	console.error("ERROR:", e.message);
	process.exit(1);
});
