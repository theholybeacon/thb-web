"use server";

import { Subscription, SubscriptionInsert } from "../../model/Subscription";
import { SubscriptionRepository } from "../../repository/SubscriptionRepository";

export async function subscriptionUpdateSS(
	id: string,
	data: Partial<SubscriptionInsert>
): Promise<Subscription> {
	const repository = new SubscriptionRepository();
	return await repository.update(id, data);
}

export async function subscriptionUpdateByStripeSubscriptionIdSS(
	stripeSubscriptionId: string,
	data: Partial<SubscriptionInsert>
): Promise<Subscription | null> {
	const repository = new SubscriptionRepository();
	return await repository.updateByStripeSubscriptionId(stripeSubscriptionId, data);
}
