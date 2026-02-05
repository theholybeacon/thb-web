import { MembershipRequestPostgreSQLDao } from "../dao/MembershipRequestPostgreSQLDao";
import { MembershipRequest, MembershipRequestInsert } from "../model/MembershipRequest";

export class MembershipRequestRepository {
	private dao: MembershipRequestPostgreSQLDao = new MembershipRequestPostgreSQLDao();

	async create(m: MembershipRequestInsert): Promise<MembershipRequest> {
		return await this.dao.create(m);
	}

	async getById(id: string): Promise<MembershipRequest | null> {
		return await this.dao.getById(id);
	}

	async getByRequesterId(requesterId: string): Promise<MembershipRequest | null> {
		return await this.dao.getByRequesterId(requesterId);
	}

	async getPendingByRequesterId(requesterId: string): Promise<MembershipRequest | null> {
		return await this.dao.getPendingByRequesterId(requesterId);
	}

	async getAllPending(): Promise<MembershipRequest[]> {
		return await this.dao.getAllPending();
	}

	async getPendingCount(): Promise<number> {
		return await this.dao.getPendingCount();
	}

	async getQueuePosition(requesterId: string): Promise<number | null> {
		return await this.dao.getQueuePosition(requesterId);
	}

	async getLastFulfilled(): Promise<MembershipRequest | null> {
		return await this.dao.getLastFulfilled();
	}

	async update(id: string, data: Partial<MembershipRequestInsert>): Promise<MembershipRequest> {
		return await this.dao.update(id, data);
	}

	async delete(id: string): Promise<void> {
		return await this.dao.delete(id);
	}
}
