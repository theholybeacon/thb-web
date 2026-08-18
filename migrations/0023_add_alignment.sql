DO $$ BEGIN
 CREATE TYPE "public"."strongs_language" AS ENUM('greek', 'hebrew');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "strongs_entry" (
	"strongs" varchar(8) PRIMARY KEY NOT NULL,
	"language" "strongs_language" NOT NULL,
	"lemma" text,
	"translit" text,
	"pronunciation" text,
	"definition" text,
	"shortDefinition" text,
	"derivation" text,
	"source" varchar(32) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alignment_word" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sourceCode" varchar(24) NOT NULL,
	"bookAbbreviation" varchar(10) NOT NULL,
	"chapter" integer NOT NULL,
	"verse" integer NOT NULL,
	"wordIndex" integer NOT NULL,
	"occurrence" integer NOT NULL,
	"surface" text NOT NULL,
	"surfaceNorm" text NOT NULL,
	"strongs" varchar(8)[] DEFAULT '{}' NOT NULL,
	"lemma" text,
	"morph" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "alignment_word_verse_idx" ON "alignment_word" USING btree ("sourceCode","bookAbbreviation","chapter","verse");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "alignment_word_surface_idx" ON "alignment_word" USING btree ("bookAbbreviation","chapter","verse","surfaceNorm");
