import { unstable_cache } from "next/cache";
import { ChapterVer } from "@/app/common/chapter/model/Chapter";

/** Thrown inside a cached function to hand a value back without caching it. */
class Uncached<T> extends Error {
	constructor(readonly value: T) {
		super("not cacheable");
	}
}

/**
 * `unstable_cache` that only keeps the results `keep` accepts. A failed or
 * half-loaded read is returned to this request but asked for again on the next.
 */
export function cacheWhen<A extends unknown[], R>(
	fn: (...args: A) => Promise<R>,
	keep: (result: R) => boolean,
	key: string[],
	options: Parameters<typeof unstable_cache>[2],
): (...args: A) => Promise<R> {
	const cached = unstable_cache(
		async (...args: A) => {
			const result = await fn(...args);
			if (!keep(result)) throw new Uncached(result);
			return result;
		},
		key,
		options,
	);
	return async (...args: A) => {
		try {
			return await cached(...args);
		} catch (e) {
			if (e instanceof Uncached) return e.value as R;
			throw e;
		}
	};
}

/**
 * Whether a chapter is final: its text fully stored, or upstream known not to
 * have it (`numVerses` -1). A chapter mid-repair or behind an outage is not.
 */
export function isChapterComplete(chapter: ChapterVer | undefined): boolean {
	if (!chapter || chapter.loadError) return false;
	if (chapter.numVerses === -1) return true;
	return chapter.verses.length > 0 && chapter.verses.length >= (chapter.numVerses ?? 0);
}
