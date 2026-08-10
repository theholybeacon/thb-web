DO $$ BEGIN CREATE TYPE "email_kind" AS ENUM('daily_reminder', 'streak_at_risk', 'trial_ending'); EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "email_send_status" AS ENUM('claimed', 'sent', 'failed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "timezone" varchar(64);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "emailRemindersEnabled" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_send_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"kind" "email_kind" NOT NULL,
	"sendDate" date NOT NULL,
	"status" "email_send_status" DEFAULT 'claimed' NOT NULL,
	"error" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_send_log_unique" UNIQUE("userId","kind","sendDate")
);
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "email_send_log" ADD CONSTRAINT "email_send_log_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_send_log_date_idx" ON "email_send_log" ("sendDate");
