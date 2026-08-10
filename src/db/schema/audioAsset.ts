import { AnyPgColumn, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { contentGenerationStatusEnum } from "./entityContent";
import { bibleTable } from "./bible";
import { studyStepTable } from "./studyStep";

export const audioAssetKindEnum = pgEnum("audio_asset_kind", ["chapter", "step_intro"]);

/**
 * One narrated span inside an asset. Offsets are frame-counted from the source
 * MP3s (see src/lib/mp3.ts), so they are exact rather than interpolated — which
 * is what lets verse highlighting and seek-to-verse land precisely.
 */
export type AudioSegment = {
	kind: "heading" | "verse" | "title" | "explanation";
	verseNumber: number | null;
	startMs: number;
	endMs: number;
	text: string;
};

/**
 * A generate-once, cache-forever, shared-by-everyone TTS asset.
 *
 * The key insight: a Bible chapter is identical for every user, so ONE chapter
 * asset serves every user and every study step that touches that chapter (steps
 * are verse ranges *within* chapters — they just play a slice of the file). That
 * is what keeps generation cost near zero as usage grows.
 *
 * Like `entity_content`, THE ROW IS THE LOCK: `generationStatus` is flipped
 * pending -> generating by a conditional UPDATE, so exactly one generation runs
 * even under concurrent load. `cacheKey` is a single unique column so the claim
 * is one cheap indexed write.
 */
export const audioAssetTable = pgTable("audio_asset", {
	id: uuid().defaultRandom().primaryKey(),

	/** `chapter:{bibleId}:{BOOK}:{n}:{voice}` or `step:{studyStepId}:{voice}`. Unique. */
	cacheKey: varchar({ length: 255 }).notNull().unique(),
	kind: audioAssetKindEnum().notNull(),
	voice: varchar({ length: 20 }).notNull(),
	model: varchar({ length: 60 }),
	language: varchar({ length: 50 }),

	// Chapter scope (kind = "chapter").
	bibleId: uuid().references((): AnyPgColumn => bibleTable.id, { onDelete: "cascade" }),
	bookAbbreviation: varchar({ length: 10 }),
	chapterNumber: integer(),

	// Step scope (kind = "step_intro") — narration of OUR content (title + AI
	// explanation), which is why it is licence-exempt.
	studyStepId: uuid().references((): AnyPgColumn => studyStepTable.id, { onDelete: "cascade" }),

	generationStatus: contentGenerationStatusEnum().notNull().default("pending"),

	blobUrl: text(),
	blobPathname: text(),
	durationMs: integer(),
	byteSize: integer(),
	segments: jsonb().$type<AudioSegment[]>().notNull().default([]),

	error: text(),
	generatedAt: timestamp(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});

export const audioAssetRelations = relations(audioAssetTable, ({ one }) => ({
	bible: one(bibleTable, {
		fields: [audioAssetTable.bibleId],
		references: [bibleTable.id],
	}),
	studyStep: one(studyStepTable, {
		fields: [audioAssetTable.studyStepId],
		references: [studyStepTable.id],
	}),
}));

export const insertAudioAssetSchema = createInsertSchema(audioAssetTable);
export const selectAudioAssetSchema = createSelectSchema(audioAssetTable);
