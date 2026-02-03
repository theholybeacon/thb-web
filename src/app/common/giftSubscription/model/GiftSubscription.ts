import { giftSubscriptionTable } from "@/db/schema/giftSubscription";
import { User } from "../../user/model/User";

export type GiftSubscriptionInsert = typeof giftSubscriptionTable.$inferInsert;
export type GiftSubscription = typeof giftSubscriptionTable.$inferSelect;

export type GiftSubscriptionWithUsers = GiftSubscription & {
	gifter: User;
	recipient: User | null;
};
