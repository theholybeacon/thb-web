/**
 * Applies a hand-written migration file from ./migrations.
 *
 * The migrations in this project are hand-rolled and idempotent (IF NOT EXISTS /
 * DO $$ ... EXCEPTION WHEN duplicate_object), so re-running one is safe.
 *
 * Usage: npx tsx scripts/apply-migration.ts 0017_add_audio.sql
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";

async function main() {
	const file = process.argv[2];
	if (!file) {
		console.error("Usage: npx tsx scripts/apply-migration.ts <file.sql>");
		process.exit(1);
	}

	const sql = readFileSync(join(process.cwd(), "migrations", file), "utf8");
	const statements = sql
		.split("--> statement-breakpoint")
		.map((s) => s.trim())
		.filter((s) => s.length > 0 && !s.split("\n").every((l) => l.trim().startsWith("--") || !l.trim()));

	const pool = new Pool({ connectionString: process.env.DATABASE_URL });

	console.log(`Applying ${file} (${statements.length} statements)\n`);
	for (let i = 0; i < statements.length; i++) {
		const preview = statements[i].split("\n").find((l) => l.trim() && !l.trim().startsWith("--")) ?? "";
		process.stdout.write(`  [${i + 1}/${statements.length}] ${preview.slice(0, 68)}... `);
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
