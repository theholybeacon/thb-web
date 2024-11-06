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

	chapter_id: string;
	book_id: string;
	chapter_number: number;
	num_verses?: number;
	created_at?: Date;
	updated_at?: Date;

	protected constructor(data: z.infer<typeof Chapter.schema>) {
		this.chapter_id = data.chapter_id;
		this.book_id = data.book_id;
		this.chapter_number = data.chapter_number;
		this.num_verses = data.num_verses;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
	}

	static create(data: unknown): Chapter {
		const parsedData = Chapter.schema.parse(data);
		return new Chapter(parsedData);
	}
}

