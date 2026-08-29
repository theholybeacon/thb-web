# The Holy Beacon — User Flows

Step-by-step journeys through the product, written so someone can script them
against the live app and film what happens.

Each flow gives the entry URL, what the reader sees, what they do, and what
results. Where a step depends on something being true first (signed in, has
Premium, audio already produced), that is stated up front rather than discovered
mid-recording.

---

## Before you script anything

**Base URLs.** Production is `https://www.theholybeacon.com`. Locally the app serves
on port **3014**, and a production build is much more reliable to film than a dev
server.

**Language is a cookie, not a URL.** There is no `/en/` or `/es/` in any address.
To film the Spanish interface, set a cookie named `locale` to `es` before
navigating — changing the URL will not do it. Default is English.

**There are no test IDs in the app.** Selectors lean on icons and structural
classes. The repository keeps every selector used for filming in one file —
`studio/selectors.ts` — and that file is the source of truth. If a flow below
names a selector, prefer the entry in that file; if the UI changes, that file is
the single place to fix.

The stable ones today:

| What | Selector |
|---|---|
| Read mode button | `button:has(svg.lucide-eye)` |
| Type mode button | `button:has(svg.lucide-keyboard)` |
| Listen mode button | `button:has(svg.lucide-headphones)` |
| Typing surface | `div.cursor-text` |
| Typing text spans | `.font-mono.text-lg` |
| Typing result tiles | `.grid.grid-cols-3` |

**What needs an account.** Everything under `/bible` and every `/u/` share page
is public. Study plans, sessions, notes, comments, the reader's notes and
community panels, Listen mode, and clickable character links inside verse text
all require a signed-in Premium account.

**Filming Premium screens** needs a saved signed-in session plus a Premium
account. The repository has a helper for granting Premium locally
(`scripts/dev-premium.ts`).

**The reader is desktop-width.** The public reader is not mobile-responsive. For
portrait video, the repository injects a stylesheet during capture
(`studio/styles/demo.css`) that hides the sidebar and header and enlarges the
type. Do not skip it and expect a usable portrait frame.

---

## Flow 1 — Read a chapter (free, no account)

**Entry:** `/bible`
**Preconditions:** none.

1. Land on **Explore the Bible** — a searchable grid of translations with a
   language filter, a "Listenable only" toggle, and a row of recommended
   translations.
2. Click a translation (or go straight to `/bible/bsb-en`).
3. The book index appears, split **Old Testament / New Testament**.
4. Click a book → a grid of chapter numbers.
5. Click a chapter → the reader opens.

**Outcome:** the chapter renders in Read mode, laid out with paragraph and poetry
breaks intact, with previous/next chapter navigation.

**Shortcut for filming:** go straight to the chapter, e.g.
`/bible/bsb-en/gen/1` or `/bible/kjv-en/psa/117`. The address is
`/bible/{translation}/{book}/{chapter}`, and `#verse-3` jumps to a verse.

> **Pick a chapter that is already loaded.** Chapter text is fetched the first
> time anyone opens it, so an untouched chapter may take a moment or, if the
> daily upstream allowance is spent, show an unavailable state. Genesis and the
> Psalms in `bsb-en` and `kjv-en` are safe. Verify before filming.

---

## Flow 2 — Type the Word (free, no account) ★ the signature demo

**Entry:** `/bible/kjv-en/psa/117`
**Preconditions:** none. This is the only headline feature that needs no account,
no Premium, no audio and no AI — which is why it is the existing demo.

1. Land on Psalm 117 — the shortest chapter in the Bible, 2 verses, about 130
   characters, so a full run completes on camera in roughly 20 seconds.
2. Click the **Type** mode button (`button:has(svg.lucide-keyboard)`).
3. Wait for the typing text to appear (`.font-mono.text-lg`).
4. Click the typing surface (`div.cursor-text`) to focus it.
5. Type the passage. Each character is graded as it is typed — correct characters
   and mistakes are painted differently, live.
6. On completion, three result tiles appear (`.grid.grid-cols-3`): **accuracy**,
   **words per minute**, and **time**.

**Outcome:** the completion tiles. That is the payoff shot.

**Notes for filming.** The on-screen speed is derived from real keystrokes, so it
is honest — type at a speed that is impressive but believable. A small deliberate
typo rate makes it look human, and mistakes are visible feedback rather than a
flaw. The existing scene uses about 160 wpm with a 2.5% typo rate.

