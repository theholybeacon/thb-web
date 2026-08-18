-- Shrinks alignment_word, which is by far the largest table in the database.
--
-- Two changes, together cutting roughly a third of its footprint:
--   * drop alignment_word_surface_idx (25 MB/source). Every surface lookup is
--     already scoped to source+book+chapter+verse by alignment_word_verse_idx,
--     which narrows to a single verse's dozen words — the extra index bought
--     nothing.
--   * replace the random uuid primary key with a bigserial (~8 MB/source). The
--     table is append-only seed data and nothing holds a foreign key to it.
--
-- The table is dropped rather than altered: its contents are 100% reproducible
-- from scripts/import-alignment.ts in well under a minute, so rebuilding is
-- cheaper and safer than an in-place PK type change. Re-run:
--     npm run seed:alignment -- bsb
DROP INDEX IF EXISTS "alignment_word_surface_idx";
--> statement-breakpoint
DROP TABLE IF EXISTS "alignment_word";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alignment_word" (
	"id" bigserial PRIMARY KEY NOT NULL,
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
