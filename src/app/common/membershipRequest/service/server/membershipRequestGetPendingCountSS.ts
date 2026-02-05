"use server";

import { MembershipRequestRepository } from "../../repository/MembershipRequestRepository";

export async function membershipRequestGetPendingCountSS(): Promise<number> {
	const repository = new MembershipRequestRepository();
	return await repository.getPendingCount();
}
