import { config } from "dotenv";
import { beforeAll, describe, expect, it } from "vitest";

config({ path: ".env.local" });

/**
 * Behavioural cover for the five endpoints outside /verses.
 *
 * verses.db.test.ts guards the one assertion that matters most — served text
 * equals stored text. This file guards everything the consumer needs in order
 * to *reach* that text: the catalogue it reads request shapes from, the slugs
 * it must resolve rather than construct, the audio offsets it animates
 * against, and the error codes it branches on. docs/content-api.md is the
 * contract under test; where a claim there is checkable, it is checked here.
 *
 * Cross-endpoint consistency is the recurring theme. A number in /meta that
 * disagrees with the endpoint it describes is worse than a missing one,
 * because a pipeline will believe it.
 *
 * FIXTURES ARE DISCOVERED, never hardcoded. Character profiles, cached
 * chapters and narration are all produced on demand, so what exists differs by
 * environment; a hardcoded slug would silently skip itself. Where a fixture
 * genuinely may not exist anywhere yet (narration), the test says so out loud
 * instead of passing quietly.
 *
 * NEVER WRITES. The hydration budget is pinned to 0 for the whole file, so
 * even /daily-verse — which reads through the hydrating path — is stored-text
 * only and cannot spend api.bible quota. Runs only when DATABASE_URL is set.
 */

const hasDb = Boolean(process.env.DATABASE_URL);
const describeDb = hasDb ? describe : describe.skip;

const KEY = "test-content-api-key";
const HEADERS = { "x-api-key": KEY };
const BASE = "https://example.test/api/content/v1";

type NextRequestT = import("next/server").NextRequest;
/**
 * A route module, static or dynamic, held in one map so the suite can call them
 * uniformly. `params` is deliberately loose: Next.js types each dynamic route's
 * params to its own segment name, and a concrete type here would be
 * contravariantly incompatible with every one of them at once.
 */
type Route = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	GET: (request: NextRequestT, ctx: { params: Promise<any> }) => Promise<Response>;
};
/** A parsed response body. Untyped on purpose: these tests assert the JSON a
 *  consumer actually receives, not a shape restated from the route's own code. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>;
type Result = { status: number; body: Json; headers: Headers };

let NextRequest: typeof import("next/server").NextRequest;
let CONTENT_API_VERSION: string;
let MAX_RANGE_VERSES: number;
let query: (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

const routes: Record<string, Route> = {};

/** Calls a route with no dynamic segment, e.g. /meta. */
async function call(route: Route, url: string): Promise<Result> {
	const request = new NextRequest(`${BASE}${url}`, { headers: HEADERS });
	const response = await route.GET(request, { params: Promise.resolve({}) });
	return { status: response.status, body: await response.json(), headers: response.headers };
}

/** Calls a route with a dynamic segment, e.g. /characters/{slug}. */
async function callWith(route: Route, url: string, params: Record<string, string>): Promise<Result> {
	const request = new NextRequest(`${BASE}${url}`, { headers: HEADERS });
	const response = await route.GET(request, { params: Promise.resolve(params) });
	return { status: response.status, body: await response.json(), headers: response.headers };
}

type CharacterRow = { slug: string; name: string; mentionCount: number };

type DailyVerseRef = { bookAbbreviation: string; chapter: number; verse: number };

/**
 * The route's own day-of-year arithmetic, restated so a test can predict which
 * curated verse a date must yield. It mirrors dailyVerseGetSS — if this and the
 * app ever disagree, the endpoint is featuring a different verse from the one
 * readers see, which is exactly the failure worth catching.
 */
function dayOfYear(localDate: string): number {
	const d = new Date(localDate + "T00:00:00Z");
	return Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86_400_000);
}

function nextDay(date: string): string {
	const d = new Date(date + "T00:00:00Z");
	d.setUTCDate(d.getUTCDate() + 1);
	return d.toISOString().slice(0, 10);
}

/** The first date in `year` that selects curated entry `index`. */
function dateSelecting(index: number, year: number): string | null {
	for (let offset = 0; offset < 366; offset++) {
		const date = new Date(Date.UTC(year, 0, 1 + offset)).toISOString().slice(0, 10);
		if (dayOfYear(date) % DAILY_VERSES.length === index) return date;
	}
	return null;
}

/** A narration that has actually been produced, if this environment holds one. */
type NarrationFixture = {
	bibleSlug: string;
	usfm: string;
	chapter: number;
	voice: string;
};

let DAILY_VERSES: DailyVerseRef[] = [];
let anyCharacter: CharacterRow | null = null;
/** A date whose curated verse is cached, so the endpoint can actually serve it. */
let daily: { date: string; pick: DailyVerseRef } | null = null;
let narration: NarrationFixture | null = null;
/** A translation that may never be narrated, for the NOT_LICENSED path. */
let unlicensedSlug: string | null = null;

