CREATE TABLE IF NOT EXISTS "entity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"datasetId" varchar(100),
	"slug" varchar(160) NOT NULL,
	"name" varchar(255) NOT NULL,
	"aliases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gender" varchar(20),
	"birthYear" integer,
	"deathYear" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entity_datasetId_unique" UNIQUE("datasetId"),
	CONSTRAINT "entity_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "entity_mention" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entityId" uuid NOT NULL,
	"bookAbbreviation" varchar(10) NOT NULL,
	"chapter" integer NOT NULL,
	"verse" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entity_mention_entityId_bookAbbreviation_chapter_verse_unique" UNIQUE("entityId","bookAbbreviation","chapter","verse")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entity_mention" ADD CONSTRAINT "entity_mention_entityId_entity_id_fk" FOREIGN KEY ("entityId") REFERENCES "entity"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "entity_mention_book_chapter_idx" ON "entity_mention" ("bookAbbreviation","chapter");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "entity_mention_entityId_idx" ON "entity_mention" ("entityId");
