import { GiftSubscription, GiftSubscriptionInsert } from "../model/GiftSubscription";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { logger } from "@/app/utils/logger";
import { giftSubscriptionTable } from "@/db/schema/giftSubscription";

const log = logger.child({ module: "GiftSubscriptionPostgreSQLDao" });

export class GiftSubscriptionPostgreSQLDao {
	async create(g: GiftSubscriptionInsert): Promise<GiftSubscription> {
		log.trace("create");
		const response = await db.insert(giftSubscriptionTable).values(g).returning();
		return response[0];
	}

	async getById(id: string): Promise<GiftSubscription | null> {
		log.trace("getById");
		const response = await db.query.giftSubscriptionTable.findFirst({
			where: eq(giftSubscriptionTable.id, id),
		});
		return response || null;
	}

	async getByClaimToken(claimToken: string): Promise<GiftSubscription | null> {
		log.trace("getByClaimToken");
		const response = await db.query.giftSubscriptionTable.findFirst({
			where: eq(giftSubscriptionTable.claimToken, claimToken),
		});
		return response || null;
	}

	async getByGifterId(gifterId: string): Promise<GiftSubscription[]> {
		log.trace("getByGifterId");
		const response = await db.query.giftSubscriptionTable.findMany({
			where: eq(giftSubscriptionTable.gifterId, gifterId),
		});
		return response;
	}

	async getByRecipientId(recipientId: string): Promise<GiftSubscription[]> {
		log.trace("getByRecipientId");
		const response = await db.query.giftSubscriptionTable.findMany({
			where: eq(giftSubscriptionTable.recipientId, recipientId),
		});
		return response;
	}

	async getByMembershipRequestId(membershipRequestId: string): Promise<GiftSubscription | null> {
		log.trace("getByMembershipRequestId");
		const response = await db.query.giftSubscriptionTable.findFirst({
			where: eq(giftSubscriptionTable.membershipRequestId, membershipRequestId),
		});
		return response || null;
	}

	async update(id: string, data: Partial<GiftSubscriptionInsert>): Promise<GiftSubscription> {
		log.trace("update");
		const result = await db
			.update(giftSubscriptionTable)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(giftSubscriptionTable.id, id))
			.returning();
		return result[0];
	}

	async delete(id: string): Promise<void> {
		log.trace("delete");
		await db.delete(giftSubscriptionTable).where(eq(giftSubscriptionTable.id, id));
	}
}
