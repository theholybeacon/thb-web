"use server";

import { User } from "@/app/common/user/model/User";
import { UserRepository } from "@/app/common/user/repository/UserRepository";
import { GiftSubscriptionRepository } from "../../repository/GiftSubscriptionRepository";

export type SponsorInfo = {
	user: Pick<User, "id" | "name" | "profilePicture">;
	sponsoredSince: Date | null;
};

export type SponsorshipInfo = {
	sponsors: SponsorInfo[];
	sponsored: SponsorInfo[];
};

export async function giftSubscriptionGetSponsorshipInfoSS(
	userId: string
): Promise<SponsorshipInfo> {
	const giftRepo = new GiftSubscriptionRepository();
	const userRepo = new UserRepository();

	// Get gifts where this user is the recipient (claimed) → sponsors
	const giftsReceived = await giftRepo.getByRecipientId(userId);
	const claimedGiftsReceived = giftsReceived.filter((g) => g.status === "claimed");

	// Get gifts where this user is the gifter (claimed) → sponsored
	const giftsGiven = await giftRepo.getByGifterId(userId);
	const claimedGiftsGiven = giftsGiven.filter((g) => g.status === "claimed");

	// Fetch sponsor user info
	const sponsors: SponsorInfo[] = await Promise.all(
		claimedGiftsReceived.map(async (gift) => {
			const user = await userRepo.getById(gift.gifterId);
			return {
				user: {
					id: user.id,
					name: user.name,
					profilePicture: user.profilePicture,
				},
				sponsoredSince: gift.claimedAt,
			};
		})
	);

	// Fetch sponsored user info
	const sponsored: SponsorInfo[] = await Promise.all(
		claimedGiftsGiven
			.filter((gift) => gift.recipientId !== null)
			.map(async (gift) => {
				const user = await userRepo.getById(gift.recipientId!);
				return {
					user: {
						id: user.id,
						name: user.name,
						profilePicture: user.profilePicture,
					},
					sponsoredSince: gift.claimedAt,
				};
			})
	);

	return { sponsors, sponsored };
}
