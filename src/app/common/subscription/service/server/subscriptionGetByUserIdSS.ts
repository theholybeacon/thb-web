"use server";

import { Subscription } from "../../model/Subscription";
import { SubscriptionRepository } from "../../repository/SubscriptionRepository";

export async function subscriptionGetByUserIdSS(userId: string): Promise<Subscription | null> {
	const repository = new SubscriptionRepository();
	return await repository.getByUserId(userId);
}