---

## Flow 3 — Listen to a chapter (Premium)

**Entry:** `/bible/bsb-en/gen/2`
**Preconditions:** signed in, Premium, **and the narration must already exist for
that exact chapter, translation and voice.**

1. Open the chapter.
2. Click the **Listen** mode button (`button:has(svg.lucide-headphones)`).
3. If narration exists, playback controls appear and audio begins.
4. As it plays, **the current verse is highlighted** and the view follows along.
5. The player persists at the app level — navigate elsewhere and playback
   continues. Speed and volume are adjustable; the audio can be downloaded.

**Outcome:** narrated Scripture with the spoken verse highlighted in time.

> **Check the audio exists before you film.** Narration is produced the first
> time someone listens, and only for translations legally cleared for it. On a
> first-ever play the app says *"We're narrating this chapter for the first time.
> It'll be instant from now on, for everyone."* — which is charming but is not
> the shot you want. Confirm with:
> `GET /api/content/v1/narration/gen-2?translation=bsb-en&voice=sage`
> A `200` means it is ready. Anything else means pre-generate it first.
> For a copyrighted translation the scripture text is never narrated — only the
> product's own introduction and commentary.

---

## Flow 4 — Create an AI study plan (Premium)

**Entry:** `/study/create`
**Preconditions:** signed in, Premium.

1. Land on **Create Study**.
2. Fill **Name** and **Description**.
3. Set the **Length** slider — labelled from *5 minutes* to *2 months* to
   *1 year*.
4. Set the **Depth** slider — *Shallow* to *Deep*.
5. Type the topic in **AI Instructions**, e.g. *"What does the Bible say about
   forgiveness?"* The field's own examples are *"Laziness as a sin"* and similar.
6. Confirm the **Bible translation** (pre-filled with the recommended one for
   your language).
7. Submit. Generation takes a few seconds.

**Outcome:** the study detail page, listing the generated steps in order, each
with a title, a passage reference and an explanation. From here: **Start
Session**, edit, or **Regenerate Steps**.

**Notes for filming.** Generation is the slow beat — plan for it rather than
cutting awkwardly. Pick a topic whose resulting passages are recognisable, so the
output is legible in a few seconds of screen time.

---

## Flow 5 — Adopt a ready-made plan (Premium)

**Entry:** `/study`
**Preconditions:** signed in, Premium.

1. Land on **My Studies**, which includes the **Ready-made plans** catalog.
2. Choose **"Just Read the Bible"** (102 readings, chronological) or **"From
   Cover to Cover"** (66 readings, canonical order).
3. Adopt it. The plan is copied into your account in your translation.
4. Start a session and begin at reading one.

**Outcome:** an active session on a complete Bible reading plan, tracking your
progress.

---

## Flow 6 — Work through a study session (Premium)

**Entry:** `/session`, then open a session
**Preconditions:** signed in, Premium, at least one study.

1. **My Sessions** lists active and completed sessions with progress bars.
2. Click **Continue** on one.
3. The session reader opens on the current step, showing the step title, its
   explanation, and the passage.
4. Use the same **Read / Listen / Type** switcher on the step's chapters.
5. Complete the step and advance.
6. Finishing the last step opens a **Study complete** summary — steps, chapters,
   how you engaged with each, and a share option.

**Outcome:** the completion summary, which is the shareable moment.

---

## Flow 7 — Look up a Bible character (free, no account)

**Entry:** `/bible/people`
**Preconditions:** none.

1. Land on the **Bible Characters** A–Z directory.
2. Filter by letter or search by name.
3. Click a person → their profile page.
4. The page shows their name and alternate spellings, approximate dates, every
   verse that mentions them grouped by book, and — where a profile has been
   written — an overview, why they matter, a timeline, and their relationships,
   **each cited to specific verses**.
5. Click any citation to jump straight into the reader at that verse.

**Outcome:** a character profile with clickable scripture citations.

