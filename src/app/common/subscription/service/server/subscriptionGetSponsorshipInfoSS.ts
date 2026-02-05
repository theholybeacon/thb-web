"use server";

import { User } from "@/app/common/user/model/User";
import { UserRepository } from "@/app/common/user/repository/UserRepository";
import { SubscriptionRepository } from "../../repository/SubscriptionRepository";

export type SponsorInfo = {
	user: Pick<User, "id" | "name" | "profilePicture">;
	sponsoredSince: Date | null;
};

export type SponsorshipInfo = {
	sponsors: SponsorInfo[];
	sponsored: SponsorInfo[];
};

export async function subscriptionGetSponsorshipInfoSS(
	userId: string
): Promise<SponsorshipInfo> {
	const subscriptionRepo = new SubscriptionRepository();
	const userRepo = new UserRepository();

	// "My Sponsor": my subscription has a gifterId
	const mySubscription = await subscriptionRepo.getByUserId(userId);
	const sponsors: SponsorInfo[] = [];

	if (mySubscription && mySubscription.gifterId) {
		const gifter = await userRepo.getById(mySubscription.gifterId);
		sponsors.push({
			user: {
				id: gifter.id,
				name: gifter.name,
				profilePicture: gifter.profilePicture,
			},
			sponsoredSince: mySubscription.createdAt,
		});
	}

	// "People I Sponsored": subscriptions where I am the gifter
	const sponsoredSubscriptions = await subscriptionRepo.getByGifterId(userId);
	const sponsored: SponsorInfo[] = await Promise.all(
		sponsoredSubscriptions.map(async (sub) => {
			const recipient = await userRepo.getById(sub.userId);
			return {
				user: {
					id: recipient.id,
					name: recipient.name,
					profilePicture: recipient.profilePicture,
				},
				sponsoredSince: sub.createdAt,
			};
		})
	);

	return { sponsors, sponsored };
}
