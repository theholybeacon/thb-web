"use server";

import { MembershipRequest, MembershipRequestInsert } from "../../model/MembershipRequest";
import { MembershipRequestRepository } from "../../repository/MembershipRequestRepository";

export async function membershipRequestUpdateSS(
	id: string,
	data: Partial<MembershipRequestInsert>
): Promise<MembershipRequest> {
	const repository = new MembershipRequestRepository();
	return await repository.update(id, data);
}
