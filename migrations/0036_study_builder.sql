-- The conversational study builder: a reader talks a plan into shape with the
-- AI instead of filling in a form. Conversations keep the plan being assembled
-- (`draft`) and their turns; `study_builder_memory` keeps what the builder has
-- learned about the reader across conversations. All three are small, per-user
-- and cascade away with the user.
CREATE TABLE IF NOT EXISTS "study_builder_conversation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"status" varchar(10) DEFAULT 'active' NOT NULL,
	"title" varchar(255),
	"draft" jsonb,
	"bibleId" uuid,
	"studyId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_builder_conversation" ADD CONSTRAINT "study_builder_conversation_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_builder_conversation" ADD CONSTRAINT "study_builder_conversation_bibleId_bible_id_fk"
  FOREIGN KEY ("bibleId") REFERENCES "public"."bible"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_builder_conversation" ADD CONSTRAINT "study_builder_conversation_studyId_study_id_fk"
  FOREIGN KEY ("studyId") REFERENCES "public"."study"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "study_builder_conversation_user_idx" ON "study_builder_conversation" USING btree ("userId", "updatedAt");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "study_builder_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversationId" uuid NOT NULL,
	"role" varchar(10) NOT NULL,
	"content" text NOT NULL,
	"payload" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_builder_message" ADD CONSTRAINT "study_builder_message_conversationId_fk"
  FOREIGN KEY ("conversationId") REFERENCES "public"."study_builder_conversation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "study_builder_message_conversation_idx" ON "study_builder_message" USING btree ("conversationId", "createdAt");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "study_builder_memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"fact" varchar(500) NOT NULL,
	"conversationId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_builder_memory" ADD CONSTRAINT "study_builder_memory_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_builder_memory" ADD CONSTRAINT "study_builder_memory_conversationId_fk"
  FOREIGN KEY ("conversationId") REFERENCES "public"."study_builder_conversation"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "study_builder_memory_user_idx" ON "study_builder_memory" USING btree ("userId");
