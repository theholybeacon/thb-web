import { MembershipRequest, MembershipRequestInsert } from "../model/MembershipRequest";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { logger } from "@/app/utils/logger";
import { membershipRequestTable } from "@/db/schema/membershipRequest";

const log = logger.child({ module: "MembershipRequestPostgreSQLDao" });

export class MembershipRequestPostgreSQLDao {
	async create(m: MembershipRequestInsert): Promise<MembershipRequest> {
		log.trace("create");
		const response = await db.insert(membershipRequestTable).values(m).returning();
		return response[0];
	}

	async getById(id: string): Promise<MembershipRequest | null> {
		log.trace("getById");
		const response = await db.query.membershipRequestTable.findFirst({
			where: eq(membershipRequestTable.id, id),
		});
		return response || null;
	}

	async getByRequesterId(requesterId: string): Promise<MembershipRequest | null> {
		log.trace("getByRequesterId");
		const response = await db.query.membershipRequestTable.findFirst({
			where: eq(membershipRequestTable.requesterId, requesterId),
		});
		return response || null;
	}

	async getPendingByRequesterId(requesterId: string): Promise<MembershipRequest | null> {
		log.trace("getPendingByRequesterId");
		const response = await db.query.membershipRequestTable.findFirst({
			where: and(
				eq(membershipRequestTable.requesterId, requesterId),
				eq(membershipRequestTable.status, "pending")
			),
		});
		return response || null;
	}

	async getAllPending(): Promise<MembershipRequest[]> {
		log.trace("getAllPending");
		const response = await db.query.membershipRequestTable.findMany({
			where: eq(membershipRequestTable.status, "pending"),
			orderBy: (table, { asc }) => [asc(table.createdAt)],
		});
		return response;
	}

	async getPendingCount(): Promise<number> {
		log.trace("getPendingCount");
		const response = await db.query.membershipRequestTable.findMany({
			where: eq(membershipRequestTable.status, "pending"),
		});
		return response.length;
	}

	async getQueuePosition(requesterId: string): Promise<number | null> {
		log.trace("getQueuePosition");
		const allPending = await db.query.membershipRequestTable.findMany({
			where: eq(membershipRequestTable.status, "pending"),
			orderBy: (table, { asc }) => [asc(table.createdAt)],
		});
		const index = allPending.findIndex((r) => r.requesterId === requesterId);
		return index === -1 ? null : index + 1;
	}

	async getLastFulfilled(): Promise<MembershipRequest | null> {
		log.trace("getLastFulfilled");
		const response = await db.query.membershipRequestTable.findFirst({
			where: eq(membershipRequestTable.status, "fulfilled"),
			orderBy: (table, { desc }) => [desc(table.fulfilledAt)],
		});
		return response || null;
	}

	async update(id: string, data: Partial<MembershipRequestInsert>): Promise<MembershipRequest> {
		log.trace("update");
		const result = await db
			.update(membershipRequestTable)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(membershipRequestTable.id, id))
			.returning();
		return result[0];
	}

	async delete(id: string): Promise<void> {
		log.trace("delete");
		await db.delete(membershipRequestTable).where(eq(membershipRequestTable.id, id));
	}
}
