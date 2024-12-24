ALTER TABLE "user" ADD COLUMN "authId" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_authId_unique" UNIQUE("authId");