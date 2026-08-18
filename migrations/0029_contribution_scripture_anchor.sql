-- Community contributions can hang off a point in scripture as well as an entity.
--
-- One polymorphic table rather than a parallel one: community_comment,
-- community_vote and community_flag all address a contribution by id, so a
-- second table would need a second copy of each of them (and a second
-- CommentThread / VoteButtons on the client).
--
-- The anchor follows the "note" convention — a canonical reference
-- (bookAbbreviation + chapter + verse), not an FK to a verse row — so a thread
-- started on John 3:16 in the KJV is found when the same verse is read in any
-- other translation. bibleId is the translation it was written in: a soft
-- pointer for linking back, and the actual target for bible-scope threads.
ALTER TABLE "contribution" ALTER COLUMN "entityId" DROP NOT NULL;
--> statement-breakpoint
-- contribution_section is a list of AI-generated entity page sections; none of
-- its values mean anything for scripture, so scripture rows carry NULL rather
-- than being forced into 'general'. The CHECK below puts back the guarantee
-- that an entity row always has one.
ALTER TABLE "contribution" ALTER COLUMN "section" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "contribution" ADD COLUMN IF NOT EXISTS "targetType" varchar(10);
--> statement-breakpoint
ALTER TABLE "contribution" ADD COLUMN IF NOT EXISTS "bibleId" uuid;
--> statement-breakpoint
ALTER TABLE "contribution" ADD COLUMN IF NOT EXISTS "bookAbbreviation" varchar(10);
--> statement-breakpoint
ALTER TABLE "contribution" ADD COLUMN IF NOT EXISTS "chapter" integer;
--> statement-breakpoint
ALTER TABLE "contribution" ADD COLUMN IF NOT EXISTS "verse" integer;
--> statement-breakpoint
-- Denormalized at write time, exactly as on "note", so lists and back-links
-- need no joins. resolveNoteTarget already computes all four.
ALTER TABLE "contribution" ADD COLUMN IF NOT EXISTS "reference" varchar(255);
--> statement-breakpoint
ALTER TABLE "contribution" ADD COLUMN IF NOT EXISTS "bookName" varchar(255);
--> statement-breakpoint
ALTER TABLE "contribution" ADD COLUMN IF NOT EXISTS "bibleSlug" varchar(100);
--> statement-breakpoint
ALTER TABLE "contribution" ADD COLUMN IF NOT EXISTS "bookSlug" varchar(100);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contribution" ADD CONSTRAINT "contribution_bibleId_bible_id_fk"
  FOREIGN KEY ("bibleId") REFERENCES "public"."bible"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
-- Exactly one anchor kind, and the columns that kind requires. Every
-- pre-migration row is an entity row with a section set and every scripture
-- column NULL, so this validates with no data fix-up. DROP IF EXISTS first is
-- what makes it re-runnable: CHECK has no duplicate_object-safe ADD form.
ALTER TABLE "contribution" DROP CONSTRAINT IF EXISTS "contribution_anchor_check";
--> statement-breakpoint
ALTER TABLE "contribution" ADD CONSTRAINT "contribution_anchor_check" CHECK (
  (
    "entityId" IS NOT NULL AND "section" IS NOT NULL
    AND "targetType" IS NULL AND "bibleId" IS NULL
    AND "bookAbbreviation" IS NULL AND "chapter" IS NULL AND "verse" IS NULL
  ) OR (
    "entityId" IS NULL AND "section" IS NULL AND "bibleId" IS NOT NULL
    AND (
         ("targetType" = 'bible'   AND "bookAbbreviation" IS NULL     AND "chapter" IS NULL     AND "verse" IS NULL)
      OR ("targetType" = 'book'    AND "bookAbbreviation" IS NOT NULL AND "chapter" IS NULL     AND "verse" IS NULL)
      OR ("targetType" = 'chapter' AND "bookAbbreviation" IS NOT NULL AND "chapter" IS NOT NULL AND "verse" IS NULL)
      OR ("targetType" = 'verse'   AND "bookAbbreviation" IS NOT NULL AND "chapter" IS NOT NULL AND "verse" IS NOT NULL)
    )
  )
);
--> statement-breakpoint
-- The reader's hot path: "every published thread on this chapter". Partial on
-- the scripture rows so it stays small and the entity index is untouched.
-- btree indexes NULLs, so this one index also serves the book-scope branch of
-- the lookup (bookAbbreviation = X AND chapter IS NULL).
CREATE INDEX IF NOT EXISTS "contribution_scripture_chapter_idx"
  ON "contribution" USING btree ("bookAbbreviation","chapter")
  WHERE "entityId" IS NULL;
--> statement-breakpoint
-- Bible-scope threads have no book or chapter to match on.
CREATE INDEX IF NOT EXISTS "contribution_scripture_bible_idx"
  ON "contribution" USING btree ("bibleId")
  WHERE "entityId" IS NULL;
