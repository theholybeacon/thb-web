-- Bible text storage had no uniqueness anywhere, and the reader hydrated
-- chapters lazily with one HTTP request per verse. Two consequences, both
-- present in production:
--
--   * Concurrent readers of a cold chapter each INSERTed a chapter row. The
--     verses landed on one twin while `findFirst` returned the other, so the
--     chapter read as permanently empty. 11 duplicate (bookId, chapterNumber)
--     groups accumulated this way, plus 82 duplicate (chapterId, verseNumber)
--     groups from the same race one level down.
--   * A verse longer than varchar(1000) threw mid-loop and truncated the
--     chapter for good, since the re-fetch only triggered on ZERO verses.
--
-- The application side is fixed in ChapterRepository (one request per chapter,
-- nothing written unless the whole chapter arrives). This migration cleans up
-- what the old code left behind and makes the corruption unrepresentable.
--
-- Order matters: chapters are deduped BEFORE verses, because repointing verses
-- onto a surviving chapter can itself create new (chapterId, verseNumber)
-- duplicates that step 3 then resolves.

-- 1. Widen first, so nothing later in this migration can trip the old ceiling.
-- varchar -> text is a metadata-only change in Postgres; no table rewrite.
ALTER TABLE "verse" ALTER COLUMN "content" TYPE text;
--> statement-breakpoint

-- 2a. Chapter duplicates: repoint reading progress onto the survivor.
-- "user_study_progress" has a real FK to chapter(id), so the DELETE in 2c fails
-- unless these move first.
--
-- Survivor = the row with the MOST verses. The duplicates came from racing
-- hydration loops, and one racer usually got further than the other before
-- erroring, so the fuller row preserves the most real text. Ties break on the
-- oldest row, then on id so the choice is stable across re-runs.
WITH ranked AS (
  SELECT c.id,
         row_number() OVER w AS rn,
         first_value(c.id) OVER w AS keep_id
  FROM "chapter" c
  WINDOW w AS (
    PARTITION BY c."bookId", c."chapterNumber"
    ORDER BY (SELECT count(*) FROM "verse" v WHERE v."chapterId" = c.id) DESC,
             c."createdAt" ASC NULLS LAST,
             c.id ASC
  )
)
UPDATE "user_study_progress" p
   SET "chapterId" = r.keep_id
  FROM ranked r
 WHERE p."chapterId" = r.id AND r.rn > 1;
--> statement-breakpoint

-- 2b. Move the losers' verses onto the survivor so no text is lost.
WITH ranked AS (
  SELECT c.id,
         row_number() OVER w AS rn,
         first_value(c.id) OVER w AS keep_id
  FROM "chapter" c
  WINDOW w AS (
    PARTITION BY c."bookId", c."chapterNumber"
    ORDER BY (SELECT count(*) FROM "verse" v WHERE v."chapterId" = c.id) DESC,
             c."createdAt" ASC NULLS LAST,
             c.id ASC
  )
)
UPDATE "verse" v
   SET "chapterId" = r.keep_id
  FROM ranked r
 WHERE v."chapterId" = r.id AND r.rn > 1;
--> statement-breakpoint

-- 2c. Drop the emptied duplicates.
WITH ranked AS (
  SELECT c.id,
         row_number() OVER w AS rn
  FROM "chapter" c
  WINDOW w AS (
    PARTITION BY c."bookId", c."chapterNumber"
    ORDER BY (SELECT count(*) FROM "verse" v WHERE v."chapterId" = c.id) DESC,
             c."createdAt" ASC NULLS LAST,
             c.id ASC
  )
)
DELETE FROM "chapter" c USING ranked r WHERE c.id = r.id AND r.rn > 1;
--> statement-breakpoint

-- 3. Verse duplicates. Survivor = LONGEST content: byte-identical duplicates
-- make the choice arbitrary, and where they differ the longer one is the row
-- that was not truncated by the old varchar(1000) ceiling.
WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY "chapterId", "verseNumber"
           ORDER BY length("content") DESC, "createdAt" ASC, id ASC
         ) AS rn
  FROM "verse"
)
DELETE FROM "verse" v USING ranked r WHERE v.id = r.id AND r.rn > 1;
--> statement-breakpoint

-- 4. Make both duplications impossible from here on. The application's inserts
-- use ON CONFLICT DO NOTHING, so a losing concurrent hydration now becomes a
-- no-op instead of a second row.
DO $$ BEGIN
  ALTER TABLE "chapter" ADD CONSTRAINT "chapter_book_number_unique" UNIQUE ("bookId", "chapterNumber");
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint

-- Doubles as the index behind getByChapterIdAndVerseNumber and the warm
-- script's per-chapter gap query.
DO $$ BEGIN
  ALTER TABLE "verse" ADD CONSTRAINT "verse_chapter_number_unique" UNIQUE ("chapterId", "verseNumber");
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint

-- 5. Discard the ~1,200 chapter rows that carry no verses. They were minted in
-- bulk by a since-removed "warm every chapter of the book" path and by the old
-- hydration loop, which created the row BEFORE trying to fetch. An empty row is
-- indistinguishable from a real one to every reader, so dropping them lets the
-- new code recreate each chapter honestly on first read.
--
-- The numVerses = -1 sentinel (upstream genuinely has no such chapter) is
-- preserved — those rows are deliberately empty.
DELETE FROM "chapter" c
 WHERE NOT EXISTS (SELECT 1 FROM "verse" v WHERE v."chapterId" = c.id)
   AND coalesce(c."numVerses", 0) >= 0
   AND NOT EXISTS (SELECT 1 FROM "user_study_progress" p WHERE p."chapterId" = c.id);
