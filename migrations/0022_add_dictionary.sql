CREATE TABLE IF NOT EXISTS "dictionary_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lang" varchar(8) NOT NULL,
	"word" varchar(128) NOT NULL,
	"status" "content_generation_status" DEFAULT 'pending' NOT NULL,
	"payload" jsonb,
	"source" varchar(32) DEFAULT 'freedictionaryapi' NOT NULL,
	"error" text,
	"fetchedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dictionary_entry" ADD CONSTRAINT "dictionary_entry_lang_word_unique" UNIQUE("lang","word");
EXCEPTION
 WHEN duplicate_table THEN null;
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dictionary_entry_status_updated_idx" ON "dictionary_entry" USING btree ("status","updatedAt");
