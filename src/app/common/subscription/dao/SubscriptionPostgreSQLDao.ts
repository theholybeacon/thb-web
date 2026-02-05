import { Subscription, SubscriptionInsert } from "../model/Subscription";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { logger } from "@/app/utils/logger";
import { subscriptionTable } from "@/db/schema/subscription";

const log = logger.child({ module: "SubscriptionPostgreSQLDao" });

export class SubscriptionPostgreSQLDao {
	async create(s: SubscriptionInsert): Promise<Subscription> {
		log.trace("create");
		const response = await db.insert(subscriptionTable).values(s).returning();
		return response[0];
	}

	async upsertByUserId(s: SubscriptionInsert): Promise<Subscription> {
		log.trace("upsertByUserId");
		const response = await db
			.insert(subscriptionTable)
			.values(s)
			.onConflictDoUpdate({
				target: subscriptionTable.userId,
				set: {
					stripeCustomerId: s.stripeCustomerId,
					stripeSubscriptionId: s.stripeSubscriptionId,
					stripePriceId: s.stripePriceId,
					status: s.status,
					billingInterval: s.billingInterval,
					currentPeriodStart: s.currentPeriodStart,
					currentPeriodEnd: s.currentPeriodEnd,
					cancelAtPeriodEnd: s.cancelAtPeriodEnd,
					gifterId: s.gifterId,
					giftSubscriptionId: s.giftSubscriptionId,
					membershipRequestId: s.membershipRequestId,
					updatedAt: new Date(),
				},
			})
			.returning();
		return response[0];
	}

	async getByGifterId(gifterId: string): Promise<Subscription[]> {
		log.trace("getByGifterId");
		const response = await db.query.subscriptionTable.findMany({
			where: eq(subscriptionTable.gifterId, gifterId),
		});
		return response;
	}

	async getById(id: string): Promise<Subscription | null> {
		log.trace("getById");
		const response = await db.query.subscriptionTable.findFirst({
			where: eq(subscriptionTable.id, id),
		});
		return response || null;
	}

	async getByUserId(userId: string): Promise<Subscription | null> {
		log.trace("getByUserId");
		const response = await db.query.subscriptionTable.findFirst({
			where: eq(subscriptionTable.userId, userId),
		});
		return response || null;
	}

	async getByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
		log.trace("getByStripeSubscriptionId");
		const response = await db.query.subscriptionTable.findFirst({
			where: eq(subscriptionTable.stripeSubscriptionId, stripeSubscriptionId),
		});
		return response || null;
	}

	async getByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
		log.trace("getByStripeCustomerId");
		const response = await db.query.subscriptionTable.findFirst({
			where: eq(subscriptionTable.stripeCustomerId, stripeCustomerId),
		});
		return response || null;
	}

	async update(id: string, data: Partial<SubscriptionInsert>): Promise<Subscription> {
		log.trace("update");
		const result = await db
			.update(subscriptionTable)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(subscriptionTable.id, id))
			.returning();
		return result[0];
	}

	async updateByStripeSubscriptionId(
		stripeSubscriptionId: string,
		data: Partial<SubscriptionInsert>
	): Promise<Subscription | null> {
		log.trace("updateByStripeSubscriptionId");
		const result = await db
			.update(subscriptionTable)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(subscriptionTable.stripeSubscriptionId, stripeSubscriptionId))
			.returning();
		return result[0] || null;
	}

	async delete(id: string): Promise<void> {
		log.trace("delete");
		await db.delete(subscriptionTable).where(eq(subscriptionTable.id, id));
	}

	async deleteByUserId(userId: string): Promise<void> {
		log.trace("deleteByUserId");
		await db.delete(subscriptionTable).where(eq(subscriptionTable.userId, userId));
	}
}
