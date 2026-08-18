/**
 * Why a chapter's text could not be fetched from api.bible.
 *
 * The distinction that matters most is QUOTA vs everything else. The reader
 * used to render every upstream failure as "No content available for this
 * chapter" — indistinguishable from a chapter that genuinely has no text — so
 * an exhausted API key looked like missing scripture. See ChapterRepository.
 */
export type ChapterFetchReason =
	/** 403 whose body says the daily request limit is spent. */
	| "QUOTA"
	/** 429. `retryAfterMs` carries Retry-After when the header was present. */
	| "RATE_LIMITED"
	/** 401, or a 403 that is not a quota message — bad or missing key. */
	| "UNAUTHORIZED"
	/** 404 — upstream has no such chapter. Genuinely empty, do not retry. */
	| "NOT_FOUND"
	/** 5xx. */
	| "UPSTREAM"
	/** fetch rejected, aborted, or timed out. */
	| "NETWORK"
	/** 200 whose body yielded no verses — treat as failure, never store empty. */
	| "PARSE";

export class ChapterFetchError extends Error {
	constructor(
		readonly reason: ChapterFetchReason,
		readonly status?: number,
		message?: string,
		readonly retryAfterMs?: number,
	) {
		super(message ?? `${reason}${status ? ` (${status})` : ""}`);
		this.name = "ChapterFetchError";
	}
}

export function isChapterFetchError(e: unknown): e is ChapterFetchError {
	return e instanceof ChapterFetchError;
}

/**
 * What the reader shows. NOT_FOUND deliberately maps to null: an upstream 404
 * means the chapter really has no text, which is the one case where the plain
 * empty state is honest.
 */
export type ChapterLoadError = "unavailable" | "quota";

export function toLoadError(reason: ChapterFetchReason): ChapterLoadError | null {
	if (reason === "NOT_FOUND") return null;
	if (reason === "QUOTA" || reason === "RATE_LIMITED") return "quota";
	return "unavailable";
}
