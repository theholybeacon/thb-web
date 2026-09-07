import { config } from "dotenv";
import { beforeAll, describe, expect, it } from "vitest";

config({ path: ".env.local" });

/**
 * THE contract test: what this API returns is what the database holds.
 *
 * The marketing pipeline exists on the premise that it never invents Scripture.
 * That premise reduces to this one assertion — the bytes served equal the bytes
 * stored, with no trimming, whitespace collapsing or re-encoding in between.
 * Verse whitespace is load-bearing (paragraph and poetry breaks live in it), so
 * "looks the same" is not good enough.
 *
 * The chapter under test is DISCOVERED, not hardcoded. Verse text is hydrated
 * lazily, so which chapters are cached differs by environment — a fixed
 * reference would silently skip itself on a cold database and leave the most
 * important test in this repo asserting nothing. Instead we ask the database
 * for a chapter it actually holds, and fail loudly if there are none.
 *
 * NEVER WRITES. The hydration budget is pinned to 0 for the whole file, so the
 * route is stored-text-only and cannot fetch, insert, or spend api.bible quota.
 * Runs only when DATABASE_URL is set, so `npm run test` passes without it.
 */

const hasDb = Boolean(process.env.DATABASE_URL);
const describeDb = hasDb ? describe : describe.skip;

const KEY = "test-content-api-key";

