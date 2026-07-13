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
import * as entitySchema from "@/db/schema/entity";
import * as entityMentionSchema from "@/db/schema/entityMention";
import * as entityContentSchema from "@/db/schema/entityContent";
import * as entityContentFlagSchema from "@/db/schema/entityContentFlag";
import * as contributionSchema from "@/db/schema/contribution";
import * as communityCommentSchema from "@/db/schema/communityComment";
import * as communityVoteSchema from "@/db/schema/communityVote";
import * as communityFlagSchema from "@/db/schema/communityFlag";
import * as userDailyActivitySchema from "@/db/schema/userDailyActivity";

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
		...entitySchema,
		...entityMentionSchema,
		...entityContentSchema,
		...entityContentFlagSchema,
		...contributionSchema,
		...communityCommentSchema,
		...communityVoteSchema,
		...communityFlagSchema,
		...userDailyActivitySchema,
	}
});
