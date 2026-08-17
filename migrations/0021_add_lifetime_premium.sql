-- Lifetime premium: a comp tier granted out-of-band (scripts/grant-lifetime.ts),
-- independent of Stripe. A lifetime user has no `subscription` row at all.
-- `lifetimePremiumGrantedAt` is provenance only — nothing reads it for access.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "lifetimePremium" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "lifetimePremiumGrantedAt" timestamp;
