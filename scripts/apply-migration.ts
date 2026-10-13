/**
 * Applies a single hand-written migration file from ./migrations, untracked.
 *
 * For normal use prefer `npm run db:migrate` (scripts/migrate.ts), which applies
 * every pending file and records it. This one is for re-running a specific file
 * by hand; it does not touch the schema_migration table.
 *
 * Usage: npx tsx scripts/apply-migration.ts 0017_add_audio.sql
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { preview, readStatements } from "./lib/migrations";

async function main() {
	const file = process.argv[2];
	if (!file) {
		console.error("Usage: npx tsx scripts/apply-migration.ts <file.sql>");
		process.exit(1);
	}

	const statements = readStatements(file);
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });

	console.log(`Applying ${file} (${statements.length} statements)\n`);
	for (let i = 0; i < statements.length; i++) {
		process.stdout.write(`  [${i + 1}/${statements.length}] ${preview(statements[i]).slice(0, 68)}... `);
		await pool.query(statements[i]);
		console.log("ok");
	}

	console.log(`\nApplied ${file}.`);
	await pool.end();
}

main().catch((e) => {
	console.error("\nFAILED:", e.message);
	process.exit(1);
});
