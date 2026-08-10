import { logger } from "@/app/utils/logger";
import { and, desc, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { noteTable } from "@/db/schema/note";
import { Note, NoteInsert } from "../model/Note";

const log = logger.child({ module: 'NotePostgreSQLDao' });

export class NotePostgreSQLDao {

	async create(note: NoteInsert): Promise<Note> {
		log.trace("create");
		const returned = await db.insert(noteTable).values(note).returning();
		return returned[0];
	}

	async getById(id: string): Promise<Note | null> {
		log.trace("getById");
		const returned = await db.query.noteTable.findFirst({
			where: eq(noteTable.id, id),
		});
		return returned ?? null;
	}

	async getByOwnerId(ownerId: string): Promise<Note[]> {
		log.trace("getByOwnerId");
		return await db.query.noteTable.findMany({
			where: eq(noteTable.ownerId, ownerId),
			orderBy: [desc(noteTable.updatedAt)],
		});
	}

	/**
	 * Every note relevant while reading one chapter: the chapter's own notes and
	 * its verse notes (both matched canonically, so they follow the reader across
	 * translations), the book-level notes above them, and the bible-level notes —
	 * those last matched on bibleId, since a note about a translation only belongs
	 * to that translation.
	 */
	async getByOwnerAndChapterContext(
		ownerId: string,
		bibleId: string,
		bookAbbreviation: string,
		chapter: number,
	): Promise<Note[]> {
		log.trace("getByOwnerAndChapterContext");
		return await db.query.noteTable.findMany({
			where: and(
				eq(noteTable.ownerId, ownerId),
				or(
					and(eq(noteTable.bookAbbreviation, bookAbbreviation), eq(noteTable.chapter, chapter)),
					and(eq(noteTable.targetType, "book"), eq(noteTable.bookAbbreviation, bookAbbreviation)),
					and(eq(noteTable.targetType, "bible"), eq(noteTable.bibleId, bibleId)),
				),
			),
			orderBy: [desc(noteTable.updatedAt)],
		});
	}

	async update(id: string, ownerId: string, data: Partial<Note>): Promise<Note | null> {
		log.trace("update");
		const returned = await db.update(noteTable)
			.set({ ...data, updatedAt: new Date() })
			.where(and(eq(noteTable.id, id), eq(noteTable.ownerId, ownerId)))
			.returning();
		return returned[0] ?? null;
	}

	async delete(id: string, ownerId: string): Promise<void> {
		log.trace("delete");
		await db.delete(noteTable)
			.where(and(eq(noteTable.id, id), eq(noteTable.ownerId, ownerId)));
	}
}