let GET: typeof import("../verses/[reference]/route").GET;
let NextRequest: typeof import("next/server").NextRequest;
let query: (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

type StoredVerse = { verse: number; content: string };
type Fixture = {
	bibleSlug: string;
	usfm: string;
	chapter: number;
	verses: StoredVerse[];
};

/** A complete, cached chapter to test against. Prefers the recommended edition. */
let fixture: Fixture | null = null;

async function callVerses(reference: string, translation?: string) {
	const qs = translation ? `?translation=${translation}` : "";
	const request = new NextRequest(
		`https://example.test/api/content/v1/verses/${reference}${qs}`,
		{ headers: { "x-api-key": KEY } },
	);
	const response = await GET(request, { params: Promise.resolve({ reference }) });
	return { status: response.status, body: await response.json() };
}

describeDb("verse text is byte-identical to the database", () => {
	beforeAll(async () => {
		process.env.CONTENT_API_KEY = KEY;
		// Stored-text-only: this test reads production and must never write.
		process.env.CONTENT_API_HYDRATION_BUDGET = "0";
		process.env.CONTENT_API_RATE_LIMIT_PER_MINUTE = "10000";

		({ GET } = await import("../verses/[reference]/route"));
		({ NextRequest } = await import("next/server"));

		const { neon } = await import("@neondatabase/serverless");
		query = neon(process.env.DATABASE_URL!) as typeof query;

		// Find a chapter that is cached AND complete (verse rows match the count
		// upstream reported), so a truncated chapter can't produce a false pass.
		const candidates = (await query`
			SELECT bi.slug AS bible_slug,
			       upper(b.abbreviation) AS usfm,
			       c."chapterNumber" AS chapter,
			       count(v.id)::int AS stored
			FROM verse v
			JOIN chapter c ON c.id = v."chapterId"
			JOIN book b   ON b.id = c."bookId"
			JOIN bible bi ON bi.id = b."bibleId"
			GROUP BY bi.slug, b.abbreviation, c."chapterNumber", c."numVerses"
			HAVING count(v.id) >= c."numVerses" AND count(v.id) > 3
			ORDER BY (bi.slug = 'bsb-en') DESC, count(v.id) DESC
			LIMIT 1
		`) as unknown as { bible_slug: string; usfm: string; chapter: number }[];

		if (candidates.length === 0) return;

		const pick = candidates[0];
		const verses = (await query`
			SELECT v."verseNumber" AS verse, v.content AS content
			FROM verse v
			JOIN chapter c ON c.id = v."chapterId"
			JOIN book b   ON b.id = c."bookId"
			JOIN bible bi ON bi.id = b."bibleId"
			WHERE bi.slug = ${pick.bible_slug}
			  AND upper(b.abbreviation) = ${pick.usfm}
			  AND c."chapterNumber" = ${pick.chapter}
			ORDER BY v."verseNumber"
		`) as unknown as StoredVerse[];

		fixture = {
			bibleSlug: pick.bible_slug,
			usfm: pick.usfm,
			chapter: pick.chapter,
			verses,
		};
	});

	it("found a cached chapter to verify against", () => {
		// A failure here is a real signal, not a test problem: it means no
		// translation holds complete text. Run `npm run warm:bible`.
		expect(fixture, "no complete cached chapter found — run `npm run warm:bible`").not.toBeNull();
		expect(fixture!.verses.length).toBeGreaterThan(3);
	});

	it("returns a whole chapter exactly as stored, character for character", async () => {
		const f = fixture!;
		const { status, body } = await callVerses(
			`${f.usfm.toLowerCase()}-${f.chapter}`,
			f.bibleSlug,
		);

		expect(status).toBe(200);
		expect(body.verses).toHaveLength(f.verses.length);

		for (const [i, row] of f.verses.entries()) {
			const served = body.verses[i];
			expect(served.verse).toBe(row.verse);
			// Strict equality, not a normalised comparison. If this ever needs a
			// .trim() to pass, the API has started editing Scripture.
			expect(served.text).toBe(row.content);
			expect(Buffer.from(served.text, "utf8").equals(Buffer.from(row.content, "utf8"))).toBe(true);
		}
	});

	it("returns a verse range exactly as stored", async () => {
		const f = fixture!;
		const start = f.verses[0].verse;
		const end = f.verses[Math.min(2, f.verses.length - 1)].verse;

		const { status, body } = await callVerses(
			`${f.usfm.toLowerCase()}-${f.chapter}-${start}-${end}`,
			f.bibleSlug,
		);

		expect(status).toBe(200);
		const expected = f.verses.filter((v) => v.verse >= start && v.verse <= end);
		expect(body.verses.map((v: StoredVerse & { text: string }) => v.text)).toEqual(
			expected.map((v) => v.content),
		);
	});

	it("preserves the exact byte length of every verse", async () => {
		const f = fixture!;
		const { body } = await callVerses(`${f.usfm.toLowerCase()}-${f.chapter}`, f.bibleSlug);

		const servedByVerse = new Map<number, string>(
			body.verses.map((v: { verse: number; text: string }) => [v.verse, v.text]),
		);
		for (const row of f.verses) {
			const served = servedByVerse.get(row.verse)!;
			// Leading and trailing whitespace is meaningful layout, not noise.
			expect(Buffer.byteLength(served, "utf8")).toBe(Buffer.byteLength(row.content, "utf8"));
		}
	});

	it("never mutates while serving stored text", async () => {
		const f = fixture!;
		const before = (await query`SELECT count(*)::int AS n FROM verse`) as unknown as { n: number }[];
		await callVerses(`${f.usfm.toLowerCase()}-${f.chapter}`, f.bibleSlug);
		const after = (await query`SELECT count(*)::int AS n FROM verse`) as unknown as { n: number }[];

		expect(after[0].n).toBe(before[0].n);
	});

	it("reports the translation and licence alongside the text", async () => {
		const f = fixture!;
		const { body } = await callVerses(`${f.usfm.toLowerCase()}-${f.chapter}`, f.bibleSlug);

		expect(body.translation.slug).toBe(f.bibleSlug);
		expect(typeof body.translation.license.openLicensed).toBe("boolean");
		expect(body.translation.license.publishing).toBeTruthy();
		// Budget is pinned to 0, so nothing may claim to have hydrated.
		expect(body.hydratedOnDemand).toBe(false);
	});

	it("rejects a request with no API key", async () => {
		const request = new NextRequest("https://example.test/api/content/v1/verses/john-3-16");
		const response = await GET(request, { params: Promise.resolve({ reference: "john-3-16" }) });
		expect(response.status).toBe(401);
		expect((await response.json()).error).toBe("UNAUTHORIZED");
	});

	it("reports an unparseable reference as a client error", async () => {
		const { status, body } = await callVerses("not-a-book-1-1");
		expect(status).toBe(400);
		expect(body.error).toBe("UNKNOWN_BOOK");
	});

	it("refuses to hydrate a cold chapter instead of spending upstream quota", async () => {
		// Budget pinned to 0, so an uncached chapter must come back as
		// NOT_HYDRATED rather than triggering an api.bible fetch.
		const { status, body } = await callVerses("3jn-1-1", "kjv-en");
		if (status === 200) {
			expect(body.hydratedOnDemand).toBe(false);
			return;
		}
		expect(status).toBe(404);
		expect(["NOT_HYDRATED", "CHAPTER_NOT_FOUND"]).toContain(body.error);
	});
});
