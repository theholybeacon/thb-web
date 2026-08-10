# The Studio — automated in-app demo videos

Local, semi-manual pipeline that films the **real app** and composites a
short-form (1080×1920) demo video. You drive it stage by stage and edit the
artifact between each step. Nothing auto-posts — final files land in `out/`.

```
plan  ─►  scene.json  ─►  capture  ─►  frames/ + capture.json  ─►  render  ─►  out/*.mp4 + *.md
        (edit by hand)                 (eyeball the frames)                    (copy-paste to post)
```

## One-time setup

- Dependencies are already installed (`playwright`, `remotion`, `@remotion/cli`).
- Capture uses your installed **Google Chrome** (`channel: "chrome"`) — no extra download.
- Remotion downloads its own headless shell on first render (~90MB, once).
- **Run the app first**, and prefer a production build over `next dev` (the dev
  server is unstable under Node 23 — Tailwind crashes on reload):

  ```bash
  npm run build && npm run start          # serves :3014
  # or, quick/dirty:  npx next dev -p 3016
  ```

  Match the scene's `baseUrl` to wherever the app is (pass `--baseUrl` in `plan`).

## Make a video

```bash
# 1. Resolve a scene template → an editable scene.json in a fresh run dir
npm run studio -- plan type-the-word --baseUrl=http://localhost:3014
#    → studio/.runs/<id>/scene.json   (prints <id>)

# 2. (optional) hand-edit scene.json — hook text, captions, wpm, typoRate, URL…

# 3. Drive the app and record. A Chrome window opens — DON'T touch it.
npm run studio -- capture <id>
#    → frames/ + capture.json (with marker timings)
#    Flip through frames:  open studio/.runs/<id>/frames

# 4. (optional) scrub + tune overlays live; edit scene.json and hit reload
npm run studio -- preview <id>

# 5. Render
npm run studio -- render <id>
#    → out/<id>.mp4  +  out/<id>.md (caption + hashtags to copy-paste)
```

Each stage reads only the previous stage's files, so re-running one never forces
the others (tweak captions → just re-`render`; tweak wpm → just re-`capture`).

## Anatomy

| File | Role |
|---|---|
| `schema.ts` | The Scene contract (Zod). Defaults live here. |
| `scenes/*.ts` | Hand-authored scene templates. `type-the-word` = Milestone 1. |
| `selectors.ts` | Every DOM selector in one place (app has no test-ids). |
| `styles/demo.css` | Chrome-hiding / cinematic CSS injected during capture. **Load-bearing** — the public reader isn't mobile-responsive. |
| `capture/` | Playwright + CDP screencast → resampled frames + markers. |
| `remotion/` | The composition: captured frames + hook, captions, verse pill, end card. |
| `cli.ts` | `plan` / `capture` / `preview` / `render`. |
| `.runs/` | Per-run artifacts (gitignored). |

## Adding a scene

Copy `scenes/type-the-word.ts`, register it in the `SCENES` map in `cli.ts`.
Captions anchor to `mark` names — run `capture` once, read the marker ms from
`capture.json`, then set `atMarker` + `offsetMs`.

## How capture sizing works (don't "fix" it)

Capture runs **headless** at viewport **1080×1920, deviceScaleFactor 1**, because:
- CDP screencast records at **CSS pixels and ignores DSF** — filming at 360×640@3
  yields 360×640 frames (blurry when scaled to 1080). DSF 1 at 1080 gives sharp,
  1:1 frames.
- Headless makes the surface *equal* the viewport (headed captures the whole
  desktop window → the page sits in a narrow column on a big black frame).
- Screencast is push-based and **non-blocking**, so on-screen WPM stays honest.
  A `page.screenshot()` loop would honor DSF but stall typing and corrupt WPM.

The cost is a desktop-width layout; `studio/styles/demo.css` compensates (hides
sidebar/header, enlarges type, forces the non-breaking-space verse text to wrap).

## Notes / next milestones

- **Premium scenes** (character pages, study generator, Karaoke) need a signed-in
  Clerk session — capture against `https://theholybeacon.localhost` (Caddy) with a
  saved `storageState`, and `npx tsx scripts/dev-premium.ts active`. Not wired yet.
- **Karaoke (Listen)** additionally needs the `audio_asset` table (migration 0017,
  not yet applied locally) and a pre-warmed chapter narration.
- Milestone 1 is `type-the-word` — public, no auth, no audio, no AI.
