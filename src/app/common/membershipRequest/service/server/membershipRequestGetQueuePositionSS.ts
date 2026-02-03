"use server";

import { MembershipRequestRepository } from "../../repository/MembershipRequestRepository";

export async function membershipRequestGetQueuePositionSS(requesterId: string): Promise<number | null> {
	const repository = new MembershipRequestRepository();
	return await repository.getQueuePosition(requesterId);
}
