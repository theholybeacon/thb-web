"use server";

import { GiftSubscription, GiftSubscriptionInsert } from "../../model/GiftSubscription";
import { GiftSubscriptionRepository } from "../../repository/GiftSubscriptionRepository";

export async function giftSubscriptionUpdateSS(
	id: string,
	data: Partial<GiftSubscriptionInsert>
): Promise<GiftSubscription> {
	const repository = new GiftSubscriptionRepository();
	return await repository.update(id, data);
}
