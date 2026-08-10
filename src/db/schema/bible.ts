import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { bookTable } from "./book";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const bibleTable = pgTable("bible", {
	id: uuid().defaultRandom().primaryKey(),
	apiId: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	language: varchar({ length: 50 }).notNull(),
	version: varchar({ length: 50 }).notNull(),
	slug: varchar({ length: 100 }).notNull().unique(),
	description: text().default(""),
	numBooks: integer().default(0),
	/**
	 * Whether this translation's text may be synthesized into cached audio.
	 * Set from `isAudioLicensedBible()` at import; see src/lib/bibleLicense.ts.
	 * False (the safe default) still allows narration of our own content.
	 */
	audioEnabled: boolean().notNull().default(false),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
});

export const bibleRelations = relations(bibleTable, ({ many }) => ({
	books: many(bookTable),
}));


export const insertBibleSchema = createInsertSchema(bibleTable);
export const selectBibleSchema = createSelectSchema(bibleTable);
