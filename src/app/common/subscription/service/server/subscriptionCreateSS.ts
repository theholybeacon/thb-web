"use server";

import { Subscription, SubscriptionInsert } from "../../model/Subscription";
import { SubscriptionRepository } from "../../repository/SubscriptionRepository";

export async function subscriptionCreateSS(s: SubscriptionInsert): Promise<Subscription> {
	const repository = new SubscriptionRepository();
	return await repository.create(s);
}
