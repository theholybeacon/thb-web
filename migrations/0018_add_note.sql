CREATE TABLE IF NOT EXISTS "note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerId" uuid NOT NULL,
	"targetType" varchar(10) NOT NULL,
	"bibleId" uuid NOT NULL,
	"bookAbbreviation" varchar(10),
	"chapter" integer,
	"verse" integer,
	"reference" varchar(255),
	"bookName" varchar(255),
	"bibleSlug" varchar(100),
	"bookSlug" varchar(100),
	"title" varchar(255),
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "note" ADD CONSTRAINT "note_ownerId_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "note" ADD CONSTRAINT "note_bibleId_bible_id_fk" FOREIGN KEY ("bibleId") REFERENCES "public"."bible"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_owner_idx" ON "note" USING btree ("ownerId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_owner_chapter_idx" ON "note" USING btree ("ownerId","bookAbbreviation","chapter");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_owner_book_idx" ON "note" USING btree ("ownerId","bookAbbreviation");
