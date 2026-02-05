"use server";

import { User } from "@/app/common/user/model/User";
import { UserRepository } from "@/app/common/user/repository/UserRepository";
import { MembershipRequestRepository } from "../../repository/MembershipRequestRepository";

export type LastFulfilledInfo = {
	recipient: Pick<User, "id" | "name" | "profilePicture"> | null;
	sponsor: Pick<User, "id" | "name" | "profilePicture"> | null;
	fulfilledAt: Date | null;
};

export async function membershipRequestGetLastFulfilledSS(): Promise<LastFulfilledInfo | null> {
	const membershipRepo = new MembershipRequestRepository();
	const userRepo = new UserRepository();

	const lastFulfilled = await membershipRepo.getLastFulfilled();
	if (!lastFulfilled) {
		return null;
	}

	let recipient: Pick<User, "id" | "name" | "profilePicture"> | null = null;
	let sponsor: Pick<User, "id" | "name" | "profilePicture"> | null = null;

	try {
		const recipientUser = await userRepo.getById(lastFulfilled.requesterId);
		recipient = {
			id: recipientUser.id,
			name: recipientUser.name,
			profilePicture: recipientUser.profilePicture,
		};
	} catch {
		// User might not exist
	}

	if (lastFulfilled.fulfillerId) {
		try {
			const sponsorUser = await userRepo.getById(lastFulfilled.fulfillerId);
			sponsor = {
				id: sponsorUser.id,
				name: sponsorUser.name,
				profilePicture: sponsorUser.profilePicture,
			};
		} catch {
			// User might not exist
		}
	}

	return {
		recipient,
		sponsor,
		fulfilledAt: lastFulfilled.fulfilledAt,
	};
}
