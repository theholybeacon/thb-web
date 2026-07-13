DO $$ BEGIN
 CREATE TYPE "content_generation_status" AS ENUM('pending','generating','ready','failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "content_flag_status" AS ENUM('open','reviewed','dismissed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "entity_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entityId" uuid NOT NULL,
	"generationStatus" "content_generation_status" DEFAULT 'pending' NOT NULL,
	"model" varchar(60),
	"overview" text,
	"overviewRefs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"significance" text,
	"significanceRefs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"timeline" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"relationships" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"citationsValid" boolean DEFAULT true NOT NULL,
	"error" text,
	"generatedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entity_content_entityId_unique" UNIQUE("entityId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "entity_content_flag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entityContentId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"section" varchar(40) NOT NULL,
	"reason" text,
	"status" "content_flag_status" DEFAULT 'open' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entity_content" ADD CONSTRAINT "entity_content_entityId_entity_id_fk" FOREIGN KEY ("entityId") REFERENCES "entity"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entity_content_flag" ADD CONSTRAINT "entity_content_flag_entityContentId_entity_content_id_fk" FOREIGN KEY ("entityContentId") REFERENCES "entity_content"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entity_content_flag" ADD CONSTRAINT "entity_content_flag_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
