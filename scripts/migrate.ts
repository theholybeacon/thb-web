/**
 * Applies every pending migration in ./migrations, in order, and records each
 * one in the `schema_migration` table. This is what CI runs on deploy.
 *
 * Why not `drizzle-kit migrate`: drizzle's journal only knows 0000-0008; every
 * migration since is hand-written and lives outside it.
 *
 * A database that already has the schema but no `schema_migration` rows (one
 * migrated by hand with apply-migration.ts) must be baselined once: that marks
 * files as applied without running them. 0001-0005, 0009 and 0011 are not
 * idempotent, so they must never be re-run against an existing database.
 *
 * Usage:
 *   npm run db:migrate                          # apply pending (CI)
 *   npm run db:migrate -- --status              # list applied / pending, change nothing
 *   npm run db:migrate -- --baseline [<file>]   # mark files up to <file> (default: all) as applied
 *
 * Outside CI it reads .env.local and asks for --yes, since that file may point
 * at production.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { listMigrations, preview, readStatements } from "./lib/migrations";

const args = process.argv.slice(2);
const has = (flag: string) => args.includes(flag);

async function main() {
	const url = process.env.DATABASE_URL;
	if (!url) throw new Error("DATABASE_URL is not set");
	const host = new URL(url).host;

	const status = has("--status");
	const baseline = has("--baseline");
	if (!status && !process.env.CI && !has("--yes")) {
		throw new Error(`refusing to change ${host} without --yes (outside CI)`);
	}

	const pool = new Pool({ connectionString: url });
	try {
		await pool.query(`
			CREATE TABLE IF NOT EXISTS schema_migration (
				name text PRIMARY KEY,
				applied_at timestamptz NOT NULL DEFAULT now()
			)`);
		const { rows } = await pool.query<{ name: string }>("SELECT name FROM schema_migration");
		const applied = new Set(rows.map((r) => r.name));
		const files = listMigrations();
		const pending = files.filter((f) => !applied.has(f));

		console.log(`Database ${host}: ${applied.size} applied, ${pending.length} pending.`);

		if (status) {
			for (const f of pending) console.log(`  pending  ${f}`);
			return;
		}

		if (baseline) {
			const upto = args[args.indexOf("--baseline") + 1];
			const last = upto && !upto.startsWith("--") ? upto : files[files.length - 1];
			if (!files.includes(last)) throw new Error(`no migration named ${last}`);
			const marked = pending.filter((f) => f <= last);
			for (const f of marked) {
				await pool.query("INSERT INTO schema_migration (name) VALUES ($1) ON CONFLICT DO NOTHING", [f]);
			}
			console.log(`Baselined ${marked.length} migration(s) up to ${last} without running them.`);
			return;
		}

		if (applied.size === 0) {
			const { rows: existing } = await pool.query("SELECT to_regclass('public.\"user\"') AS t");
			if (existing[0].t) {
				throw new Error(
					"this database already has the schema but no recorded migrations. Baseline it once with " +
						"`--baseline <last file it has>` (CI: run the db workflow with task=baseline).",
				);
			}
		}

		for (const file of pending) {
			const statements = readStatements(file);
			console.log(`\nApplying ${file} (${statements.length} statements)`);
			for (let i = 0; i < statements.length; i++) {
				process.stdout.write(`  [${i + 1}/${statements.length}] ${preview(statements[i]).slice(0, 68)}... `);
				await pool.query(statements[i]);
				console.log("ok");
			}
			await pool.query("INSERT INTO schema_migration (name) VALUES ($1)", [file]);
		}
		console.log(pending.length ? `\nApplied ${pending.length} migration(s).` : "Nothing to apply.");
	} finally {
		await pool.end();
	}
}

main().catch((e) => {
	console.error("\nFAILED:", e.message || e);
	process.exit(1);
});
