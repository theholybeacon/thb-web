import { drizzle } from 'drizzle-orm/vercel-postgres';
import { config } from 'dotenv';
config({ path: '.env.local' }); // or .env


import * as bibleSchema from "@/db/schema/bible";
import * as bookSchema from "@/db/schema/book";
import * as chapterSchema from "@/db/schema/chapter";
import * as verseSchema from "@/db/schema/verse";
import * as userSchema from "@/db/schema/user";
import * as studySchema from "@/db/schema/study";
import * as studyStepSchema from "@/db/schema/studyStep";
import * as sessionScema from "@/db/schema/session";

export const db = drizzle(
	{
		schema:
		{
			...bibleSchema,
			...bookSchema,
			...chapterSchema,
			...verseSchema,
			...userSchema,
			...studySchema,
			...studyStepSchema,
			...sessionScema,
		}
	}
);
