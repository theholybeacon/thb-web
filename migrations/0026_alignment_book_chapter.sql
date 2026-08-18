-- Adds chapter granularity to alignment_book.
--
-- Blob-backed sources ship one file per book, so a book is the natural load
-- unit and `chapter` stays 0 ("whole book"). api.bible sources have no corpus:
-- they are fetched a chapter at a time from the live API, so loading a whole
-- book means one request per chapter — measured at ~0.8s each. John (21) takes
-- ~16s, but Psalms (150) would take ~2 minutes and blow Vercel's 60s ceiling.
-- Per-chapter rows keep every load small and independently retryable.
--
-- 0 rather than NULL for "whole book": Postgres treats NULLs as distinct in a
-- UNIQUE constraint, so a nullable column would silently permit duplicates.
ALTER TABLE "alignment_book" ADD COLUMN IF NOT EXISTS "chapter" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alignment_book" DROP CONSTRAINT "alignment_book_source_book_unique";
EXCEPTION
 WHEN undefined_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alignment_book" ADD CONSTRAINT "alignment_book_source_book_chapter_unique" UNIQUE("sourceCode","bookAbbreviation","chapter");
EXCEPTION
 WHEN duplicate_table THEN null;
 WHEN duplicate_object THEN null;
END $$;
