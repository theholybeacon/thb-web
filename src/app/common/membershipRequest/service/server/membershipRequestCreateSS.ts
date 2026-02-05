"use server";

import { MembershipRequest, MembershipRequestInsert } from "../../model/MembershipRequest";
import { MembershipRequestRepository } from "../../repository/MembershipRequestRepository";

export async function membershipRequestCreateSS(
	m: MembershipRequestInsert
): Promise<MembershipRequest> {
	const repository = new MembershipRequestRepository();
	return await repository.create(m);
}
