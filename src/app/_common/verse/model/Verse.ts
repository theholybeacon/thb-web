import { z } from 'zod';

export class Verse {
	static schema = z.object({
		verse_id: z.string().uuid(),
		chapter_id: z.string().uuid(),
		verse_number: z.number().int(),
		text: z.string(),
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

	static type = Verse.schema._type;

	verseId: string;
	chapterId: string;
	verseNumber: number;
	text: string;
	created_at?: Date;
	updated_at?: Date;

	protected constructor(data: z.infer<typeof Verse.schema>) {
		this.verseId = data.verse_id;
		this.chapterId = data.chapter_id;
		this.verseNumber = data.verse_number;
		this.text = data.text;
		this.created_at = data.created_at;
		this.updated_at = data.updated_at;
	}

	static create(data: unknown): Verse {
		const parsedData = Verse.schema.parse(data);
		return new Verse(parsedData);
	}
}

