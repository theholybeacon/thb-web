"use server";

import { GiftSubscription } from "../../model/GiftSubscription";
import { GiftSubscriptionRepository } from "../../repository/GiftSubscriptionRepository";

export async function giftSubscriptionGetByClaimTokenSS(
	claimToken: string
): Promise<GiftSubscription | null> {
	const repository = new GiftSubscriptionRepository();
	return await repository.getByClaimToken(claimToken);
}
