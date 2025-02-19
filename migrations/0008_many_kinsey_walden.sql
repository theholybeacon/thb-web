CREATE TABLE IF NOT EXISTS "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"studyId" uuid NOT NULL,
	"currentStep" uuid,
	"currentBookId" uuid,
	"currentChapterId" uuid,
	"currentVerseId" uuid,
	"progressDetail" text,
	"startedAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_study_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sessionId" uuid NOT NULL,
	"bookId" uuid NOT NULL,
	"chapterId" uuid NOT NULL,
	"completed" boolean DEFAULT false,
	"completedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "study_step" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studyId" uuid NOT NULL,
	"stepNumber" integer NOT NULL,
	"description" text,
	"stepType" varchar(21) NOT NULL,
	"startBookId" uuid,
	"endBookId" uuid,
	"startChapterId" uuid,
	"endChapterId" uuid,
	"startVerseId" uuid,
	"endVerseId" uuid,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "study" DROP CONSTRAINT "study_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "study" ADD COLUMN "depth" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "study" ADD COLUMN "length" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "study" ADD COLUMN "topic" varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE "study" ADD COLUMN "ownerId" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_studyId_study_id_fk" FOREIGN KEY ("studyId") REFERENCES "public"."study"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_currentStep_study_step_id_fk" FOREIGN KEY ("currentStep") REFERENCES "public"."study_step"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_currentBookId_book_id_fk" FOREIGN KEY ("currentBookId") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_currentChapterId_chapter_id_fk" FOREIGN KEY ("currentChapterId") REFERENCES "public"."chapter"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_currentVerseId_verse_id_fk" FOREIGN KEY ("currentVerseId") REFERENCES "public"."verse"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_study_progress" ADD CONSTRAINT "user_study_progress_sessionId_session_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."session"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_study_progress" ADD CONSTRAINT "user_study_progress_bookId_book_id_fk" FOREIGN KEY ("bookId") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_study_progress" ADD CONSTRAINT "user_study_progress_chapterId_chapter_id_fk" FOREIGN KEY ("chapterId") REFERENCES "public"."chapter"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_step" ADD CONSTRAINT "study_step_studyId_study_id_fk" FOREIGN KEY ("studyId") REFERENCES "public"."study"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_step" ADD CONSTRAINT "study_step_startBookId_book_id_fk" FOREIGN KEY ("startBookId") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_step" ADD CONSTRAINT "study_step_endBookId_book_id_fk" FOREIGN KEY ("endBookId") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_step" ADD CONSTRAINT "study_step_startChapterId_chapter_id_fk" FOREIGN KEY ("startChapterId") REFERENCES "public"."chapter"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_step" ADD CONSTRAINT "study_step_endChapterId_chapter_id_fk" FOREIGN KEY ("endChapterId") REFERENCES "public"."chapter"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_step" ADD CONSTRAINT "study_step_startVerseId_verse_id_fk" FOREIGN KEY ("startVerseId") REFERENCES "public"."verse"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study_step" ADD CONSTRAINT "study_step_endVerseId_verse_id_fk" FOREIGN KEY ("endVerseId") REFERENCES "public"."verse"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "study" ADD CONSTRAINT "study_ownerId_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "study" DROP COLUMN IF EXISTS "type";--> statement-breakpoint
ALTER TABLE "study" DROP COLUMN IF EXISTS "userId";