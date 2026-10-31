-- The first-visit questions (/welcome) and whether the reader has been through them.
--
-- Readers who joined before /welcome shipped are marked as through it, so it
-- only ever greets new readers.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "readerStart" jsonb;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "onboardedAt" timestamp;
--> statement-breakpoint
UPDATE "user" SET "onboardedAt" = COALESCE("createdAt", now()) WHERE "onboardedAt" IS NULL AND "readerStart" IS NULL;
