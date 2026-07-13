CREATE TABLE IF NOT EXISTS "user_daily_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"activityDate" date NOT NULL,
	"source" varchar(20),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_daily_activity_unique" UNIQUE("userId","activityDate")
);
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "user_daily_activity" ADD CONSTRAINT "user_daily_activity_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_daily_activity_user_idx" ON "user_daily_activity" ("userId");
