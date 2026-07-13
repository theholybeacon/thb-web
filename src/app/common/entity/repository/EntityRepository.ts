import { EntityPostgreSQLDao } from "../dao/EntityPostgreSQLDao";
import { Entity, EntityInsert, EntityMention, EntityMentionInsert } from "../model/Entity";

export class EntityRepository {
	private dao = new EntityPostgreSQLDao();

	async getBySlug(slug: string): Promise<Entity | null> {
		return await this.dao.getBySlug(slug);
	}

	async getById(id: string): Promise<Entity | null> {
		return await this.dao.getById(id);
	}

	async getMentionsByEntityId(entityId: string): Promise<EntityMention[]> {
		return await this.dao.getMentionsByEntityId(entityId);
	}

	async getByName(name: string): Promise<Entity | null> {
		return await this.dao.getByName(name);
	}

	async getChapterMentions(
		bookAbbreviation: string,
		chapter: number,
	): Promise<(EntityMention & { entity: Entity })[]> {
		return await this.dao.getChapterMentions(bookAbbreviation, chapter);
	}

	async getAllSlugs(): Promise<string[]> {
		return await this.dao.getAllSlugs();
	}

	async upsertByDatasetId(entity: EntityInsert): Promise<Entity> {
		return await this.dao.upsertByDatasetId(entity);
	}

	async insertMentionsIgnore(mentions: EntityMentionInsert[]): Promise<void> {
		return await this.dao.insertMentionsIgnore(mentions);
	}
}
