-- Bible completion tracking.
--
-- `chapter_completion` is an append-only event log, one row per completion, keyed
-- on canonical USFM refs rather than a chapterId FK because `chapter` rows are
-- per-translation — progress has to follow the user across translations.
--
-- `lap` (this user's Nth pass through THIS chapter) is computed at write time so
-- that "times through the whole Bible" is a plain min(lap) over the 1189
-- canonical chapters at read time. The unique index on
-- ("userId","bookAbbreviation",chapter,lap) is load-bearing: the Neon HTTP driver
-- has no interactive transactions, so the read-max-then-insert in the DAO is a
-- race, and this constraint turns a double-submit into a no-op rather than a
-- phantom extra lap.
--
-- "completedDate" is the user's LOCAL date (same convention as
-- user_daily_activity), which keeps the today/week/month/year stats a plain range
-- scan with no timezone math at query time.
CREATE TABLE IF NOT EXISTS "chapter_completion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"bookAbbreviation" varchar(10) NOT NULL,
	"chapter" integer NOT NULL,
	"mode" varchar(10) NOT NULL,
	"bibleId" uuid,
	"lap" integer DEFAULT 1 NOT NULL,
	"secondsSpent" integer,
	"completedAt" timestamp DEFAULT now() NOT NULL,
	"completedDate" date NOT NULL,
	CONSTRAINT "chapter_completion_lap_unique" UNIQUE("userId","bookAbbreviation","chapter","lap")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chapter_completion" ADD CONSTRAINT "chapter_completion_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chapter_completion" ADD CONSTRAINT "chapter_completion_bibleId_bible_id_fk" FOREIGN KEY ("bibleId") REFERENCES "public"."bible"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chapter_completion_user_ref_idx" ON "chapter_completion" USING btree ("userId","bookAbbreviation","chapter");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chapter_completion_user_date_idx" ON "chapter_completion" USING btree ("userId","completedDate");
--> statement-breakpoint
-- Milestones. The rules live in code (completion/model/badges.ts) as pure
-- predicates over the stats; this table only records WHEN one first became true,
-- which is what lets us celebrate and offer a share at the moment it is earned.
CREATE TABLE IF NOT EXISTS "user_badge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"badgeKey" varchar(50) NOT NULL,
	"earnedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_badge_unique" UNIQUE("userId","badgeKey")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_badge_user_idx" ON "user_badge" USING btree ("userId");
--> statement-breakpoint
-- Public profiles are opt-in: /u/[username] 404s until the user turns this on.
-- Reading habits must never become public by default.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "publicProfileEnabled" boolean DEFAULT false NOT NULL;
