-- `book` had no uniqueness on (bibleId, abbreviation). The book list of a
-- translation is seeded on its first read, and concurrent first reads each
-- inserted the whole list, so some translations (bsb-en, web-en) carry every
-- book twice. Chapters then hydrated onto whichever twin a reader resolved, so
-- a chapter could be half-cached on each copy while `findFirst` returned one
-- of them and found it incomplete.
--
-- The application side is fixed in BookRepository (inserts use ON CONFLICT DO
-- NOTHING and re-read the stored list). This migration merges the twins and
-- makes them unrepresentable.
--
-- The merge is one DO block so it is atomic: the migration runner sends each
-- statement on its own, and a half-applied merge would leave chapters pointing
-- at deleted books.
DO $$
DECLARE
  r record;
BEGIN
  -- 1. Pick a survivor per (bibleId, abbreviation): the copy holding the MOST
  -- verse text, then the oldest, then the lowest id so re-runs agree.
  CREATE TEMP TABLE book_merge ON COMMIT DROP AS
  WITH ranked AS (
    SELECT b.id,
           row_number() OVER w AS rn,
           first_value(b.id) OVER w AS keep_id
    FROM "book" b
    WINDOW w AS (
      PARTITION BY b."bibleId", b."abbreviation"
      ORDER BY (SELECT count(*) FROM "verse" v JOIN "chapter" c ON c.id = v."chapterId"
                 WHERE c."bookId" = b.id) DESC,
               b."createdAt" ASC NULLS LAST,
               b.id ASC
    )
  )
  SELECT id AS old_id, keep_id FROM ranked WHERE rn > 1;

  IF NOT EXISTS (SELECT 1 FROM book_merge) THEN
    RETURN;
  END IF;

  -- 2. Chapters that will collide once their books merge: same survivor book,
  -- same chapter number. Survivor = the chapter with the most verses, as in
  -- 0033_chapter_verse_integrity.
  CREATE TEMP TABLE chapter_merge ON COMMIT DROP AS
  WITH grouped AS (
    SELECT c.id,
           c."chapterNumber",
           c."createdAt",
           coalesce(m.keep_id, c."bookId") AS keep_book,
           (SELECT count(*) FROM "verse" v WHERE v."chapterId" = c.id) AS verses
    FROM "chapter" c
    LEFT JOIN book_merge m ON m.old_id = c."bookId"
    WHERE c."bookId" IN (SELECT old_id FROM book_merge UNION SELECT keep_id FROM book_merge)
  ),
  ranked AS (
    SELECT id,
           row_number() OVER w AS rn,
           first_value(id) OVER w AS keep_id
    FROM grouped
    WINDOW w AS (
      PARTITION BY keep_book, "chapterNumber"
      ORDER BY verses DESC, "createdAt" ASC NULLS LAST, id ASC
    )
  )
  SELECT id AS old_id, keep_id FROM ranked WHERE rn > 1;

  -- 2a. Move over the verses the surviving chapter lacks, one per verse
  -- number, so two half-cached copies add up to the text a reader can use.
  -- The surviving chapter's contentHash no longer describes its verses; null
  -- it and the reader recomputes it once the chapter is complete.
  WITH moved AS (
    UPDATE "verse" v
       SET "chapterId" = pick.keep_id
      FROM (
        SELECT DISTINCT ON (cm.keep_id, lv."verseNumber") lv.id, cm.keep_id
        FROM "verse" lv
        JOIN chapter_merge cm ON cm.old_id = lv."chapterId"
        WHERE NOT EXISTS (SELECT 1 FROM "verse" k
                           WHERE k."chapterId" = cm.keep_id AND k."verseNumber" = lv."verseNumber")
        ORDER BY cm.keep_id, lv."verseNumber", length(lv."content") DESC, lv.id ASC
      ) pick
     WHERE v.id = pick.id
    RETURNING pick.keep_id
  )
  UPDATE "chapter" c SET "contentHash" = NULL
   WHERE c.id IN (SELECT keep_id FROM moved);

  -- Keep the upstream verse count if only a losing copy had recorded it.
  UPDATE "chapter" c
     SET "numVerses" = g.num_verses
    FROM (
      SELECT cm.keep_id, max(l."numVerses") AS num_verses
      FROM chapter_merge cm JOIN "chapter" l ON l.id = cm.old_id
      GROUP BY cm.keep_id
    ) g
   WHERE c.id = g.keep_id AND coalesce(c."numVerses", 0) = 0 AND g.num_verses > 0;

  -- 2b. Drop the losing chapters' leftover (duplicate) verses, repoint every
  -- foreign key to chapter onto the survivor, then drop the losing chapters.
  DELETE FROM "verse" v USING chapter_merge cm WHERE v."chapterId" = cm.old_id;

  FOR r IN
    SELECT con.conrelid::regclass AS tbl, att.attname AS col
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = con.conkey[1]
    WHERE con.contype = 'f' AND con.confrelid = '"chapter"'::regclass
      AND array_length(con.conkey, 1) = 1
  LOOP
    EXECUTE format('UPDATE %s t SET %I = m.keep_id FROM chapter_merge m WHERE t.%I = m.old_id',
                   r.tbl, r.col, r.col);
  END LOOP;

  DELETE FROM "chapter" c USING chapter_merge cm WHERE c.id = cm.old_id;

  -- 3. Move the remaining chapters of losing books onto the surviving book;
  -- none collide any more after step 2.
  UPDATE "chapter" c SET "bookId" = m.keep_id FROM book_merge m WHERE c."bookId" = m.old_id;

  -- 4. Repoint every foreign key to book (reading progress, study steps,
  -- sessions: whichever still exist), then drop the losing books.
  FOR r IN
    SELECT con.conrelid::regclass AS tbl, att.attname AS col
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = con.conkey[1]
    WHERE con.contype = 'f' AND con.confrelid = '"book"'::regclass
      AND array_length(con.conkey, 1) = 1
  LOOP
    EXECUTE format('UPDATE %s t SET %I = m.keep_id FROM book_merge m WHERE t.%I = m.old_id',
                   r.tbl, r.col, r.col);
  END LOOP;

  DELETE FROM "book" b USING book_merge m WHERE b.id = m.old_id;
END $$;
--> statement-breakpoint

-- 5. One row per book per translation from here on. Also the index behind
-- getByAbbreviationAndBibleId's exact match.
DO $$ BEGIN
  ALTER TABLE "book" ADD CONSTRAINT "book_bible_abbreviation_unique" UNIQUE ("bibleId", "abbreviation");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN null; END $$;
