import { z } from 'zod';

export class Book {
	static schema = z.object({
		book_id: z.string().uuid(),
		bible_id: z.string().uuid(),
		name: z.string().max(100),
		book_order: z.number().int(),
		abbreviation: z.string().max(10).optional(),
		num_chapters: z.number().int().default(0).optional(),
		created_at: z.preprocess((arg) => {
			if (typeof arg === 'string' || arg instanceof Date) {
				const date = new Date(arg);
				return isNaN(date.getTime()) ? undefined : date;
			}
			return undefined;
		}, z.date().optional()),
		updated_at: z.preprocess((arg) => {
			if (typeof arg === 'string' || arg instanceof Date) {
				const date = new Date(arg);
				return isNaN(date.getTime()) ? undefined : date;
			}
			return undefined;
		}, z.date().optional()),
	});

	static type = Book.schema._type;

	bookId: string;
	bibleId: string;
	name: string;
	bookOrder: number;
	abbreviation?: string;
	numChapters?: number;
	createdAt?: Date;
	updatedAt?: Date;

	protected constructor(data: z.infer<typeof Book.schema>) {
		this.bookId = data.book_id;
		this.bibleId = data.bible_id;
		this.name = data.name;
		this.bookOrder = data.book_order;
		this.abbreviation = data.abbreviation;
		this.numChapters = data.num_chapters;
		this.createdAt = data.created_at;
		this.updatedAt = data.updated_at;
	}

	static create(data: unknown): Book {
		const parsedData = Book.schema.parse(data);
		return new Book(parsedData);
	}
}

