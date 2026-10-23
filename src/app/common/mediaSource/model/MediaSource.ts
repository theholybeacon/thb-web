import { mediaSourceTable } from "@/db/schema/mediaSource";

export type MediaSource = typeof mediaSourceTable.$inferSelect;
export type MediaSourceInsert = typeof mediaSourceTable.$inferInsert;

export const MEDIA_SOURCE_KINDS = ["youtube_channel", "image_archive", "website"] as const;
export type MediaSourceKind = (typeof MEDIA_SOURCE_KINDS)[number];

export function isMediaSourceKind(value: unknown): value is MediaSourceKind {
	return typeof value === "string" && (MEDIA_SOURCE_KINDS as readonly string[]).includes(value);
}
