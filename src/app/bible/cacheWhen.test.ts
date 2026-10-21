import { describe, expect, it, vi } from "vitest";
import type { ChapterVer } from "@/app/common/chapter/model/Chapter";

// Stands in for Next's data cache: one entry per argument list, kept only
// when the function returns (a throw stores nothing), as unstable_cache does.
vi.mock("next/cache", () => ({
	unstable_cache: <A extends unknown[], R>(fn: (...args: A) => Promise<R>) => {
		const store = new Map<string, R>();
		return async (...args: A) => {
			const key = JSON.stringify(args);
			if (store.has(key)) return store.get(key)!;
			const value = await fn(...args);
			store.set(key, value);
			return value;
		};
	},
}));

const { cacheWhen, isChapterComplete } = await import("./cacheWhen");

function chapter(verses: number, numVerses: number | null, loadError: ChapterVer["loadError"] = null): ChapterVer {
	return {
		numVerses,
		loadError,
		verses: Array.from({ length: verses }, (_, i) => ({ verseNumber: i + 1, content: "…" })),
	} as unknown as ChapterVer;
}

describe("cacheWhen", () => {
	it("serves a kept result from the cache", async () => {
		const read = vi.fn(async (id: string) => `text of ${id}`);
		const cached = cacheWhen(read, () => true, ["test"], {});

		expect(await cached("a")).toBe("text of a");
		expect(await cached("a")).toBe("text of a");
		expect(read).toHaveBeenCalledTimes(1);
	});

	it("hands back a rejected result without caching it", async () => {
		// A chapter caught mid-outage must be asked for again, not frozen forever.
		const read = vi.fn(async () => "partial");
		const cached = cacheWhen(read, () => false, ["test"], {});

		expect(await cached()).toBe("partial");
		expect(await cached()).toBe("partial");
		expect(read).toHaveBeenCalledTimes(2);
	});

	it("lets real errors through", async () => {
		const cached = cacheWhen(async () => {
			throw new Error("db down");
		}, () => true, ["test"], {});

		await expect(cached()).rejects.toThrow("db down");
	});
});

describe("isChapterComplete", () => {
	it("accepts a chapter with all its verses", () => {
		expect(isChapterComplete(chapter(31, 31))).toBe(true);
		expect(isChapterComplete(chapter(31, null))).toBe(true);
	});

	it("accepts a chapter upstream does not have", () => {
		expect(isChapterComplete(chapter(0, -1))).toBe(true);
	});

	it("rejects an empty, short or failed chapter", () => {
		expect(isChapterComplete(undefined)).toBe(false);
		expect(isChapterComplete(chapter(0, null))).toBe(false);
		expect(isChapterComplete(chapter(12, 31))).toBe(false);
		expect(isChapterComplete(chapter(31, 31, "QUOTA_EXCEEDED" as ChapterVer["loadError"]))).toBe(false);
	});
});
