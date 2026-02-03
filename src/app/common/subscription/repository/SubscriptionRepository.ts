import { SubscriptionPostgreSQLDao } from "../dao/SubscriptionPostgreSQLDao";
import { Subscription, SubscriptionInsert } from "../model/Subscription";

export class SubscriptionRepository {
	private dao: SubscriptionPostgreSQLDao = new SubscriptionPostgreSQLDao();

	async create(s: SubscriptionInsert): Promise<Subscription> {
		return await this.dao.create(s);
	}

	async getById(id: string): Promise<Subscription | null> {
		return await this.dao.getById(id);
	}

	async getByUserId(userId: string): Promise<Subscription | null> {
		return await this.dao.getByUserId(userId);
	}

	async getByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
		return await this.dao.getByStripeSubscriptionId(stripeSubscriptionId);
	}

	async getByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
		return await this.dao.getByStripeCustomerId(stripeCustomerId);
	}

	async update(id: string, data: Partial<SubscriptionInsert>): Promise<Subscription> {
		return await this.dao.update(id, data);
	}

	async updateByStripeSubscriptionId(
		stripeSubscriptionId: string,
		data: Partial<SubscriptionInsert>
	): Promise<Subscription | null> {
		return await this.dao.updateByStripeSubscriptionId(stripeSubscriptionId, data);
	}

	async delete(id: string): Promise<void> {
		return await this.dao.delete(id);
	}

	async deleteByUserId(userId: string): Promise<void> {
		return await this.dao.deleteByUserId(userId);
	}
}
