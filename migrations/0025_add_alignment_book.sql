-- Per-book load status for alignment data, so it can be fetched from Vercel Blob
-- on demand instead of requiring a bulk Python-driven reseed.
--
-- The backfill at the bottom is what lets the ~800k rows already loaded stay
-- warm: it marks every (source, book) pair currently present as 'ready', so the
-- lazy path is a no-op for them and no reader pays a cold fetch for data that is
-- already there.
CREATE TABLE IF NOT EXISTS "alignment_book" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sourceCode" varchar(24) NOT NULL,
	"bookAbbreviation" varchar(10) NOT NULL,
	"status" "content_generation_status" DEFAULT 'pending' NOT NULL,
	"wordCount" integer,
	"blobPathname" text,
	"error" text,
	"loadedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alignment_book" ADD CONSTRAINT "alignment_book_source_book_unique" UNIQUE("sourceCode","bookAbbreviation");
EXCEPTION
 WHEN duplicate_table THEN null;
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "alignment_book_status_updated_idx" ON "alignment_book" USING btree ("status","updatedAt");
--> statement-breakpoint
INSERT INTO "alignment_book" ("sourceCode","bookAbbreviation","status","wordCount","loadedAt")
SELECT "sourceCode","bookAbbreviation",'ready',count(*),now()
FROM "alignment_word"
GROUP BY "sourceCode","bookAbbreviation"
ON CONFLICT ("sourceCode","bookAbbreviation") DO NOTHING;
