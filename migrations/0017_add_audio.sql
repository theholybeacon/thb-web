-- Listen Mode overhaul: cached, shared, server-generated narration.
--
-- `audio_asset` mirrors `entity_content`: the row IS the generation lock, so
-- exactly one generation runs per asset even under concurrent load. A chapter
-- asset is shared by every user and every study step touching that chapter.
--
-- Reuses the existing "content_generation_status" enum from migration 0013 —
-- deliberately not a second copy.

ALTER TABLE "bible" ADD COLUMN IF NOT EXISTS "audioEnabled" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "audio_asset_kind" AS ENUM('chapter', 'step_intro'); EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audio_asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cacheKey" varchar(255) NOT NULL,
	"kind" "audio_asset_kind" NOT NULL,
	"voice" varchar(20) NOT NULL,
	"model" varchar(60),
	"language" varchar(50),
	"bibleId" uuid,
	"bookAbbreviation" varchar(10),
	"chapterNumber" integer,
	"studyStepId" uuid,
	"generationStatus" "content_generation_status" DEFAULT 'pending' NOT NULL,
	"blobUrl" text,
	"blobPathname" text,
	"durationMs" integer,
	"byteSize" integer,
	"segments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"error" text,
	"generatedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "audio_asset_cacheKey_unique" UNIQUE("cacheKey")
);
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "audio_asset" ADD CONSTRAINT "audio_asset_bibleId_bible_id_fk" FOREIGN KEY ("bibleId") REFERENCES "bible"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "audio_asset" ADD CONSTRAINT "audio_asset_studyStepId_study_step_id_fk" FOREIGN KEY ("studyStepId") REFERENCES "study_step"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audio_asset_chapter_idx" ON "audio_asset" ("bibleId","bookAbbreviation","chapterNumber");
--> statement-breakpoint
-- Lets the stale-reclaim sweep find crashed generations cheaply.
CREATE INDEX IF NOT EXISTS "audio_asset_status_idx" ON "audio_asset" ("generationStatus","updatedAt");
