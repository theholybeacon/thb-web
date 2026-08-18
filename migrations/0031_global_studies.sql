-- Global studies: ready-made reading plans anyone can adopt.
--
-- A global study is a template, not something a session ever points at. It has
-- no owner and no translation; a reader "adopts" it, which copies the study and
-- all of its steps into their own account with their own bibleId, and the
-- session runs on that copy. Copying rather than sharing is what keeps every
-- downstream path unchanged: session bible resolution reads study.bibleId, the
-- ownership guards read study.ownerId, and an adopted plan can be edited or
-- deleted like any other study without touching the catalog.
--
-- ownerId therefore has to lose its NOT NULL: the alternative was a synthetic
-- "system" user row that nothing else in the schema needs.
ALTER TABLE "study" ALTER COLUMN "ownerId" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "study" ADD COLUMN IF NOT EXISTS "isGlobal" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
-- Stable identity for a catalog plan, so scripts/seed-global-studies.ts is an
-- upsert and not a duplicate factory. NULL for user-created studies, and UNIQUE
-- treats NULLs as distinct, so they are unconstrained.
ALTER TABLE "study" ADD COLUMN IF NOT EXISTS "slug" varchar(100);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "study_slug_unique" ON "study" USING btree ("slug");
--> statement-breakpoint
ALTER TABLE "study" ADD COLUMN IF NOT EXISTS "sortOrder" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "study" ADD COLUMN IF NOT EXISTS "sourceStudyId" uuid;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study" ADD CONSTRAINT "study_sourceStudyId_study_id_fk"
  FOREIGN KEY ("sourceStudyId") REFERENCES "public"."study"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
-- Only a global study may go unowned, and only a global study gets a slug.
ALTER TABLE "study" DROP CONSTRAINT IF EXISTS "study_owner_check";
--> statement-breakpoint
ALTER TABLE "study" ADD CONSTRAINT "study_owner_check" CHECK (
  ("isGlobal" = false AND "ownerId" IS NOT NULL AND "slug" IS NULL)
  OR ("isGlobal" = true AND "ownerId" IS NULL AND "slug" IS NOT NULL AND "sourceStudyId" IS NULL)
);
--> statement-breakpoint
-- The catalog listing: a handful of rows out of every study ever created.
CREATE INDEX IF NOT EXISTS "study_global_idx" ON "study" USING btree ("isGlobal","sortOrder");
--> statement-breakpoint
-- "has this reader already adopted this plan?", asked on every catalog render.
CREATE INDEX IF NOT EXISTS "study_source_owner_idx" ON "study" USING btree ("sourceStudyId","ownerId");
