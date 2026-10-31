-- The welcome week: seven days of premium every reader gets once, on their
-- first sign-in (new readers) or their next one (readers who were already free).
-- NULL means it was never granted; once set it is never granted again, even
-- after it ends. See src/lib/premium.ts and welcomePremiumClaimSS.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "welcomePremiumEndsAt" timestamp;
