"use server";

import { MembershipRequest } from "../../model/MembershipRequest";
import { MembershipRequestRepository } from "../../repository/MembershipRequestRepository";

export async function membershipRequestGetAllPendingSS(): Promise<MembershipRequest[]> {
	const repository = new MembershipRequestRepository();
	return await repository.getAllPending();
}
