import { GiftSubscriptionPostgreSQLDao } from "../dao/GiftSubscriptionPostgreSQLDao";
import { GiftSubscription, GiftSubscriptionInsert } from "../model/GiftSubscription";

export class GiftSubscriptionRepository {
	private dao: GiftSubscriptionPostgreSQLDao = new GiftSubscriptionPostgreSQLDao();

	async create(g: GiftSubscriptionInsert): Promise<GiftSubscription> {
		return await this.dao.create(g);
	}

	async getById(id: string): Promise<GiftSubscription | null> {
		return await this.dao.getById(id);
	}

	async getByClaimToken(claimToken: string): Promise<GiftSubscription | null> {
		return await this.dao.getByClaimToken(claimToken);
	}

	async update(id: string, data: Partial<GiftSubscriptionInsert>): Promise<GiftSubscription> {
		return await this.dao.update(id, data);
	}

	async delete(id: string): Promise<void> {
		return await this.dao.delete(id);
	}
}
