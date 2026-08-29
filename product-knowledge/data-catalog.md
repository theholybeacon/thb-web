# The Holy Beacon — Data Catalog

What content the product holds, and how to fetch it.

**The Content API is the only way the marketing system gets product data.** Not a
database connection, not scraping the site, and above all not memory. If a fact
is not available through an endpoint below, it is not a fact we can publish.

Full technical contract: **`docs/content-api.md`** in the product repository.

---

## Connecting

| | |
|---|---|
| Base URL | `https://www.theholybeacon.com/api/content/v1` |
| Auth | `x-api-key: <secret>` on every request |
| Format | JSON |

```bash
curl -H "x-api-key: $CONTENT_API_KEY" \
  "https://www.theholybeacon.com/api/content/v1/meta"
```

Start every session with `/meta`. It returns the whole catalogue, the real
counts, the accepted reference spellings, and the licence flag you must gate
publishing on.

---

## What's available

<!-- generated:start catalog -->
| Content | How much | Endpoint |
|---|---|---|
| Bible translations | 404 (46 cleared for publishing, 9 pre-loaded) | `/meta` |
| Verse text | 66 books, 1,189 chapters per translation | `/verses/{reference}` |
| Bible characters | 3,067 | `/characters`, `/characters/{slug}` |
| Narration audio | Produced on demand; 2 voices | `/narration/{reference}` |
| Ready-made reading plans | 2 | `/studies` |
| Verse of the day | 105 in rotation | `/daily-verse` |

*Generated 2026-08-25 from the live product.*
<!-- generated:end catalog -->

---

## Verse text

```
GET /verses/{reference}?translation={slug}
```

| Param | Notes |
|---|---|
| `{reference}` | `psa-117`, `john-3-16`, `john-3-16-18`, `1co-13-4-7`, `song-of-solomon-1-1`, `JHN.3.16` |
| `translation` | Translation slug. Default `bsb-en`. |

```bash
curl -H "x-api-key: $KEY" \
  ".../verses/genesis-1-1-3?translation=bsb-en"
```

```jsonc
{
  "reference": { "canonical": "GEN 1:1-3", "display": "Genesis 1:1-3", "..." : "..." },
  "verses": [
    { "verse": 1, "text": "In the beginning God created the heavens and the earth.\n" }
  ],
  "text": "In the beginning God created ...",
  "chapter": { "readerUrl": "/bible/bsb-en/gen/1", "verseUrl": "/bible/bsb-en/gen/1#verse-1" },
  "translation": { "slug": "bsb-en", "license": { "openLicensed": true } }
}
```

**Rules for using verse text:**

1. **Quote it exactly.** The text comes back byte-for-byte as stored. Never
   paraphrase, never "clean up", never regenerate from memory.
2. **The whitespace is real.** Blank lines are paragraph breaks and newlines are
   poetry line breaks — that is how the passage is meant to sit on a page. If a
   caption needs one clean line, collapse it **on your side**, and never store
   the collapsed version as if it were the verse.
3. **Check the licence.** Publish only where `translation.license.openLicensed`
   is `true`.
4. Ranges are capped at 25 verses. Ask for the whole chapter instead.

**Coverage is partial.** Chapter text loads the first time anyone reads it, so
not every chapter of every translation is present. `bsb-en` and `kjv-en` are the
best-covered. A `404 NOT_HYDRATED` means "not loaded yet", not "does not exist" —
ask for it to be pre-loaded rather than hammering it.

---

## Bible characters

```
GET /characters?q={search}&letter={A}&page={n}
GET /characters/{slug}
```

```bash
curl -H "x-api-key: $KEY" ".../characters?q=moses"
curl -H "x-api-key: $KEY" ".../characters/moses_2108"
```

The search endpoint returns the slug, name, gender, and **mention count** — how
many verses name that person, which is the best available signal of prominence
and a good way to pick a subject worth a video.

The detail endpoint returns names and alternate spellings, approximate dates,
every verse that mentions them grouped by book, and — when written — an overview,
significance, a timeline of events, and relationships, **each cited to specific
verses**.

**Rules for using character data:**

1. **Slugs are not names.** Moses is `moses_2108`. Always resolve through the
   search endpoint; never construct a slug.
2. **`profile.status` may be `not_generated`.** That means the profile has not
   been written yet, not that the person has no story — scripture mentions are
   present either way. The **~107 most-mentioned characters are already written**,
   which covers every recognisable name; the ~2,900-person tail mostly is not.
   Filter on `status: "ready"` rather than assuming.
3. **Understand `citationsValid` before you act on it.** It is `false` on roughly
   4 profiles in 10, and it does **not** mean the profile contains fabrications.
   Every reference that survives into the response has been checked against the
   verses that literally name that person, so **the refs you receive are always
   real**. `false` only means some citations the model offered were *dropped* —
   usually because it cited a verse where the person is present but not named by
   name. So: quote the narrative, cite only the refs actually present, and never
   imply a sentence is backed by a citation that isn't in the response.
   If a section has an empty ref array, treat that section as uncited — use it
   for understanding, not as a sourced claim.
