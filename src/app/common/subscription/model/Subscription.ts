import { subscriptionTable } from "@/db/schema/subscription";
import { User } from "../../user/model/User";

export type SubscriptionInsert = typeof subscriptionTable.$inferInsert;
export type Subscription = typeof subscriptionTable.$inferSelect;

export type SubscriptionWithUser = Subscription & {
	user: User;
};
