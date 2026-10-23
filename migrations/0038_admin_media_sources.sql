-- The admin panel (/admin).
--
-- user.isAdmin opens it. It is set by hand in the database and never by the
-- application: no code path writes it.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "isAdmin" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
-- The approved places studies take their images and videos from.
CREATE TABLE IF NOT EXISTS "media_source" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "kind" varchar(20) NOT NULL,
  "name" varchar(255) NOT NULL,
  "url" varchar(1000) NOT NULL,
  "notes" text,
  "addedById" uuid,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "media_source_kind_check" CHECK ("kind" IN ('youtube_channel', 'image_archive', 'website'))
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_source" ADD CONSTRAINT "media_source_addedById_user_id_fk"
  FOREIGN KEY ("addedById") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
