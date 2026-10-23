-- Stories and richer steps.
--
-- A study is now a plan or a story (study.kind). Both run on the same engine:
-- adoption, sessions and progress do not care which one they are running.
--
-- A step is no longer only a passage of Scripture. study_step.kind says what
-- it is (scripture, text, reflection, character, image, video, link) and
-- study_step.content carries the material for every kind but scripture. Every
-- existing step is scripture, which is the column default.
ALTER TABLE "study" ADD COLUMN IF NOT EXISTS "kind" varchar(10) DEFAULT 'plan' NOT NULL;
--> statement-breakpoint
ALTER TABLE "study" DROP CONSTRAINT IF EXISTS "study_kind_check";
--> statement-breakpoint
ALTER TABLE "study" ADD CONSTRAINT "study_kind_check" CHECK ("kind" IN ('plan', 'story'));
--> statement-breakpoint
-- The one language a study is written in. Existing studies take the language
-- of the Bible they are read in; the catalog's two plans, which have none, are
-- written in English.
ALTER TABLE "study" ADD COLUMN IF NOT EXISTS "language" varchar(5) DEFAULT 'en' NOT NULL;
--> statement-breakpoint
UPDATE "study" s SET "language" = CASE trim(split_part(lower(b."language"), ',', 1))
    WHEN 'spanish' THEN 'es'
    WHEN 'español' THEN 'es'
    WHEN 'castilian' THEN 'es'
    WHEN 'portuguese' THEN 'pt'
    WHEN 'french' THEN 'fr'
    WHEN 'german' THEN 'de'
    WHEN 'italian' THEN 'it'
    ELSE 'en' END
  FROM "bible" b
  WHERE s."bibleId" = b."id";
--> statement-breakpoint
-- Who designed the study, as opposed to whose copy it is (ownerId). NULL is The
-- Holy Beacon: the catalog and every copy adopted from it. A study a reader
-- generated themselves was designed by them.
ALTER TABLE "study" ADD COLUMN IF NOT EXISTS "creatorId" uuid;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study" ADD CONSTRAINT "study_creatorId_user_id_fk"
  FOREIGN KEY ("creatorId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
UPDATE "study" SET "creatorId" = "ownerId"
  WHERE "creatorId" IS NULL AND "isGlobal" = false AND "sourceStudyId" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "study_creator_idx" ON "study" USING btree ("creatorId");
--> statement-breakpoint
ALTER TABLE "study_step" ADD COLUMN IF NOT EXISTS "kind" varchar(20) DEFAULT 'scripture' NOT NULL;
--> statement-breakpoint
ALTER TABLE "study_step" DROP CONSTRAINT IF EXISTS "study_step_kind_check";
--> statement-breakpoint
ALTER TABLE "study_step" ADD CONSTRAINT "study_step_kind_check"
  CHECK ("kind" IN ('scripture', 'text', 'reflection', 'character', 'image', 'video', 'link'));
--> statement-breakpoint
ALTER TABLE "study_step" ADD COLUMN IF NOT EXISTS "content" jsonb;
--> statement-breakpoint
-- stepType says how much of a book a passage covers, which only a scripture
-- step has.
ALTER TABLE "study_step" ALTER COLUMN "stepType" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "study_step" DROP CONSTRAINT IF EXISTS "study_step_scripture_check";
--> statement-breakpoint
ALTER TABLE "study_step" ADD CONSTRAINT "study_step_scripture_check" CHECK (
  ("kind" = 'scripture' AND "bookAbbreviation" IS NOT NULL)
  OR ("kind" <> 'scripture' AND "content" IS NOT NULL)
);
--> statement-breakpoint
-- A step that is not Scripture has no read / type / listen: it is just done.
ALTER TYPE "study_mode" ADD VALUE IF NOT EXISTS 'done';
