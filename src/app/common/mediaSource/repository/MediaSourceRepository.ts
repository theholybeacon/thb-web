import { MediaSourcePostgreSQLDao } from "../dao/MediaSourcePostgreSQLDao";
import { MediaSource, MediaSourceInsert } from "../model/MediaSource";

export class MediaSourceRepository {
	private dao = new MediaSourcePostgreSQLDao();

	async getAll(): Promise<MediaSource[]> {
		return await this.dao.getAll();
	}

	async create(source: MediaSourceInsert): Promise<MediaSource> {
		return await this.dao.create(source);
	}

	async delete(id: string): Promise<void> {
		await this.dao.delete(id);
	}
}
