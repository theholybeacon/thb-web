"use server";

import { GiftSubscription, GiftSubscriptionInsert } from "../../model/GiftSubscription";
import { GiftSubscriptionRepository } from "../../repository/GiftSubscriptionRepository";

export async function giftSubscriptionCreateSS(
	g: GiftSubscriptionInsert
): Promise<GiftSubscription> {
	const repository = new GiftSubscriptionRepository();
	return await repository.create(g);
}
