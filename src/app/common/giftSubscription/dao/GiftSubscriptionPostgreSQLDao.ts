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
