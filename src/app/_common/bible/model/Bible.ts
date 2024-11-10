import { z } from 'zod';

export class Bible {
	static schema = z.object({
		bible_id: z.string().uuid(),
		api_id: z.string().max(255),
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

	bibleId: string;
	apiId: string;
	name: string;
	language: string;
	version?: string;
	description?: string;
	numBooks?: number;
	createdAt?: Date;
	updatedAt?: Date;

	protected constructor(data: z.infer<typeof Bible.schema>) {
		this.bibleId = data.bible_id;
		this.apiId = data.api_id;
		this.name = data.name;
		this.language = data.language;
		this.version = data.version;
		this.description = data.description;
		this.numBooks = data.num_books;
		this.createdAt = data.created_at;
		this.updatedAt = data.updated_at;
	}

	static create(data: unknown): Bible {
		const parsedData = Bible.schema.parse(data);
		return new Bible(parsedData);
	}
}
