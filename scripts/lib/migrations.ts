import { readFileSync, readdirSync } from "fs";
import { join } from "path";

export const MIGRATIONS_DIR = join(process.cwd(), "migrations");

/** Every migration file, in apply order (their numeric prefix). */
export function listMigrations(): string[] {
	return readdirSync(MIGRATIONS_DIR)
		.filter((f) => /^\d{4}_.*\.sql$/.test(f))
		.sort();
}

/** A migration's statements, split on drizzle's breakpoint marker, comment-only chunks dropped. */
export function readStatements(file: string): string[] {
	return readFileSync(join(MIGRATIONS_DIR, file), "utf8")
		.split("--> statement-breakpoint")
		.map((s) => s.trim())
		.filter((s) => s.length > 0 && !s.split("\n").every((l) => l.trim().startsWith("--") || !l.trim()));
}

/** First non-comment line of a statement, for progress output. */
export function preview(statement: string): string {
	return statement.split("\n").find((l) => l.trim() && !l.trim().startsWith("--")) ?? "";
}
