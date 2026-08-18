-- Cache for model-inferred word alignment, used only by languages where no
-- editorial alignment exists (Spanish, Portuguese, Italian).
--
-- Cached forever and keyed by translation + position, so a given word in a given
-- verse costs one model call across all users, ever.
CREATE TABLE IF NOT EXISTS "alignment_inferred" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bibleVersion" varchar(20) NOT NULL,
	"bookAbbreviation" varchar(10) NOT NULL,
	"chapter" integer NOT NULL,
	"verse" integer NOT NULL,
	"surfaceNorm" text NOT NULL,
	"occurrence" integer NOT NULL,
	"status" "content_generation_status" DEFAULT 'pending' NOT NULL,
	"strongs" varchar(8),
	"candidateSource" varchar(24),
	"model" varchar(60),
	"error" text,
	"inferredAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alignment_inferred" ADD CONSTRAINT "alignment_inferred_lookup_unique" UNIQUE("bibleVersion","bookAbbreviation","chapter","verse","surfaceNorm","occurrence");
EXCEPTION
 WHEN duplicate_table THEN null;
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "alignment_inferred_status_updated_idx" ON "alignment_inferred" USING btree ("status","updatedAt");
