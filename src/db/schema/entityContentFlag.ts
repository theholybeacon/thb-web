import { AnyPgColumn, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { entityContentTable } from "./entityContent";
import { userTable } from "./user";

export const contentFlagStatusEnum = pgEnum("content_flag_status", ["open", "reviewed", "dismissed"]);

/** A user report that a generated content section is inaccurate. */
export const entityContentFlagTable = pgTable("entity_content_flag", {
	id: uuid().defaultRandom().primaryKey(),
	entityContentId: uuid().references((): AnyPgColumn => entityContentTable.id).notNull(),
	userId: uuid().references((): AnyPgColumn => userTable.id).notNull(),
	section: varchar({ length: 40 }).notNull(),
	reason: text(),
	status: contentFlagStatusEnum().notNull().default("open"),
	createdAt: timestamp().notNull().defaultNow(),
});

export const entityContentFlagRelations = relations(entityContentFlagTable, ({ one }) => ({
	content: one(entityContentTable, {
		fields: [entityContentFlagTable.entityContentId],
		references: [entityContentTable.id],
	}),
}));

export const insertEntityContentFlagSchema = createInsertSchema(entityContentFlagTable);
export const selectEntityContentFlagSchema = createSelectSchema(entityContentFlagTable);
