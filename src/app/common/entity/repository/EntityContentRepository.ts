import { EntityContentPostgreSQLDao } from "../dao/EntityContentPostgreSQLDao";
import { EntityContent, EntityContentFlagInsert } from "../model/EntityContent";

export class EntityContentRepository {
	private dao = new EntityContentPostgreSQLDao();

	getByEntityId(entityId: string): Promise<EntityContent | null> {
		return this.dao.getByEntityId(entityId);
	}
	ensureRow(entityId: string): Promise<void> {
		return this.dao.ensureRow(entityId);
	}
	claimForGeneration(entityId: string): Promise<boolean> {
		return this.dao.claimForGeneration(entityId);
	}
	markReady(entityId: string, data: Partial<EntityContent>): Promise<void> {
		return this.dao.markReady(entityId, data);
	}
	markFailed(entityId: string, error: string): Promise<void> {
		return this.dao.markFailed(entityId, error);
	}
	createFlag(flag: EntityContentFlagInsert): Promise<void> {
		return this.dao.createFlag(flag);
	}
}
