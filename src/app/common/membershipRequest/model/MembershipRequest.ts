import { membershipRequestTable } from "@/db/schema/membershipRequest";
import { User } from "../../user/model/User";

export type MembershipRequestInsert = typeof membershipRequestTable.$inferInsert;
export type MembershipRequest = typeof membershipRequestTable.$inferSelect;

export type MembershipRequestWithUsers = MembershipRequest & {
	requester: User;
	fulfiller: User | null;
};
