-- Progress becomes per-translation while keeping an "All Bibles" roll-up.
--
-- `lap` now means "this user's Nth pass through this chapter IN THIS TRANSLATION",
-- and becomes write-only: pre-migration rows were numbered globally across
-- translations, so per-bible max(lap) would be wrong for them and would never
-- self-heal. Every read-side "times" is count(*) from here on.
--
-- NULLS NOT DISTINCT (PG15+; this database is 16.14) rather than a
-- COALESCE-sentinel expression index: it stays a real named CONSTRAINT that
-- drizzle can model and ON CONFLICT can target, and no fabricated uuid leaks
-- into the data. The new key is a strict column superset of the old one, so the
-- swap is strictly more permissive and cannot fail on existing rows.
ALTER TABLE "chapter_completion" DROP CONSTRAINT IF EXISTS "chapter_completion_lap_unique";
--> statement-breakpoint
ALTER TABLE "chapter_completion" ADD CONSTRAINT "chapter_completion_lap_unique"
  UNIQUE NULLS NOT DISTINCT ("userId","bookAbbreviation","chapter","bibleId","lap");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chapter_completion_user_bible_idx"
  ON "chapter_completion" USING btree ("userId","bibleId");
--> statement-breakpoint
-- NULL bibleId = a global (all-translations) badge; a set bibleId scopes the
-- badge to that translation.
ALTER TABLE "user_badge" ADD COLUMN IF NOT EXISTS "bibleId" uuid;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_bibleId_bible_id_fk"
  FOREIGN KEY ("bibleId") REFERENCES "public"."bible"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
ALTER TABLE "user_badge" DROP CONSTRAINT IF EXISTS "user_badge_unique";
--> statement-breakpoint
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_unique"
  UNIQUE NULLS NOT DISTINCT ("userId","badgeKey","bibleId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_badge_user_bible_idx" ON "user_badge" USING btree ("userId","bibleId");
--> statement-breakpoint
-- A study session can now be finished, which is what the share prompt hangs off.
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "completedAt" timestamp;
