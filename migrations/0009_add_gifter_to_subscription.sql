ALTER TABLE "subscription" ADD COLUMN "gifterId" uuid;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "giftSubscriptionId" uuid;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "membershipRequestId" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_gifterId_user_id_fk" FOREIGN KEY ("gifterId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
