import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as bibleSchema from "@/db/schema/bible";
import * as bookSchema from "@/db/schema/book";
import * as chapterSchema from "@/db/schema/chapter";
import * as verseSchema from "@/db/schema/verse";
import * as userSchema from "@/db/schema/user";
import * as studySchema from "@/db/schema/study";
import * as studyStepSchema from "@/db/schema/studyStep";
import * as sessionScema from "@/db/schema/session";
import * as subscriptionSchema from "@/db/schema/subscription";
import * as giftSubscriptionSchema from "@/db/schema/giftSubscription";
import * as membershipRequestSchema from "@/db/schema/membershipRequest";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, {
	schema: {
		...bibleSchema,
		...bookSchema,
		...chapterSchema,
		...verseSchema,
		...userSchema,
		...studySchema,
		...studyStepSchema,
		...sessionScema,
		...subscriptionSchema,
		...giftSubscriptionSchema,
		...membershipRequestSchema,
	}
});
