"use server";

import { MembershipRequest } from "../../model/MembershipRequest";
import { MembershipRequestRepository } from "../../repository/MembershipRequestRepository";

export async function membershipRequestGetPendingByRequesterIdSS(
	requesterId: string
): Promise<MembershipRequest | null> {
	const repository = new MembershipRequestRepository();
	return await repository.getPendingByRequesterId(requesterId);
}
