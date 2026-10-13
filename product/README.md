# product/: the brand brain

This folder is the single source of truth for **what The Holy Beacon is, who
it's for, and how to show it**. The content studio (`../thb-content`) reads it
on every run, so editing a file here changes what the next video says and shows.

It lives in the app repo on purpose. Features and demo flows sit next to the
code they describe, so they're updated in the same commit as the UI.

| File | What it holds | Who edits it |
|---|---|---|
| `brand.yaml` | Mission, vision, intention, audience, voice, words we don't use, claims we can make, visual identity | **Andrés.** The mission, vision and intention fields are drafts: rewrite them in your own words. |
| `facts.yaml` | Numbers that can appear on screen ("404 translations"), each with its source and date | Regenerate from `/meta`, or edit by hand with the date |
| `features/*.yaml` | One file per feature: pitch, problem, proof, routes, access level, the flows that demo it, what NOT to claim | Whoever ships the feature |
| `flows/*.yaml` | Scripted browser journeys the studio films as **live demos** (real clicks, real typing, on the real app) | Whoever touches the UI the flow uses |
| `flows/selectors.yaml` | Named selectors shared by flows (the app has no test ids) | Fix here when a UI refactor breaks a flow |

## Rules

- **Facts are checked.** A number on screen must come from `facts.yaml`. The
  studio refuses invented numbers.
- **Flows must be public unless marked otherwise.** `access: public` flows run
  signed out. `.env.local` points at the production database, so signed-in
  flows would write real data. Mark them `signedIn` / `premium`; they only run
  with a saved session (`APP_AUTH_STATE` in thb-content) against a dev database.
- **Selectors:** prefer `flows/selectors.yaml` names over raw CSS. Better
  still, add a `data-demo="…"` attribute to the component and select that.
- **Status:** `live` features can be shown. `beta` features can be shown with a
  label. `roadmap` features are never claimed as shipped.

## Flow step reference

```yaml
steps:
  - goto: /bible/kjv-en/psa/117          # navigate (base URL comes from the studio)
  - mark: start                          # named instant; the video anchors callouts/zooms here
  - mark: { name: tiles, focus: type.complete }   # …and record that element's box
  - tap: mode.type                       # click/tap (selector name or raw CSS)
  - tap: { target: mode.type, label: "Type" }    # label = the callout the video may show
  - type: { target: type.area, text: dom, wpm: 150, typos: 0.02, stopWhen: type.complete }
  - type: { target: explore.search, text: "Reina" }
  - scroll: { px: 900, ms: 1800 }        # smooth human scroll (negative = up)
  - scrollTo: "#verse-16"                # scroll an element into view
  - hover: some.selector
  - press: Enter
  - waitFor: h1                          # or { target: h1, state: hidden, timeoutMs: 20000 }
  - wait: 800                            # ms
```

## Flow params: what each run shows

Every video films its own run of a flow, live, against the app as it is now.
`params` say what that run shows; the video's script picks them, and steps,
`selectors.yaml` values and `css` use them as `{{name}}`:

```yaml
params:
  character:
    kind: character        # a person's slug or exact name, checked against the Content API
    about: Someone readers would NOT know (the writer reads this).
    default: huldah_1567
    maxMentions: 60        # refuse famous figures (Moses has 774 verse mentions)
    exclude: [god_1324]
  chapter:
    kind: chapter          # "2KI 22" / "2 Kings 22"
    mentions: character    # must name that person; default = the first chapter that does
  translation: { kind: translation, default: bsb-en }
  query: { kind: text, default: "{{character.name}}", options: [optional, allowed, values] }
steps:
  - goto: /bible/{{translation}}/{{chapter.path}}     # {{chapter.path}} = "2ki/22"
  - tap: { target: reader.personLink, label: "{{character.name}}" }
```

Variables: `{{x}}` is the value; a character also has `{{x.name}}`, a chapter
`{{x.path}}`. Params resolve in the order they're declared, so a later default
can use an earlier one. An unknown `{{var}}` stops the filming.

Each flow is filmed per interface language (`locales`) and per `viewport`
(`mobile` = 390×693 CSS px, filmed at 1080×1920; `desktop` = 1280×720, filmed at
1920×1080). Every tap, keystroke run and scroll is logged with its on-screen
box, so the video can add a cursor, tap ripples, zoom into the action and pin
callouts to the right element.
