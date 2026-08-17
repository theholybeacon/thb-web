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
