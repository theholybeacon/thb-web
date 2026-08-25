# Content API v1

A read-only, key-authenticated API over The Holy Beacon's real content: verse
text, character profiles, narration audio with timing data, reading plans and
the verse of the day.

It exists so automated tooling — above all the marketing pipeline, which lives
in its own repository — can build on what the product **actually** contains
rather than on anything a language model recalls or invents. Every response
here comes from the same database and the same services that render the app.

**This API is for our own tooling. It is not public.**

---

## Base URL and auth

| | |
|---|---|
| Production | `https://theholybeacon.com/api/content/v1` |
| Local | `http://localhost:3014/api/content/v1` |
| Auth header | `x-api-key: <secret>` |
| Format | JSON. Every response carries `apiVersion`. |

Keys live in the `CONTENT_API_KEYS` environment variable as comma-separated
`label:secret` pairs — the same pattern as `CRON_SECRET`. Issue one key per
consumer: rate limits and hydration budgets are metered per label, and logs name
the label that misbehaved.

```
CONTENT_API_KEYS="marketing:<long-random-secret>,localdev:<another>"
```

Only the **first** colon separates label from secret, so a secret may itself
contain colons. If the variable is unset or empty, **every request is rejected**
— failing closed is deliberate, so a missing env var in a new environment cannot
silently publish the whole catalogue.

```bash
curl -H "x-api-key: $CONTENT_API_KEY" \
  "https://theholybeacon.com/api/content/v1/verses/john-3-16?translation=bsb-en"
```

---

## Read this before you build

### Timestamps: verse-level yes, word-level no

- **Verse-level timings exist and are exact.** Every ready narration ships
  `startMs`/`endMs` per verse, counted from MPEG frames in the source audio, not
  interpolated from a words-per-minute estimate.
- **Word-level timings do not exist anywhere in this system.** Each verse is
  synthesized as one clip, so a verse is the smallest addressable unit. Do not
  infer sub-verse timing; do not generate it and present it as ours.
- **Naming trap:** the product also has "alignment" data. That is Strong's
  *original-language* word mapping — which English word corresponds to which
  Greek or Hebrew lemma. It is lexical, not temporal, and carries no timing
  information at all. It cannot be used for audio sync.

### Licensing: you are publishing, not just reading

Rendering a verse in a reader and burning it into a video are different acts.

- **Scripture text.** Only translations with `license.openLicensed = true` may be
  quoted in published material or narrated. That flag reuses the audit in
  `src/lib/bibleLicense.ts`, which defaults to `false` for anything unrecognised.
  `GET /meta` lists the whole catalogue with the flag set. Everything else is
  copyrighted and must not appear in published output.
