import { z } from 'zod';

export class Chapter {
	static schema = z.object({
		chapter_id: z.string().uuid(),
		book_id: z.string().uuid(),
		chapter_number: z.number().int(),
		num_verses: z.number().int().default(0).optional(),
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

	static type = Chapter.schema._type;

	chapterId: string;
	bookId: string;
	chapterNumber: number;
	numVerses?: number;
	createdAt?: Date;
	updatedAt?: Date;

	protected constructor(data: z.infer<typeof Chapter.schema>) {
		this.chapterId = data.chapter_id;
		this.bookId = data.book_id;
		this.chapterNumber = data.chapter_number;
		this.numVerses = data.num_verses;
		this.createdAt = data.created_at;
		this.updatedAt = data.updated_at;
	}

	static create(data: unknown): Chapter {
		const parsedData = Chapter.schema.parse(data);
		return new Chapter(parsedData);
	}
}

