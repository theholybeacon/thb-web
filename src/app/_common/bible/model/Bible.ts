import { z } from 'zod';

export class Bible {
	static schema = z.object({
		bible_id: z.string().uuid(),
		name: z.string().max(100),
		language: z.string().max(50),
		version: z.string().max(50).optional(),
		description: z.string().optional(),
		num_books: z.number().int().default(0).optional(),
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

	static type = Bible.schema._type;

	bible_id: string;
	name: string;
	language: string;
	version?: string;
	description?: string;
	num_books?: number;
	created_at?: Date;
	updated_at?: Date;

	protected constructor(data: z.infer<typeof Bible.schema>) {
		this.bible_id = data.bible_id;
		this.name = data.name;
		this.language = data.language;
		this.version = data.version;
		this.description = data.description;
		this.num_books = data.num_books;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
	}

	static create(data: unknown): Bible {
		const parsedData = Bible.schema.parse(data);
		return new Bible(parsedData);
	}
}