describeDb("the content endpoints", () => {
	beforeAll(async () => {
		process.env.CONTENT_API_KEY = KEY;
		// Stored-text-only: this suite reads production and must never write.
		process.env.CONTENT_API_HYDRATION_BUDGET = "0";
		process.env.CONTENT_API_RATE_LIMIT_PER_MINUTE = "10000";

		({ NextRequest } = await import("next/server"));
		({ CONTENT_API_VERSION } = await import("@/lib/contentApi/respond"));
		({ MAX_RANGE_VERSES } = await import("@/lib/contentApi/reference"));

		routes.meta = await import("../meta/route");
		routes.studies = await import("../studies/route");
		routes.characters = await import("../characters/route");
		routes.character = await import("../characters/[slug]/route");
		routes.dailyVerse = await import("../daily-verse/route");
		routes.narration = await import("../narration/[reference]/route");
		routes.verses = await import("../verses/[reference]/route");

		const { neon } = await import("@neondatabase/serverless");
		query = neon(process.env.DATABASE_URL!) as typeof query;

		const { body } = await call(routes.characters, "/characters?page=1");
		anyCharacter = body.characters?.[0] ?? null;

		// A ready chapter narration, named by the columns the row carries rather
		// than by re-deriving its content-addressed cache key.
		const narrated = (await query`
			SELECT bi.slug AS "bibleSlug",
			       upper(a."bookAbbreviation") AS usfm,
			       a."chapterNumber" AS chapter,
			       a.voice AS voice
			FROM audio_asset a
			JOIN bible bi ON bi.id = a."bibleId"
			WHERE a.kind = 'chapter'
			  AND a."generationStatus" = 'ready'
			  AND a."blobUrl" IS NOT NULL
			  AND jsonb_array_length(a.segments) > 1
			LIMIT 1
		`) as unknown as NarrationFixture[];
		narration = narrated[0] ?? null;

		const unlicensed = (await query`
			SELECT slug FROM bible WHERE "audioEnabled" = false LIMIT 1
		`) as unknown as { slug: string }[];
		unlicensedSlug = unlicensed[0]?.slug ?? null;

		// Walk the rotation for the first entry whose chapter is cached, then
		// work backwards to a date that selects it. Coverage is uneven, so
		// hardcoding a date would leave these tests asserting a 404.
		({ DAILY_VERSES } = await import("@/lib/dailyVerses"));
		for (const [index, pick] of DAILY_VERSES.entries()) {
			const rows = (await query`
				SELECT 1 AS hit
				FROM verse v
				JOIN chapter c ON c.id = v."chapterId"
				JOIN book b   ON b.id = c."bookId"
				JOIN bible bi ON bi.id = b."bibleId"
				WHERE bi.slug = 'bsb-en'
				  AND upper(b.abbreviation) = ${pick.bookAbbreviation}
				  AND c."chapterNumber" = ${pick.chapter}
				  AND v."verseNumber" = ${pick.verse}
				LIMIT 1
			`) as unknown as { hit: number }[];
			if (rows.length === 0) continue;

			const date = dateSelecting(index, 2026);
			if (date) {
				daily = { date, pick };
				break;
			}
		}
	});

	// ---------------------------------------------------------------- /meta

	describe("GET /meta", () => {
		it("answers with the catalogue", async () => {
			const { status, body, headers } = await call(routes.meta, "/meta");

			expect(status).toBe(200);
			expect(body.apiVersion).toBe(CONTENT_API_VERSION);
			expect(body.api.readOnly).toBe(true);
			expect(body.api.maxVerseRange).toBe(MAX_RANGE_VERSES);
			// Successful reads are cacheable; the docs promise s-maxage=3600.
			expect(headers.get("Cache-Control")).toContain("s-maxage=3600");
		});

		it("lists book keys that /verses actually accepts", async () => {
			const { body } = await call(routes.meta, "/meta");
			const keys: string[] = body.api.acceptedBookKeys;

			expect(keys.length).toBeGreaterThan(66);
			// The catalogue is only useful if a key taken from it parses. Feed a
			// sample straight back into the reference parser, as a consumer would.
			const { parseReference } = await import("@/lib/contentApi/reference");
			for (const key of [keys[0], keys[Math.floor(keys.length / 2)], keys[keys.length - 1]]) {
				expect(() => parseReference(`${key}-1`), `${key} is advertised but unparseable`).not.toThrow();
			}
		});

		it("reports counts that match the endpoints they describe", async () => {
			const { body } = await call(routes.meta, "/meta");
			const { body: characters } = await call(routes.characters, "/characters?page=1");
			const { body: studies } = await call(routes.studies, "/studies");

			// A /meta count that disagrees with its own endpoint is worse than no
			// count at all — the pipeline publishes these numbers.
			expect(body.counts.characters).toBe(characters.page.total);
			expect(body.counts.studyPlans).toBe(studies.studyPlans.length);
			expect(body.counts.translations).toBe(body.translations.length);
			expect(body.studyPlans.map((p: Json) => p.slug)).toEqual(
				studies.studyPlans.map((p: Json) => p.slug),
			);
		});

		it("reports canon counts that add up", async () => {
			const { body } = await call(routes.meta, "/meta");

			expect(body.counts.books).toBe(66);
			expect(body.counts.chaptersOldTestament + body.counts.chaptersNewTestament).toBe(
				body.counts.chapters,
			);
		});

		it("derives its translation counts from the catalogue it returns", async () => {
			const { body } = await call(routes.meta, "/meta");
			const translations: Json[] = body.translations;

			expect(body.counts.translationsOpenLicensed).toBe(
				translations.filter((t) => t.license.openLicensed).length,
			);
			expect(body.counts.translationsWarm).toBe(translations.filter((t) => t.warm).length);
			expect(body.counts.translationsWithAudioEnabled).toBe(
				translations.filter((t) => t.audioEnabled).length,
			);
		});

		it("gives every translation a publishing verdict", async () => {
			const { body } = await call(routes.meta, "/meta");

			for (const t of body.translations as Json[]) {
				// openLicensed is the flag every publish is gated on. An undefined
				// here would read as falsy and silently block, or worse, as truthy.
				expect(typeof t.license.openLicensed, `${t.slug} has no openLicensed flag`).toBe("boolean");
				expect(t.license.publishing).toBeTruthy();
				expect(t.license.attribution).toBeTruthy();
				expect(t.readerUrl).toBe(`/bible/${t.slug}`);
			}
		});

		it("matches the translation catalogue held in the database", async () => {
			const { body } = await call(routes.meta, "/meta");
			const rows = (await query`SELECT count(*)::int AS n FROM bible`) as unknown as { n: number }[];

			expect(body.counts.translations).toBe(rows[0].n);
		});

		it("offers exactly one default voice", async () => {
			const { body } = await call(routes.meta, "/meta");

			expect(body.voices.length).toBeGreaterThan(0);
			expect(body.voices.filter((v: Json) => v.isDefault)).toHaveLength(1);
		});

		it("states plainly that word-level timings do not exist", async () => {
			const { body } = await call(routes.meta, "/meta");

			// The single most expensive thing a downstream consumer could invent.
			expect(body.timestamps.verseLevel).toBe(true);
			expect(body.timestamps.wordLevel).toBe(false);
		});
	});

	// ------------------------------------------------------------- /studies

	describe("GET /studies", () => {
		it("returns the shared catalogue", async () => {
			const { status, body } = await call(routes.studies, "/studies");

			expect(status).toBe(200);
			expect(body.studyPlans.length).toBeGreaterThan(0);

			const slugs = body.studyPlans.map((p: Json) => p.slug);
			expect(new Set(slugs).size).toBe(slugs.length);
		});

		it("describes each plan with real numbers", async () => {
			const { body } = await call(routes.studies, "/studies");
			const { body: meta } = await call(routes.meta, "/meta");

			for (const plan of body.studyPlans as Json[]) {
				expect(plan.name).toBeTruthy();
				expect(plan.description).toBeTruthy();
				expect(plan.readings).toBe(
					meta.studyPlans.find((p: Json) => p.slug === plan.slug).readings,
				);
				expect(plan.chapters).toBeGreaterThan(0);
				// A plan claiming the whole canon must actually span it.
				if (plan.coversWholeCanon) expect(plan.chapters).toBe(meta.counts.chapters);
				expect(plan.readings_preview.length).toBeLessThanOrEqual(5);
			}
		});

		it("previews readings as spans a consumer can render", async () => {
			const { body } = await call(routes.studies, "/studies");

			for (const plan of body.studyPlans as Json[]) {
				for (const step of plan.readings_preview as Json[]) {
					expect(step.title).toBeTruthy();
					expect(step.bookName).toBeTruthy();
					if (step.startChapter !== null && step.endChapter !== null) {
						expect(step.endChapter).toBeGreaterThanOrEqual(step.startChapter);
					}
				}
			}
		});
	});

	// ---------------------------------------------------------- /characters

	describe("GET /characters", () => {
		it("returns a page of the library", async () => {
			const { status, body } = await call(routes.characters, "/characters?page=1");

			expect(status).toBe(200);
			expect(body.characters.length).toBeGreaterThan(0);
			expect(body.characters.length).toBeLessThanOrEqual(body.page.size);
			expect(body.page.number).toBe(1);
			expect(body.page.pages).toBe(Math.max(1, Math.ceil(body.page.total / body.page.size)));
			expect(body.license.attribution).toBeTruthy();
		});

		it("hands back URLs rather than making the caller build them", async () => {
			const { body } = await call(routes.characters, "/characters?page=1");

			for (const row of body.characters as Json[]) {
				// Slugs carry a dataset-id suffix (moses_2108), so a constructed URL
				// would 404. These two fields are the documented escape from that.
				expect(row.apiUrl).toBe(`/api/content/v1/characters/${row.slug}`);
				expect(row.profileUrl).toBe(`/bible/people/${row.slug}`);
				expect(row.mentionCount).toBeGreaterThanOrEqual(0);
			}
		});

		it("searches by name", async () => {
			const { status, body } = await call(routes.characters, "/characters?q=moses");

			expect(status).toBe(200);
			expect(body.characters.length).toBeGreaterThan(0);
			for (const row of body.characters as Json[]) {
				expect(row.name.toLowerCase()).toContain("moses");
			}
		});

		it("returns an empty page rather than an error for a name nobody has", async () => {
			const { status, body } = await call(routes.characters, "/characters?q=zzzznotaperson");

			expect(status).toBe(200);
			expect(body.characters).toEqual([]);
			expect(body.page.total).toBe(0);
		});

		it("filters to a letter that the index says has entries", async () => {
			const { body: first } = await call(routes.characters, "/characters?page=1");
			const letter: string = first.letters[0];

			const { body } = await call(routes.characters, `/characters?letter=${letter}`);

			expect(body.characters.length).toBeGreaterThan(0);
			for (const row of body.characters as Json[]) {
				expect(row.name[0].toUpperCase()).toBe(letter.toUpperCase());
			}
		});

		it("falls back to page 1 for a nonsense page number", async () => {
			const { body: page1 } = await call(routes.characters, "/characters?page=1");

			for (const bad of ["-3", "0", "abc", ""]) {
				const { status, body } = await call(routes.characters, `/characters?page=${bad}`);
				// Paging is a convenience, not a contract to violate loudly: a bad
				// page must not 500 a pipeline mid-crawl.
				expect(status, `page=${bad} should not fail`).toBe(200);
				expect(body.page.number).toBe(1);
				expect(body.characters[0].slug).toBe(page1.characters[0].slug);
			}
		});

		it("pages without repeating or losing rows", async () => {
			const { body: page1 } = await call(routes.characters, "/characters?page=1");
			if (page1.page.pages < 2) return;

			const { body: page2 } = await call(routes.characters, "/characters?page=2");

			expect(page2.page.number).toBe(2);
			expect(page2.page.total).toBe(page1.page.total);
			const overlap = new Set(page1.characters.map((c: Json) => c.slug));
			for (const row of page2.characters as Json[]) {
				expect(overlap.has(row.slug), `${row.slug} appears on both pages`).toBe(false);
			}
		});

		it("returns an empty page past the end", async () => {
			const { body: page1 } = await call(routes.characters, "/characters?page=1");
			const beyond = page1.page.pages + 50;

			const { status, body } = await call(routes.characters, `/characters?page=${beyond}`);

			expect(status).toBe(200);
			expect(body.characters).toEqual([]);
			expect(body.page.total).toBe(page1.page.total);
		});
	});

	// --------------------------------------------------- /characters/{slug}

	describe("GET /characters/{slug}", () => {
		it("resolves a slug taken from the index", async () => {
			const row = anyCharacter!;
			const { status, body } = await callWith(routes.character, `/characters/${row.slug}`, {
				slug: row.slug,
			});

			expect(status).toBe(200);
			expect(body.character.slug).toBe(row.slug);
			expect(body.character.name).toBe(row.name);
			expect(body.license.attribution).toBeTruthy();
		});

		it("populates scripture whether or not a narrative exists", async () => {
			const row = anyCharacter!;
			const { body } = await callWith(routes.character, `/characters/${row.slug}`, {
				slug: row.slug,
			});

			// The documented promise: an ungenerated profile still carries every
			// verse that names the person.
			expect(body.scripture.totalMentions).toBe(row.mentionCount);
			expect(body.scripture.linkedTranslation).toBeTruthy();

			for (const book of body.scripture.books as Json[]) {
				const fromChapters = book.chapters.reduce(
					(n: number, c: Json) => n + c.verses.length,
					0,
				);
				// `citations` is a flattened convenience view of `chapters`; if the
				// two ever disagree, one of them is lying about the same data.
				expect(book.citations).toHaveLength(fromChapters);
				for (const citation of book.citations as string[]) {
					expect(citation).toMatch(new RegExp(`^${book.usfm} \\d+:\\d+$`));
				}
			}
		});

		it("says which of the two profile states it is in", async () => {
			const row = anyCharacter!;
			const { body } = await callWith(routes.character, `/characters/${row.slug}`, {
				slug: row.slug,
			});

			if (body.profile.status === "ready") {
				expect(body.profile.overview).toBeTruthy();
				expect(typeof body.profile.citationsValid).toBe("boolean");
				for (const ref of body.profile.overviewRefs as string[]) {
					expect(ref).toMatch(/^[A-Z0-9]{3} \d+:\d+$/);
				}
				for (const event of body.profile.timeline as Json[]) {
					expect(event.title).toBeTruthy();
				}
			} else {
				// "not written yet", never a bare absence the caller has to guess at.
				expect(body.profile.message).toBeTruthy();
				expect(body.profile.overview).toBeUndefined();
			}
		});

		it("cites only verses that genuinely name the character", async () => {
			// The filter that makes citationsValid meaningful: whatever survives
			// into a ref array must appear in the mention set, no matter what the
			// generating model originally offered.
			const { body: index } = await call(routes.characters, "/characters?q=moses");
			const slug = index.characters[0].slug;
			const { body } = await callWith(routes.character, `/characters/${slug}`, { slug });

			if (body.profile.status !== "ready") return;

			const mentions = new Set(
				(body.scripture.books as Json[]).flatMap((b) => b.citations as string[]),
			);
			const cited = [
				...(body.profile.overviewRefs as string[]),
				...(body.profile.significanceRefs as string[]),
				...(body.profile.timeline as Json[]).flatMap((e) => e.refs as string[]),
			];

			for (const ref of cited) {
				expect(mentions.has(ref), `${ref} is cited but does not name ${slug}`).toBe(true);
			}
		});

		it("reports an unknown slug as CHARACTER_NOT_FOUND", async () => {
			const { status, body } = await callWith(routes.character, "/characters/not-a-person-xyz", {
				slug: "not-a-person-xyz",
			});

			expect(status).toBe(404);
			expect(body.error).toBe("CHARACTER_NOT_FOUND");
			// Points at the way out, since slugs cannot be constructed by hand.
			expect(body.message).toContain("/api/content/v1/characters?q=");
		});

		it("does not accept a bare name as a slug", async () => {
			// Documented trap: Moses is moses_2108. A bare name must fail loudly
			// rather than resolve to something adjacent.
			const { status, body } = await callWith(routes.character, "/characters/moses", {
				slug: "moses",
			});

			if (status === 200) {
				expect(body.character.slug).toBe("moses");
				return;
			}
			expect(status).toBe(404);
			expect(body.error).toBe("CHARACTER_NOT_FOUND");
		});
	});

	// --------------------------------------------------------- /daily-verse

	describe("GET /daily-verse", () => {
		it("found a curated verse whose chapter is cached", () => {
			// Failing here is a data signal, not a test problem: no chapter in the
			// verse-of-the-day rotation is cached, so the endpoint can serve nothing.
			expect(
				daily,
				"no verse-of-the-day chapter is cached — run `npm run warm:bible -- --bible bsb-en`",
			).not.toBeNull();
		});

		it("features exactly the verse the product features that day", async () => {
			const { date, pick } = daily!;
			const { status, body } = await call(routes.dailyVerse, `/daily-verse?date=${date}`);

			expect(status, JSON.stringify(body)).toBe(200);
			expect(body.date).toBe(date);
			// Selection is the product's own list and its own day-of-year arithmetic,
			// not a second implementation that could drift: a daily post built here
			// must be about the verse the app is actually showing readers.
			expect(body.reference.canonical).toBe(
				`${pick.bookAbbreviation} ${pick.chapter}:${pick.verse}`,
			);
			expect(body.reference.usfm).toBe(pick.bookAbbreviation);
			expect(body.reference.chapter).toBe(pick.chapter);
			expect(body.reference.verse).toBe(pick.verse);
			expect(body.text).toBeTruthy();
			expect(body.readerUrl).toContain(`#verse-${pick.verse}`);
			expect(body.rotation.curatedVerses).toBe(DAILY_VERSES.length);
		});

		it("is deterministic for a given date", async () => {
			const { date } = daily!;
			const a = await call(routes.dailyVerse, `/daily-verse?date=${date}`);
			const b = await call(routes.dailyVerse, `/daily-verse?date=${date}`);

			// A scheduled daily job must be re-runnable without producing a
			// different verse the second time.
			expect(a.status).toBe(200);
			expect(b.body.reference.canonical).toBe(a.body.reference.canonical);
			expect(b.body.text).toBe(a.body.text);
		});

		it("steps to the next curated verse the next day", async () => {
			const { date } = daily!;
			const next = nextDay(date);
			const expected = DAILY_VERSES[dayOfYear(next) % DAILY_VERSES.length];

			const { status, body } = await call(routes.dailyVerse, `/daily-verse?date=${next}`);

			// The rotation must advance, and advance to the list's next entry — a
			// stuck selection would feed a pipeline the same verse forever.
			if (status !== 200) {
				expect(status).toBe(404);
				return;
			}
			expect(body.reference.canonical).toBe(
				`${expected.bookAbbreviation} ${expected.chapter}:${expected.verse}`,
			);
		});

		it("hands back a reference that /verses accepts", async () => {
			const { date } = daily!;
			const { body } = await call(routes.dailyVerse, `/daily-verse?date=${date}`);

			// apiReference is documented as feed-straight-back. Prove it parses, and
			// prove both endpoints report the same bytes for the same verse.
			const ref = body.reference.apiReference;
			const verses = await callWith(routes.verses, `/verses/${ref}`, { reference: ref });

			expect(verses.status, JSON.stringify(verses.body)).toBe(200);
			expect(verses.body.verses).toHaveLength(1);
			expect(verses.body.verses[0].text).toBe(body.text);
		});

		it("serves text byte-identical to the database", async () => {
			const { date } = daily!;
			const { body } = await call(routes.dailyVerse, `/daily-verse?date=${date}`);

			const rows = (await query`
				SELECT v.content AS content
				FROM verse v
				JOIN chapter c ON c.id = v."chapterId"
				JOIN book b   ON b.id = c."bookId"
				JOIN bible bi ON bi.id = b."bibleId"
				WHERE bi.slug = ${body.translation.slug}
				  AND upper(b.abbreviation) = ${body.reference.usfm}
				  AND c."chapterNumber" = ${body.reference.chapter}
				  AND v."verseNumber" = ${body.reference.verse}
			`) as unknown as { content: string }[];

			expect(rows).toHaveLength(1);
			// Whitespace is layout, not noise — the same rule /verses is held to.
			expect(body.text).toBe(rows[0].content);
			expect(Buffer.from(body.text, "utf8").equals(Buffer.from(rows[0].content, "utf8"))).toBe(true);
		});

		it("defaults to today when no date is given", async () => {
			const { status, body } = await call(routes.dailyVerse, "/daily-verse");
			const today = new Date().toISOString().slice(0, 10);
			const pick = DAILY_VERSES[dayOfYear(today) % DAILY_VERSES.length];

			// Today's chapter may legitimately be cold under a pinned budget, so the
			// documented 404 is acceptable here — a wrong verse is not.
			if (status !== 200) {
				expect(status).toBe(404);
				return;
			}
			expect(body.date).toBe(today);
			expect(body.reference.canonical).toBe(
				`${pick.bookAbbreviation} ${pick.chapter}:${pick.verse}`,
			);
		});

		it("rejects a malformed date", async () => {
			for (const bad of ["15-01-2026", "2026-1-5", "yesterday", "2026-01-15T00:00:00Z"]) {
				const { status, body } = await call(routes.dailyVerse, `/daily-verse?date=${bad}`);
				expect(status, `date=${bad} should be rejected`).toBe(400);
				expect(body.error).toBe("INVALID_DATE");
			}
		});

		it("reports an unknown translation rather than falling back to another", async () => {
			const { status, body } = await call(
				routes.dailyVerse,
				"/daily-verse?translation=not-a-translation",
			);

			// Silently substituting a translation would put unlicensed text into a
			// publish that believed it had asked for something else.
			expect(status).toBe(404);
			expect(body.error).toBe("TRANSLATION_NOT_FOUND");
		});
	});

	// --------------------------------------------------- /narration/{ref}

	describe("GET /narration/{reference}", () => {
		it("found a produced narration to verify against", () => {
			// Not a skip: if nothing in this environment has ever been narrated,
			// the audio contract is untested and that should be visible.
			expect(
				narration,
				"no ready chapter narration in this database — run `npm run backfill:narration`",
			).not.toBeNull();
		});

		it("returns the chapter file with its verse timings", async () => {
			const n = narration!;
			const ref = `${n.usfm.toLowerCase()}-${n.chapter}`;
			const { status, body } = await callWith(
				routes.narration,
				`/narration/${ref}?translation=${n.bibleSlug}&voice=${n.voice}`,
				{ reference: ref },
			);

			expect(status, JSON.stringify(body)).toBe(200);
			expect(body.audio.url).toMatch(/^https?:\/\//);
			expect(body.audio.format).toBe("audio/mpeg");
			expect(body.audio.voice).toBe(n.voice);
			expect(body.audio.durationMs).toBeGreaterThan(0);
			expect(body.timestamps.granularity).toBe("verse");
			expect(body.timestamps.wordLevelAvailable).toBe(false);
			expect(body.timestamps.exact).toBe(true);
		});

		it("returns segments in order and inside the file", async () => {
			const n = narration!;
			const ref = `${n.usfm.toLowerCase()}-${n.chapter}`;
			const { body } = await callWith(
				routes.narration,
				`/narration/${ref}?translation=${n.bibleSlug}&voice=${n.voice}`,
				{ reference: ref },
			);

			const segments: Json[] = body.timestamps.segments;
			expect(segments.length).toBeGreaterThan(1);

			let previousEnd = -1;
			for (const s of segments) {
				expect(s.endMs).toBeGreaterThanOrEqual(s.startMs);
				expect(s.durationMs).toBe(s.endMs - s.startMs);
				// An offset past the end of the audio would desync an animation.
				expect(s.endMs).toBeLessThanOrEqual(body.audio.durationMs);
				// Segments are laid out in order along the one chapter file.
				expect(s.startMs).toBeGreaterThanOrEqual(previousEnd < 0 ? 0 : previousEnd);
				previousEnd = s.endMs;
			}
		});

		it("zero-bases a whole-chapter window on its first segment", async () => {
			const n = narration!;
			const ref = `${n.usfm.toLowerCase()}-${n.chapter}`;
			const { body } = await callWith(
				routes.narration,
				`/narration/${ref}?translation=${n.bibleSlug}&voice=${n.voice}`,
				{ reference: ref },
			);

			const segments: Json[] = body.timestamps.segments;
			expect(segments[0].relativeStartMs).toBe(0);
			expect(body.passage.startMs).toBe(segments[0].startMs);
			expect(body.passage.durationMs).toBe(body.passage.endMs - body.passage.startMs);
			for (const s of segments) {
				expect(s.relativeStartMs).toBe(s.startMs - body.passage.startMs);
				expect(s.relativeEndMs).toBe(s.endMs - body.passage.startMs);
			}
		});

		it("windows a verse range into the same chapter file", async () => {
			const n = narration!;
			const whole = `${n.usfm.toLowerCase()}-${n.chapter}`;
			const { body: chapter } = await callWith(
				routes.narration,
				`/narration/${whole}?translation=${n.bibleSlug}&voice=${n.voice}`,
				{ reference: whole },
			);

			const verses = (chapter.timestamps.segments as Json[]).filter(
				(s) => s.kind === "verse" && s.verse !== null,
			);
			if (verses.length < 2) return;
			const from = verses[0].verse;
			const to = verses[1].verse;

			const ref = `${n.usfm.toLowerCase()}-${n.chapter}-${from}-${to}`;
			const { status, body } = await callWith(
				routes.narration,
				`/narration/${ref}?translation=${n.bibleSlug}&voice=${n.voice}`,
				{ reference: ref },
			);

			expect(status).toBe(200);
			// One MP3 per chapter: a passage is a window, never a separate file.
			expect(body.audio.url).toBe(chapter.audio.url);
			expect(body.audio.durationMs).toBe(chapter.audio.durationMs);

			const windowed: Json[] = body.timestamps.segments;
			expect(windowed.map((s) => s.verse)).toEqual([from, to]);
			expect(body.passage.startMs).toBe(verses[0].startMs);
			expect(body.passage.endMs).toBe(verses[1].endMs);
			expect(windowed[0].relativeStartMs).toBe(0);
			// Absolute offsets are unchanged by windowing — only the relative ones move.
			expect(windowed[0].startMs).toBe(verses[0].startMs);
		});

		it("refuses a translation it may never narrate", async () => {
			expect(unlicensedSlug, "no audioEnabled=false translation to test against").not.toBeNull();

			const { status, body } = await callWith(
				routes.narration,
				`/narration/john-3?translation=${unlicensedSlug}`,
				{ reference: "john-3" },
			);

			expect(status).toBe(404);
			// Distinct from NOT_GENERATED on purpose: this one must never be retried.
			expect(body.error).toBe("NOT_LICENSED");
			expect(body.status).toBe("not_licensed");
			expect(body.translation.license.openLicensed).toBe(false);
		});

		it("reports missing audio as NOT_GENERATED rather than generating it", async () => {
			const before = (await query`
				SELECT count(*)::int AS n FROM audio_asset
			`) as unknown as { n: number }[];

			const { status, body } = await callWith(routes.narration, "/narration/3jn-1", {
				reference: "3jn-1",
			});

			const after = (await query`
				SELECT count(*)::int AS n FROM audio_asset
			`) as unknown as { n: number }[];
			// Generation is a premium, signed-in action. A GET here must never
			// start one, whatever the answer turns out to be.
			expect(after[0].n).toBe(before[0].n);

			if (status === 200) return;
			expect(status).toBe(404);
			expect(body.error).toBe("NOT_GENERATED");
			expect(body.status).toMatch(/^not_generated$|^not_ready:/);
		});

		it("rejects a malformed reference before touching the database", async () => {
			const cases: [string, string][] = [
				["zzz-1", "UNKNOWN_BOOK"],
				["john", "INVALID_REFERENCE"],
				["john-3-18-16", "INVALID_VERSE_RANGE"],
				["psa-999", "CHAPTER_OUT_OF_RANGE"],
				["john-1-1-40", "RANGE_TOO_LARGE"],
			];

			for (const [reference, error] of cases) {
				const { status, body } = await callWith(routes.narration, `/narration/${reference}`, {
					reference,
				});
				expect(status, `${reference} should be a client error`).toBe(400);
				expect(body.error, `${reference}`).toBe(error);
			}
		});
	});

	// ------------------------------------------------------- across the API

	describe("every endpoint", () => {
		const unauthenticated = async (key: string, url: string, params?: Record<string, string>) => {
			const request = new NextRequest(`${BASE}${url}`);
			const response = await routes[key].GET(request, {
				params: Promise.resolve(params ?? {}),
			});
			return { status: response.status, body: await response.json() };
		};

		it("rejects a request with no API key", async () => {
			const calls: [string, string, Record<string, string>?][] = [
				["meta", "/meta"],
				["studies", "/studies"],
				["characters", "/characters"],
				["character", "/characters/moses_2108", { slug: "moses_2108" }],
				["dailyVerse", "/daily-verse"],
				["narration", "/narration/john-3", { reference: "john-3" }],
			];

			for (const [key, url, params] of calls) {
				const { status, body } = await unauthenticated(key, url, params);
				expect(status, `${url} answered without a key`).toBe(401);
				expect(body.error).toBe("UNAUTHORIZED");
				// Says nothing about whether any keys are configured.
				expect(JSON.stringify(body)).not.toContain(KEY);
			}
		});

		it("stamps every response with the API version", async () => {
			const meta = await call(routes.meta, "/meta");
			const studies = await call(routes.studies, "/studies");
			const missing = await callWith(routes.character, "/characters/nope", { slug: "nope" });

			// Errors carry it too — a consumer must be able to tell a v1 error
			// from a proxy's.
			for (const r of [meta, studies, missing]) {
				expect(r.body.apiVersion).toBe(CONTENT_API_VERSION);
			}
		});

		it("never caches an error", async () => {
			const { headers } = await callWith(routes.character, "/characters/nope", { slug: "nope" });

			expect(headers.get("Cache-Control")).toBe("no-store");
		});

		it("returns a machine code, never prose, as `error`", async () => {
			const errors = [
				await callWith(routes.character, "/characters/nope", { slug: "nope" }),
				await call(routes.dailyVerse, "/daily-verse?date=nope"),
				await callWith(routes.narration, "/narration/zzz-1", { reference: "zzz-1" }),
			];

			for (const { body } of errors) {
				// Consumers branch on `error`; a sentence here would break them the
				// first time someone improved the wording.
				expect(body.error).toMatch(/^[A-Z][A-Z0-9_]*$/);
				expect(body.message).toBeTruthy();
			}
		});

		it("writes nothing while serving the whole surface", async () => {
			const counts = async () =>
				(await query`
					SELECT (SELECT count(*) FROM verse)        AS verses,
					       (SELECT count(*) FROM chapter)      AS chapters,
					       (SELECT count(*) FROM entity)       AS entities,
					       (SELECT count(*) FROM entity_content) AS profiles,
					       (SELECT count(*) FROM audio_asset)  AS audio,
					       (SELECT count(*) FROM bible)        AS bibles
				`) as unknown as Record<string, string>[];

			const before = (await counts())[0];

			await call(routes.meta, "/meta");
			await call(routes.studies, "/studies");
			await call(routes.characters, "/characters?page=1");
			await call(routes.dailyVerse, "/daily-verse");
			await callWith(routes.character, `/characters/${anyCharacter!.slug}`, {
				slug: anyCharacter!.slug,
			});
			await callWith(routes.narration, "/narration/john-3", { reference: "john-3" });

			expect((await counts())[0]).toEqual(before);
		});
	});
});
