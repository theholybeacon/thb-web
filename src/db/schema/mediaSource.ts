import { AnyPgColumn, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTable } from "./user";

/**
 * A place The Holy Beacon takes images and videos from for its studies: a
 * YouTube channel, a public-domain image archive, a website. Kept in the admin
 * panel (/admin/sources) so whoever writes the catalog's stories knows which
 * sources are approved before they put a video or a picture in a step.
 */
export const mediaSourceTable = pgTable("media_source", {
	id: uuid().defaultRandom().primaryKey(),
	kind: varchar({ length: 20 }).notNull(), // youtube_channel | image_archive | website
	name: varchar({ length: 255 }).notNull(),
	url: varchar({ length: 1000 }).notNull(),
	notes: text(),
	addedById: uuid().references((): AnyPgColumn => userTable.id, { onDelete: "set null" }),
	createdAt: timestamp().notNull().defaultNow(),
});

export const insertMediaSourceSchema = createInsertSchema(mediaSourceTable);
export const selectMediaSourceSchema = createSelectSchema(mediaSourceTable);