- **Character data** comes from
  [theographic-bible-metadata](https://github.com/robertrouse/theographic-bible-metadata)
  under **CC-BY-SA 4.0**, which is share-alike: published derivatives must credit
  the dataset. Every character response carries a ready-to-use `attribution`
  string.

### Coverage: not every chapter is cached

Verse text is fetched from the upstream provider the first time anyone reads a
chapter, then kept. So coverage is partial and uneven, and the upstream daily
quota is **shared with live readers**.

- Chapters already cached are served instantly and unmetered.
- A cold chapter costs one upstream request, drawn from that key's
  `CONTENT_API_HYDRATION_BUDGET` (default 200/day). When the budget is spent, the
  endpoint returns `404 NOT_HYDRATED` instead of spending readers' quota.
- **Do not crawl cold chapters.** To make a translation reliably available, warm
  it once: `npm run warm:bible -- --bible bsb-en`.

### "Read-only" — precisely what is guaranteed

No endpoint here mutates user state or product state. There is no `POST`, `PUT`,
`PATCH` or `DELETE` handler anywhere under `/api/content`, and a test asserts
that no such handler is ever added.

One honest caveat: `/verses` and `/daily-verse` read through the app's own
hydrating path, so a cold chapter is fetched and cached on the way past. That is
a content cache-fill — it produces exactly the rows a reader visiting the page
would produce, touches nothing belonging to any user, and is bounded by the
hydration budget above. Every other endpoint is a pure read.

---

## Reference format

Wherever an endpoint takes a `{reference}`, these all work (case-insensitive;
`.` and `_` are equivalent to `-`):

| Form | Meaning |
|---|---|
| `psa-117` | whole chapter |
| `john-3-16` | single verse |
| `john-3-16-18` | verse range |
| `JHN.3.16` | USFM code, dot separators |
| `1co-13-4-7` | numbered book, range |
| `song-of-solomon-1-1` | multi-word book name |

USFM codes (`jhn`), English names (`john`) and common variants (`psalms`,
`revelations`, `philippians`) are all accepted. `GET /meta` returns the full list
of accepted book keys.

Ranges are capped at **25 verses** — request the whole chapter instead. Only the
66-book Protestant canon is addressable; deuterocanonical books are rejected.

---

## Endpoints

### `GET /meta`

The catalogue: everything needed to construct a valid request anywhere else,
plus the real counts behind the product's claims.

```bash
curl -H "x-api-key: $KEY" https://theholybeacon.com/api/content/v1/meta
```

```jsonc
{
  "apiVersion": "1.0.0",
  "api": { "readOnly": true, "maxVerseRange": 25, "acceptedBookKeys": ["1ch", "1co", "..."] },
  "counts": {
    "translations": 404,
    "translationsOpenLicensed": 46,
    "translationsWarm": 9,
    "translationsWithAudioEnabled": 46,
    "characters": 3067,
    "studyPlans": 2,
    "books": 66,
    "chapters": 1189,
    "chaptersOldTestament": 929,
    "chaptersNewTestament": 260
  },
  "translations": [
    {
      "slug": "bsb-en",
      "version": "BSB",
      "name": "Berean Standard Bible",
      "language": "English",
      "audioEnabled": true,
      "warm": true,                     // pre-loaded; verse lookups are reliable
      "recommended": true,
      "recommendedReason": "Modern, accurate, and released to the public domain (CC0).",
      "readerUrl": "/bible/bsb-en",
      "license": {
        "openLicensed": true,           // ← gate every publish on this
        "kind": "public-domain",
        "label": "Berean Standard Bible",
        "textSource": "api.bible",
        "attribution": "Berean Standard Bible — text via API.Bible (api.bible).",
        "publishing": "Cleared for republishing, including in video. Credit the translation by name."
      }
    }
  ],
  "voices": [
    { "id": "onyx", "gender": "male",   "isDefault": false },
    { "id": "sage", "gender": "female", "isDefault": true }
  ],
  "interfaceLocales": ["en", "es"],
  "studyPlans": [
    { "slug": "chronological",  "name": "Just Read the Bible",  "readings": 102, "chapters": 1189, "coversWholeCanon": true },
    { "slug": "cover-to-cover", "name": "From Cover to Cover",  "readings": 66,  "chapters": 1189, "coversWholeCanon": true }
  ],
  "timestamps": { "verseLevel": true, "wordLevel": false, "note": "..." },
  "licensing": { "characters": { "...": "..." }, "scripture": "..." }
}
```

---

### `GET /verses/{reference}`

Exact verse text, **verbatim from the database**.

| Param | | |
|---|---|---|
| `translation` | query | Translation slug or version code. Default `bsb-en`. |

```bash
curl -H "x-api-key: $KEY" \
  "https://theholybeacon.com/api/content/v1/verses/genesis-1-1-3?translation=bsb-en"
```

```jsonc
{
  "apiVersion": "1.0.0",
  "reference": {
    "requested": "genesis-1-1-3",
    "canonical": "GEN 1:1-3",
    "display": "Genesis 1:1-3",
    "usfm": "GEN", "bookName": "Genesis", "chapter": 1,
    "startVerse": 1, "endVerse": 3
  },
  "verses": [
    { "verse": 1, "text": "In the beginning God created the heavens and the earth.\n" },
    { "verse": 2, "text": "    \nNow the earth was formless and void, ...\n" },
    { "verse": 3, "text": "    \n    And God said, “Let there be light,”  and there was light. \n" }
  ],
  "text": "In the beginning God created ... and there was light. \n",
  "chapter": {
    "number": 1,
    "verseCount": 31,
    "readerUrl": "/bible/bsb-en/gen/1",
    "verseUrl": "/bible/bsb-en/gen/1#verse-1"
  },
  "translation": { "...": "as in /meta" },
  "hydratedOnDemand": false
}
```

> **The whitespace is content, not formatting.** A blank line is a paragraph
> break and a bare newline is a poetry line break — that is how the reader lays
> verses out. `text` is returned byte-for-byte as stored. If you need a single
> clean line for a caption, collapse it **on your side**, and never write the
> collapsed form back as if it were the verse.

---

### `GET /characters`

Browse or search the character library.

| Param | | |
|---|---|---|
| `q` | query | Name search. |
| `letter` | query | First-letter filter. |
| `page` | query | 1-based. 60 per page. |

```bash
curl -H "x-api-key: $KEY" \
  "https://theholybeacon.com/api/content/v1/characters?q=moses"
```

```jsonc
{
  "characters": [
    {
      "slug": "moses_2108",              // note the dataset-id suffix
      "name": "Moses",
      "gender": "Male",
      "mentionCount": 774,               // best available prominence signal
      "profileUrl": "/bible/people/moses_2108",
      "apiUrl": "/api/content/v1/characters/moses_2108"
    }
  ],
  "page": { "number": 1, "size": 60, "total": 1, "pages": 1 },
  "letters": ["A", "B", "..."],
  "license": { "...": "CC-BY-SA 4.0 attribution block" }
}
```

> Slugs are **not** bare names — Moses is `moses_2108`. Always resolve a slug
> through this endpoint rather than constructing one.

---

### `GET /characters/{slug}`

One character's full profile: dataset facts, generated narrative, and every
scripture citation behind it.

```jsonc
{
  "character": {
    "slug": "moses_2108", "name": "Moses", "aliases": ["Moses"],
    "gender": "Male", "birthYear": -1571, "deathYear": -1452,
    "profileUrl": "/bible/people/moses_2108"
  },
  "profile": {
    "status": "ready",
    "overview": "...", "overviewRefs": ["GEN 1:1", "GEN 1:2"],
    "significance": "...", "significanceRefs": ["..."],
    "timeline": [{ "title": "...", "description": "...", "refs": ["EXO 2:10"] }],
    "relationships": [{ "name": "Aaron", "relation": "brother", "relatedSlug": "aaron_1", "refs": ["..."] }],
    "citationsValid": true,
    "generatedAt": "2026-08-20T21:39:55.261Z"
  },
  "scripture": {
    "totalMentions": 774,
    "linkedTranslation": "bsb-en",
    "books": [
      { "usfm": "EXO", "name": "Exodus",
        "chapters": [{ "chapter": 2, "verses": [10, 11, 14] }],
        "citations": ["EXO 2:10", "EXO 2:11", "EXO 2:14"] }
    ]
  },
  "license": { "...": "CC-BY-SA 4.0 attribution block" }
}
```

**Narrative sections are generated on first view.** A character nobody has opened
returns `profile.status: "not_generated"` with a message, and no narrative
fields. That means "not written yet", not "this person has no story" — the
`scripture` block is still fully populated either way.

`citationsValid` reports whether every generated citation survived verification
against the character's real verse mentions. Treat `false` as a reason not to
quote that profile's narrative.

---

### `GET /narration/{reference}`

Narration audio for a passage, with the timing data an animation needs.

| Param | | |
|---|---|---|
| `translation` | query | Translation slug. Default `bsb-en`. |
| `voice` | query | `sage` (female, default) or `onyx` (male). |

```bash
curl -H "x-api-key: $KEY" \
  "https://theholybeacon.com/api/content/v1/narration/gen-2-5-7?translation=bsb-en&voice=sage"
```

```jsonc
{
  "reference": { "canonical": "GEN 2:5-7", "display": "Genesis 2:5-7", "...": "..." },
  "audio": {
    "url": "https://....public.blob.vercel-storage.com/audio/chapter/<hash>/sage-....mp3",
    "format": "audio/mpeg",
    "voice": "sage",
    "durationMs": 241992,          // the WHOLE chapter file
    "byteSize": 3871872,
    "language": "English",
    "generatedAt": "2026-08-20T21:39:55.261Z"
  },
  "passage": { "startMs": 34416, "endMs": 69240, "durationMs": 34824 },
  "timestamps": {
    "granularity": "verse",
    "wordLevelAvailable": false,
    "exact": true,
    "segments": [
      { "kind": "verse", "verse": 5,
        "startMs": 34416, "endMs": 50976,          // offsets in the chapter file
        "relativeStartMs": 0, "relativeEndMs": 16560,  // offsets in the passage
        "durationMs": 16560, "text": "..." }
    ]
  },
  "translation": { "...": "as in /meta" }
}
```

**One MP3 per chapter.** A passage is a window into it, not a file of its own —
use `passage.startMs`/`endMs` to seek, `startMs`/`endMs` per segment to sync
against the chapter, and `relativeStartMs`/`relativeEndMs` to lay the passage out
on its own zero-based timeline.

Non-verse segments (`kind: "heading"`) appear only in whole-chapter requests.

**This endpoint never generates audio.** Narration is produced by a premium,
signed-in action against a licence-cleared translation. If it has not been
produced, you get a `404` explaining which case you hit:

| `error` | `status` | Meaning |
|---|---|---|
| `NOT_LICENSED` | `not_licensed` | This translation may never be narrated. Pick another; do not retry. |
| `NOT_GENERATED` | `not_generated` | Not produced yet. Pre-generate with `scripts/backfill-bible-audio.ts`. |
| `NOT_GENERATED` | `not_ready:generating` | Being produced right now. Retry shortly. |

---

### `GET /studies`

The two ready-made reading plans offered to every reader.

```jsonc
{
  "studyPlans": [
    { "slug": "chronological", "name": "Just Read the Bible",
      "description": "...", "readings": 102, "chapters": 1189,
      "coversWholeCanon": true, "catalogUrl": "/study",
      "readings_preview": [{ "title": "...", "book": "GEN", "bookName": "Genesis",
                             "startChapter": 1, "endChapter": 11 }] }
  ],
  "note": "Readers can also describe a topic and have a plan generated for them; those plans belong to the reader and are not exposed here."
}
```

Plans a reader generates for themselves are private and are **not reachable from
this API at all** — there is no endpoint that can return them.

---

### `GET /daily-verse`

The verse of the day — the same one the product features on that date.

| Param | | |
|---|---|---|
| `date` | query | `YYYY-MM-DD` (UTC). Default: today. |
| `translation` | query | Default `bsb-en`. |

```jsonc
{
  "date": "2026-08-24",
  "reference": {
    "canonical": "DEU 31:6", "display": "Deuteronomy 31:6",
    "usfm": "DEU", "bookName": "Deuteronomy", "chapter": 31, "verse": 6,
    "apiReference": "deu-31-6"          // feed straight back to /verses
  },
  "text": "Be strong and courageous; do not be afraid or terrified of them, ...\n",
  "readerUrl": "/bible/bsb-en/deu/31#verse-6",
  "translation": { "...": "as in /meta" },
  "rotation": { "curatedVerses": 105, "note": "..." }
}
```

Deterministic: the same date always yields the same verse, so a scheduled daily
job is reproducible and safely re-runnable. Selection is day-of-year across a
curated list of 105 references.

---

## Errors

Every error is `{ "apiVersion", "error": "MACHINE_CODE", "message": "..." }`.
Branch on `error`, never on `message`.

| Status | `error` | Meaning |
|---|---|---|
| 400 | `INVALID_REFERENCE` | Malformed reference. |
| 400 | `UNKNOWN_BOOK` | Book name not recognised, or outside the 66-book canon. |
| 400 | `CHAPTER_OUT_OF_RANGE` | Chapter number exceeds the book's length. |
| 400 | `INVALID_VERSE_RANGE` | Range is not ascending. |
| 400 | `RANGE_TOO_LARGE` | More than 25 verses. Request the chapter. |
| 400 | `INVALID_DATE` | `date` is not `YYYY-MM-DD`. |
| 401 | `UNAUTHORIZED` | Missing or wrong `x-api-key`. |
| 404 | `TRANSLATION_NOT_FOUND` | No such translation slug or version. |
| 404 | `CHAPTER_NOT_FOUND` | The chapter does not exist in this translation. Do not retry. |
| 404 | `VERSE_NOT_FOUND` | Chapter exists; that verse does not. |
| 404 | `NOT_HYDRATED` | Chapter is not cached and this key's hydration budget is spent. Warm the translation. |
| 404 | `CHARACTER_NOT_FOUND` | No such character slug. |
| 404 | `NOT_GENERATED` / `NOT_LICENSED` | See the narration table above. |
| 429 | `RATE_LIMITED` | Honour the `Retry-After` header. |
| 503 | `UPSTREAM_QUOTA_EXCEEDED` | The scripture provider's daily quota is spent. **Retryable** — back off until tomorrow. Cached text is unaffected. |
| 503 | `UPSTREAM_UNAVAILABLE` | The scripture provider failed. **Retryable.** |

`404 CHAPTER_NOT_FOUND` and `503 UPSTREAM_QUOTA_EXCEEDED` are deliberately
distinct: the first is settled, the second is temporary. A job that treats them
alike will either hammer a chapter that will never exist or permanently conclude
that Scripture is missing.

---

## Rate limits and budgets

| Variable | Default | Effect |
|---|---|---|
| `CONTENT_API_RATE_LIMIT_PER_MINUTE` | 60 | Requests per minute per key → `429`. |
| `CONTENT_API_HYDRATION_BUDGET` | 200 | Cold chapters per key per UTC day. `0` disables on-demand fetching entirely. |

Both are **in-process and per-instance**: on serverless, each warm instance keeps
its own counter, so the effective ceiling is the configured value times the
number of instances. They are a courtesy brake against a runaway loop, not a
security control — the API key is what keeps strangers out.

Successful responses are cached (`Cache-Control: public, s-maxage=3600`); errors
are `no-store`.

---

## Local development

```bash
cp docs/env.example .env.local        # then fill it in
npm run build && npm run start        # serves :3014

curl -H "x-api-key: $KEY" localhost:3014/api/content/v1/meta
```

Prefer a production build over `next dev` for API work.

Run the tests with `npm run test`. They cover reference parsing, auth, rate
limiting, the hydration budget, narration windowing, and a structural check that
no mutating handler exists under `/api/content`. The central test asserts that
served verse text is **byte-identical** to a direct `SELECT` — it discovers a
cached chapter at runtime rather than hardcoding one, and pins the hydration
budget to `0` so it can never write.

Database-backed tests skip themselves when `DATABASE_URL` is unset.

---

## Releasing: keeping the knowledge pack fresh

The `product-knowledge/` folder is generated from this API. Refresh it as part of
a release:

This repository has no CI, so the refresh is a **documented manual release step**
rather than an automated job.

```bash
npm run knowledge:refresh -- --dry-run   # 1. review what would change
npm run knowledge:refresh                # 2. write the generated blocks
git checkout -b knowledge/refresh-<version>
git commit -am "chore: refresh product knowledge pack"
                                         # 3. open a PR and review it by hand
```

**Never auto-merge a knowledge update.** The point is that a person confirms the
product description is still true before the marketing system acts on it.

| Flag | Effect |
|---|---|
| *(none)* | Rewrite the generated blocks and print the diff. |
| `--dry-run` | Print the diff, write nothing. |
| `--check` | Print the diff, write nothing, **exit 1 if stale**. For a release gate. |
| `--api` | Take counts from a running Content API instead of the database. Set `CONTENT_API_URL` and `CONTENT_API_KEY`. Doubles as a cross-check that the API and the database agree. |

Only text between `<!-- generated:start ... -->` and `<!-- generated:end ... -->`
is ever rewritten. Hand-written prose — and all of `positioning.draft.md`, which
has no generated block — is left byte-identical.

The script also prints the newest `CHANGELOG.md` entries, so shipped features
surface as marketing candidates. That file does not exist yet; the script
proposes a minimal Keep a Changelog format and works fine without one.

If CI is added later, the natural wiring is a job on release tags that runs
`npm run knowledge:refresh` and opens a PR — never a merge.

---

## Connecting from the marketing repo

Everything the marketing pipeline needs to configure:

| | |
|---|---|
| **Base URL** | `https://theholybeacon.com/api/content/v1` (`NEXT_PUBLIC_BASE_URL` + `/api/content/v1`) |
| **Auth** | `x-api-key: <secret>` on every request |
| **Getting a key** | Add a `label:secret` pair to `CONTENT_API_KEYS` in this app's environment. One key per consumer. |
| **API contract** | This file. |
| **Product description** | `product-knowledge/` — features, user flows, data catalog, glossary, positioning. |
| **Start here** | `GET /meta` — the catalogue, the real counts, and every accepted book key. |

Hard rules for anything published:

1. **Never invent scripture.** Quote only `/verses` output, byte-for-byte.
2. **Only open-licensed translations.** Gate on `license.openLicensed`.
3. **Credit character data.** CC-BY-SA 4.0 is share-alike; use the supplied
   `attribution` string.
4. **Verse-level timings only.** Word-level timings do not exist — do not
   synthesize them and present them as ours.
5. **Do not crawl cold chapters.** Warm a translation once with
   `npm run warm:bible`; back off on `503 UPSTREAM_QUOTA_EXCEEDED`.
