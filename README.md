This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database

Migrations in `./migrations` are hand-written and idempotent. Apply one with:

```bash
npm run migrate 0018_add_note.sql
```

### Seeding biblical people

The character/entity feature (character pages at `/bible/people/[slug]`, the "People in this
chapter" panel, and the inline character links inside verse text) reads from the `entity` and
`entity_mention` tables. **These are not populated by migrations** — a fresh database has the
tables but no rows, and the feature then silently renders nothing at all. Seed them with:

```bash
npm run seed:people
```

This imports ~3,000 people and ~28,000 verse mentions from the open
[theographic-bible-metadata](https://github.com/robertrouse/theographic-bible-metadata) dataset
(CC-BY-SA 4.0). It is idempotent, so re-running it to pick up dataset updates is safe.

### Pre-generating content for the Content API

Three kinds of content are produced on demand and are therefore missing until a
reader asks for them. That is fine for the app and a problem for anything
automated reading `/api/content/v1` (see `docs/content-api.md`), so each has a
backfill command. Run them in this order — narration needs cached verse text.

```bash
npm run warm:bible -- --bible bsb-en            # verse text, from api.bible
npm run backfill:profiles  -- --top 100         # character profiles
npm run backfill:narration -- --chapters psa-23 # narration + verse timings
```

Every one supports `--dry-run`. Use it: `warm:bible` spends a daily upstream
quota shared with live readers, and `backfill:narration` bills per minute of
audio produced — its `--dry-run` prints the projected cost and is the only gate.

`warm:bible` also runs unattended: `.github/workflows/warm-quota.yml` fires it
with `--drain` at 23:00 UTC, an hour before api.bible's daily allowance resets
and is lost, and spends whatever readers left behind. Translations are filled in
`src/lib/warmPriority.ts` order — the recommended bible per language, English
first, then the extra indexed English editions. So a manual `warm:bible` run is
now for targeting one translation ahead of the queue, not for coverage in
general. The job needs `DATABASE_URL` and `BIBLE_API_KEY` as repo secrets.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