4. **Credit the dataset.** Character data is CC-BY-SA 4.0 and share-alike.
   Every response carries a ready-made `attribution` string; use it.
5. Every claim in a profile is tied to a verse. If you want to state something
   about a character that isn't in the profile, **you cannot** — go get the
   verses instead.

---

## Narration audio and timing

```
GET /narration/{reference}?translation={slug}&voice={sage|onyx}
```

Returns the audio URL, its duration, and **verse-level timing**.

```jsonc
{
  "audio": { "url": "https://...mp3", "durationMs": 241992, "voice": "sage" },
  "passage": { "startMs": 34416, "endMs": 69240, "durationMs": 34824 },
  "timestamps": {
    "granularity": "verse",
    "wordLevelAvailable": false,
    "exact": true,
    "segments": [
      { "verse": 5,
        "startMs": 34416, "endMs": 50976,
        "relativeStartMs": 0, "relativeEndMs": 16560,
        "durationMs": 16560, "text": "..." }
    ]
  }
}
```

**Read this carefully — it governs what animation is possible:**

- **Verse-level timing exists and is exact.** It is measured from the audio
  itself, not estimated from a reading-speed guess. You can sync a caption to a
  verse with confidence.
- **Word-level timing does not exist.** Not anywhere, in any form. A verse is the
  smallest unit you can address. **Do not generate word timings and present them
  as the product's** — if you need per-word animation, derive it yourself and
  label it as your own approximation.
- **One MP3 per chapter.** A passage is a window into it. Use `passage.startMs`
  to seek, `startMs`/`endMs` to sync against the chapter, and
  `relativeStartMs`/`relativeEndMs` to lay the passage out on its own timeline
  starting at zero.
- **Audio may not exist.** It is produced on demand and only for translations
  legally cleared for narration. A `404` tells you which case: `not_licensed`
  (never retry, pick another translation) or `not_generated` (ask for it to be
  pre-generated).

There is other data in the product called "alignment". **It is not timing data**
— it maps English words to the underlying Greek and Hebrew. It cannot be used for
audio sync.

---

## Reading plans

```
GET /studies
```

Returns the two ready-made plans: slug, name, description, number of readings,
chapters covered, and a preview of the first few readings.

Plans a reader generates for themselves are private and are **not available
through this API at all**. Talk about the AI study generator as a capability;
never quote an individual reader's plan.

---

## Verse of the day

```
GET /daily-verse?date=YYYY-MM-DD&translation={slug}
```

The verse the product is featuring on that date — the natural spine for a daily
content schedule, and it keeps marketing and product saying the same thing on the
same day.

Deterministic: the same date always returns the same verse, so a scheduled job is
reproducible and safe to re-run. The response includes `reference.apiReference`,
which you can pass straight back to `/verses` or `/narration`.

---

## Building a link back to the product

Most responses include a `readerUrl` or `verseUrl`. Prefix it with
`https://www.theholybeacon.com`:

| Content | Link |
|---|---|
| A chapter | `/bible/{translation}/{book}/{chapter}` |
| A verse | `/bible/{translation}/{book}/{chapter}#verse-{n}` |
| A character | `/bible/people/{slug}` |
| The free explorer | `/bible` |

The reader, the character pages and the explorer are all **public and need no
account** — they are safe to send anyone to, and are the best landing points for
a campaign.

---

## Errors worth handling

| Status | Meaning | What to do |
|---|---|---|
| `401 UNAUTHORIZED` | Missing or wrong key | Fix the key. |
| `404 NOT_HYDRATED` | Chapter not loaded yet | Pick another passage; ask for pre-loading. |
| `404 CHAPTER_NOT_FOUND` | Does not exist in that translation | **Settled.** Never retry. |
| `404 NOT_GENERATED` | Audio not produced yet | Ask for it to be pre-generated. |
| `404 NOT_LICENSED` | Translation may never be narrated | **Settled.** Use another translation. |
| `429 RATE_LIMITED` | Too fast | Honour `Retry-After`. |
| `503 UPSTREAM_QUOTA_EXCEEDED` | Daily text allowance spent | **Temporary.** Back off until tomorrow. |

The difference between `404 CHAPTER_NOT_FOUND` and `503 UPSTREAM_QUOTA_EXCEEDED`
matters: one is permanent, the other clears overnight. Treating them alike will
either hammer something that will never exist or permanently conclude that
Scripture is missing.

---

## The five rules

1. **Never invent Scripture.** Only text from `/verses`, quoted exactly.
2. **Only publish open-licensed translations.** Gate on `license.openLicensed`.
3. **Credit character data.** CC-BY-SA 4.0 is share-alike.
4. **Verse-level timing only.** Word-level timing does not exist.
5. **Don't crawl cold chapters.** Ask for pre-loading; back off on 503.
