# Product Knowledge Pack

A distilled, human-readable description of **The Holy Beacon**, written for the
marketing system that generates content about it.

It exists so generated copy is grounded in what the product actually does. No
detail here is recalled or assumed — every claim is checked against the product,
and the numbers are regenerated from live data.

## What's here

| File | What it's for |
|---|---|
| **[features.md](features.md)** | Every user-facing feature: what it does, the problem it solves, what's distinctive. Start here. |
| **[flows.md](flows.md)** | Step-by-step user journeys with entry URLs and selectors — precise enough to script and film. |
| **[data-catalog.md](data-catalog.md)** | What content exists and how to fetch it through the Content API. The only data path. |
| **[glossary.md](glossary.md)** | The product's own vocabulary in English and Spanish, plus tone and words to avoid. |
| **[positioning.draft.md](positioning.draft.md)** | ⚠ **DRAFT — inference, not fact.** Awaiting Andrés's rewrite. Do not treat as ground truth. |

## How to use it

1. **`features.md` and `glossary.md` are the ground truth for claims and wording.**
2. **`data-catalog.md` is the only sanctioned way to get product data.** Never
   quote Scripture, a character detail or a count from memory — fetch it.
3. **`flows.md` is the reference for anything filmed against the live app.**
4. **`positioning.draft.md` is not yet approved.** Prefer the verified files
   until Andrés has rewritten it.

## The rules that never bend

1. **Never invent Scripture.** Verse text comes from the Content API, quoted
   exactly.
2. **Only publish open-licensed translations.** Gate on `license.openLicensed`.
3. **Credit character data.** It is CC-BY-SA 4.0 and share-alike.
4. **Verse-level audio timing only.** Word-level timing does not exist.
5. **Never state a number you haven't fetched.**

## Keeping it current

Blocks marked `<!-- generated:start -->` are produced from live data. Do not edit
them by hand — they are overwritten. Everything outside those markers is written
by a person and is never touched by the tooling.

```bash
npm run knowledge:refresh -- --dry-run   # show what would change
npm run knowledge:refresh                # write the generated blocks
npm run knowledge:refresh -- --check     # exit 1 if stale (for CI)
```

Review the diff, commit on a branch, and open a PR. **Knowledge updates are never
auto-merged** — the point is that a person confirms the product description is
still true.