> **Slugs are not bare names.** Moses is `/bible/people/moses_2108`, not
> `/bible/people/moses`. Always resolve the real slug first via
> `GET /api/content/v1/characters?q=moses`.
>
> **Not every character has a written profile.** Profiles are generated the first
> time someone opens the page. The **~107 most-mentioned characters are already
> written** — every recognisable name (Moses, David, Jacob, Abraham, Paul,
> Solomon…) is safe to film. The long tail is not. Check before you shoot:
> `GET /api/content/v1/characters/{slug}` — `profile.status: "ready"` means it is
> there. To add more, ask for `npm run backfill:profiles -- --top N`.

---

## Flow 8 — Characters inside the verse text (Premium)

**Entry:** any chapter with named people, e.g. `/bible/bsb-en/gen/12`
**Preconditions:** names are visible to everyone; **following the link requires
Premium**.

1. Open the chapter and read.
2. Names of people are highlighted **within the verse text itself**.
3. Click one → their profile.
4. The reader's side panel also has a **People** section listing everyone in the
   chapter.

**Outcome:** going from a name in the passage to who they were, without losing
your place. This is the "Scripture in HD" demo.

---

## Flow 9 — Write a note on a verse (Premium)

**Entry:** any chapter
**Preconditions:** signed in, Premium.

1. Open a chapter and open the side panel.
2. Go to the **Notes** section and start a new note.
3. Notes can be attached to a verse, a chapter, a book, or a whole translation.
4. Save.
5. Go to `/notes` — every note across the whole Bible in one searchable place,
   each with a link back to the passage.

**Outcome:** a note that lives with the verse and is findable later.

---

## Flow 10 — Reading progress (free, signed in)

**Entry:** `/journey`
**Preconditions:** signed in. Reads best with some history.

1. Land on **Your Journey** — *"Every chapter you've read, heard, or typed —
   wherever you started."*
2. See the headline percentage of the Bible covered.
3. Below it, a grid of all **1,189 chapters**. Each square is a chapter; darker
   means you have been back. *"Each square is a chapter. Darker means you've been
   back."*
4. A breakdown of how you took chapters in — read, listened, typed, marked.
5. Milestone badges earned.
6. Switch scope between all translations and one.
7. Share as a public page, or generate a **vertical image built for social**.

**Outcome:** the heatmap and the share image. The strongest visual in the product.

---

## Flow 11 — Sign up

**Entry:** `/auth/sign-up`

1. Fill the form — including a **username**, checked for availability as it is
   typed and normalized to the handle that will appear in `/u/<username>`.
2. Enter the emailed verification code.
3. Land in the app at `/home` — a welcome, the day's verse, the streak counter,
   and tiles for studies, sessions and creating a study.

Continuing with Google skips steps 1-2, then stops at `/auth/complete-profile`
to pick the same username before `/home`. Both paths stay on our own domain —
the username is what Clerk needs to finish a sign-up, and collecting it in-app
is what keeps the flow off Clerk's hosted Account Portal.

New accounts get a free trial that **does not ask for a card**.

---

## Flow 12 — Sponsorship queue

**Entry:** `/sponsorship`

**As someone who cannot pay:** request sponsorship with a short message, then see
your position in the queue and an estimated wait.

**As a paying member:** see the queue and sponsor someone, clearing their wait.

**Outcome:** the queue view. This is the flow to film for anything about the
community program — it is the product's most distinctive social feature.

---

## Quick reference — routes

| Route | Screen | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/bible` | Translation picker | Public |
| `/bible/{translation}` | Book index | Public |
| `/bible/{translation}/{book}` | Chapter grid | Public |
| `/bible/{translation}/{book}/{chapter}` | **The reader** | Public |
| `/bible/people` | Character directory | Public |
| `/bible/people/{slug}` | Character profile | Public |
| `/u/{username}` | Someone's shared journey | Public link |
| `/auth/sign-up`, `/auth/login` | Sign up / in | Public |
| `/home` | Dashboard | Signed in |
| `/journey` | Reading progress | Signed in |
| `/profile` | Profile settings | Signed in |
| `/subscription` | Plan and billing | Signed in |
| `/sponsorship` | Sponsorship queue | Signed in |
| `/gift` | Gift Premium | Signed in |
| `/study` | Studies + ready-made plans | Premium |
| `/study/create` | AI study generator | Premium |
| `/study/{id}` | Study detail | Premium |
| `/session` | Sessions list | Premium |
| `/session/{id}` | Study session reader | Premium |
| `/notes` | All notes | Premium |
| `/comments` | Community feed | Premium |
