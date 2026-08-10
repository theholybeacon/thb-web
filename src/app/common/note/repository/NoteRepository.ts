import { Note, NoteInsert } from "../model/Note";
import { NotePostgreSQLDao } from "../dao/NotePostgreSQLDao";

export class NoteRepository {

	private notePostgreSQLDao = new NotePostgreSQLDao();

	async create(note: NoteInsert): Promise<Note> {
		return await this.notePostgreSQLDao.create(note);
	}

	async getById(id: string): Promise<Note | null> {
		return await this.notePostgreSQLDao.getById(id);
	}

	async getByOwnerId(ownerId: string): Promise<Note[]> {
		return await this.notePostgreSQLDao.getByOwnerId(ownerId);
	}

	async getByOwnerAndChapterContext(
		ownerId: string,
		bibleId: string,
		bookAbbreviation: string,
		chapter: number,
	): Promise<Note[]> {
		return await this.notePostgreSQLDao.getByOwnerAndChapterContext(ownerId, bibleId, bookAbbreviation, chapter);
	}

	async update(id: string, ownerId: string, data: Partial<Note>): Promise<Note | null> {
		return await this.notePostgreSQLDao.update(id, ownerId, data);
	}

	async delete(id: string, ownerId: string): Promise<void> {
		return await this.notePostgreSQLDao.delete(id, ownerId);
	}
}
