import { AnyPgColumn, index, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userTable } from "./user";
import { studyTable } from "./study";
import { bibleTable } from "./bible";
import type { StudyBuilderDraft, StudyBuilderMessagePayload } from "@/app/common/studyBuilder/model/StudyBuilder";

/**
 * One conversation with the study builder: a reader talking a plan into shape
 * with the AI. The plan being assembled lives on the conversation (`draft`), so
 * every turn sees — and may rewrite — the latest version, and a reader who
 * leaves can come back to the same half-built plan.
 *
 * `status` is active until the plan becomes a study (`created`, with `studyId`
 * set). Finished conversations stay: they are part of what the builder
 * remembers about the reader the next time they start one.
 */
export const studyBuilderConversationTable = pgTable("study_builder_conversation", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid().references((): AnyPgColumn => userTable.id, { onDelete: "cascade" }).notNull(),
	/** active | created */
	status: varchar({ length: 10 }).notNull().default("active"),
	/** Short label for the history list, taken from the draft's name once there is one. */
	title: varchar({ length: 255 }),
	draft: jsonb().$type<StudyBuilderDraft>(),
	bibleId: uuid().references((): AnyPgColumn => bibleTable.id),
	studyId: uuid().references((): AnyPgColumn => studyTable.id, { onDelete: "set null" }),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
}, (t) => ({
	userIdx: index("study_builder_conversation_user_idx").on(t.userId, t.updatedAt),
}));

/** A turn in a conversation. Assistant turns keep their quick replies in `payload`. */
export const studyBuilderMessageTable = pgTable("study_builder_message", {
	id: uuid().defaultRandom().primaryKey(),
	conversationId: uuid().references((): AnyPgColumn => studyBuilderConversationTable.id, { onDelete: "cascade" }).notNull(),
	/** user | assistant */
	role: varchar({ length: 10 }).notNull(),
	content: text().notNull(),
	payload: jsonb().$type<StudyBuilderMessagePayload>(),
	createdAt: timestamp().notNull().defaultNow(),
}, (t) => ({
	conversationIdx: index("study_builder_message_conversation_idx").on(t.conversationId, t.createdAt),
}));

/**
 * Durable things the builder has learned about a reader ("reads in the
 * mornings", "walking through grief after losing their father"). The AI writes
 * them as it listens; every later conversation starts from them. The reader
 * sees them and can make the builder forget any one.
 */
export const studyBuilderMemoryTable = pgTable("study_builder_memory", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid().references((): AnyPgColumn => userTable.id, { onDelete: "cascade" }).notNull(),
	fact: varchar({ length: 500 }).notNull(),
	conversationId: uuid().references((): AnyPgColumn => studyBuilderConversationTable.id, { onDelete: "set null" }),
	createdAt: timestamp().notNull().defaultNow(),
}, (t) => ({
	userIdx: index("study_builder_memory_user_idx").on(t.userId),
}));

export const studyBuilderConversationRelations = relations(studyBuilderConversationTable, ({ one, many }) => ({
	user: one(userTable, { fields: [studyBuilderConversationTable.userId], references: [userTable.id] }),
	study: one(studyTable, { fields: [studyBuilderConversationTable.studyId], references: [studyTable.id] }),
	messages: many(studyBuilderMessageTable),
}));

export const studyBuilderMessageRelations = relations(studyBuilderMessageTable, ({ one }) => ({
	conversation: one(studyBuilderConversationTable, {
		fields: [studyBuilderMessageTable.conversationId],
		references: [studyBuilderConversationTable.id],
	}),
}));
