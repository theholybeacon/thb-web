DO $$ BEGIN CREATE TYPE "contribution_section" AS ENUM('overview','timeline','relationships','significance','general'); EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "contribution_kind" AS ENUM('fact','analysis','correction'); EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "contribution_status" AS ENUM('published','removed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "comment_status" AS ENUM('published','removed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "vote_target_type" AS ENUM('contribution','comment'); EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "community_flag_status" AS ENUM('open','reviewed','dismissed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contribution" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entityId" uuid NOT NULL,
	"section" "contribution_section" NOT NULL,
	"userId" uuid NOT NULL,
	"kind" "contribution_kind" NOT NULL,
	"body" text NOT NULL,
	"citations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"status" "contribution_status" DEFAULT 'published' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contributionId" uuid NOT NULL,
	"parentCommentId" uuid,
	"userId" uuid NOT NULL,
	"body" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"status" "comment_status" DEFAULT 'published' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_vote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"targetType" "vote_target_type" NOT NULL,
	"targetId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"value" smallint NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "community_vote_unique" UNIQUE("targetType","targetId","userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_flag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"targetType" "vote_target_type" NOT NULL,
	"targetId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"reason" text,
	"status" "community_flag_status" DEFAULT 'open' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "contribution" ADD CONSTRAINT "contribution_entityId_entity_id_fk" FOREIGN KEY ("entityId") REFERENCES "entity"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "contribution" ADD CONSTRAINT "contribution_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "community_comment" ADD CONSTRAINT "community_comment_contributionId_contribution_id_fk" FOREIGN KEY ("contributionId") REFERENCES "contribution"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "community_comment" ADD CONSTRAINT "community_comment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "community_vote" ADD CONSTRAINT "community_vote_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "community_flag" ADD CONSTRAINT "community_flag_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contribution_entity_section_idx" ON "contribution" ("entityId","section");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_comment_contribution_idx" ON "community_comment" ("contributionId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_vote_target_idx" ON "community_vote" ("targetType","targetId");
