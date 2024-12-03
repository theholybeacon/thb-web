import { verseTable } from "@/db/schema/verse";

export type VerseInsert = typeof verseTable.$inferInsert;
export type Verse = typeof verseTable.$inferSelect;



