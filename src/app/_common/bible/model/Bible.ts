import { bibleTable } from "@/db/schema/bible";

export type Bible = typeof bibleTable.$inferSelect;
