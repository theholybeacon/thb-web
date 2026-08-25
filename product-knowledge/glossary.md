# The Holy Beacon — Glossary and Voice

The product's own vocabulary, in English and Spanish, so generated copy uses our
words rather than inventing synonyms.

Every term below is taken from the product's actual interface text. When copy
names a feature, it should use the name the reader will see when they arrive —
otherwise the ad and the app are describing two different products.

---

## Product name

**The Holy Beacon** — always all three words, always capitalised that way. Never
"Holy Beacon", never "THB" in anything reader-facing, never translated. The
Spanish interface says *The Holy Beacon* too.

Domain: **theholybeacon.com**

---

## The three ways through a chapter

The signature concept. Always in this order, and this is the tagline:

| English | Spanish |
|---|---|
| **Read · Listen · Type** | **Lee · Escucha · Escribe** |

| Concept | English | Spanish |
|---|---|---|
| Reading mode | **Read** | **Leer** |
| Audio mode | **Listen** | **Escuchar** |
| Typing mode | **Type** | **Escribir** |

Say **"three ways through every chapter"**, not "three modes" — *modes* is
interface language, and *ways through* says what the reader gets. When naming
them together, use the tagline order.

---

## Core terms

| Concept | English | Spanish | Notes |
|---|---|---|---|
| Tagline | **Study the Bible, deeply** | **Estudia la Biblia, a fondo** | The headline. |
| Free reader | **Bible Explorer** / **Explore the Bible** | **Explorar la Biblia** | The free, no-account front door. |
| Primary CTA | **Start Your Journey** | **Comienza Tu Viaje** | Sign-up. |
| Secondary CTA | **Explore the Bible free** | **Explora la Biblia gratis** | Into the free reader. |
| A study plan | **Study** | **Estudio** | *My Studies / Mis Estudios.* |
| One run through a study | **Session** | **Sesión** | *My Sessions / Mis Sesiones.* |
| One reading in a plan | **Step** | **Paso** | Or **reading** in prose. |
| Progress dashboard | **Your Journey** | **Tu Camino** | Also the metaphor for the whole arc. |
| A full pass through the Bible | **Lap** | **Vuelta** | *"times through the Bible."* |
| Verse notes | **Notes** | **Notas** | *My Notes / Mis Notas.* |
| Community discussion | **Comments** | **Comentarios** | |
| Character page | **Bible character** / **character profile** | **Personaje bíblico** | Never "entity". |
| Narration | **Audio narration** / **narrated audio** | **Narración de audio** | |
| Listen pitch | **Listen to Scripture** | **Escucha las Escrituras** | |
| Free tier | **Explorer** | **Explorador** | The plan name. |
| Paid tier | **Premium** | **Premium** | Not translated. |
| Unlock line | **Unlock Premium** | **Desbloquea Premium** | |
| Community access program | **Sponsorship Program** | **Programa de Patrocinio** | |

---

## Phrases from the product worth reusing

These are the product's own words. Reusing them keeps the marketing and the app
in one voice.

**The competitive framing:**
> "Most Bible apps hand you a verse and move on."

> "Not a verse-a-day app. Every chapter comes with the people in it, narrated
> audio, your own notes, and the study structure to work through it."

**On typing — the sharpest line in the product:**
> "Type Scripture out word by word with live speed and accuracy. Slower than
> reading, and that is exactly the point."

**On character profiles:**
> "Know who you are reading about, not just what happened."

> "Every claim is cited to a real verse mention — nothing invented."

**On study plans:**
> "Describe what you want to learn and get a structured plan — passage by
> passage, session by session — with your progress tracked as you go."

**On listening:**
> "Hear every passage read aloud in a natural voice — with your screen off, on
> your commute, or through your car."

**On progress:**
> "Every chapter you've read, heard, or typed — wherever you started."

> "Each square is a chapter. Darker means you've been back."

**On the free tier:**
> "Free · No account needed"

> "Every chapter and every Bible character has its own link — send a friend
> straight to the passage."

**On sponsorship:**
> "Our community-driven sponsorship program connects those who want to support
> others with those who need access to The Holy Beacon."

**Spanish equivalents already in the product:**
> "Cada capítulo que has leído, escuchado o escrito — donde sea que empezaste."

---

## Words we don't use

| Don't say | Say instead | Why |
|---|---|---|
| Entity | Bible character, person | Internal word; means nothing to a reader. |
| Mode | Way through a chapter | Interface language. |
| AI-generated content | Study plans, character profiles | Name the thing, not the method. |
| Verse-a-day | — | This is what we position *against*. |
| Devotional app | Bible study app | We are structured study, not daily inspiration. |
| Unlimited translations | 404 translations, hundreds of translations | Say the real number or "hundreds". |
| Every translation has audio | Translations cleared for narration | Only 46 of 404 are. |
| Word-by-word audio sync | Verse-by-verse highlighting | Word-level timing does not exist. |
| Free trial (card required) | Free trial, no card needed | The trial genuinely asks for no card. |

---

## Tone

**What the product sounds like.** Calm, plain and confident. Short sentences. It
states what a feature does and trusts the reader to see why that matters. It is
reverent about Scripture without being pious about itself, and it is comfortable
being blunt about what it is not ("Not a verse-a-day app").

Even the internal notes are honest to a fault — where the original-language
lookup is a model's guess rather than scholarship, the product says so on screen.
**That honesty is part of the brand.** Copy should never overclaim, because the
product itself doesn't.

**Do:**
- Lead with what the reader gets.
- Use real numbers.
- Use Scripture references correctly and exactly.
- Let the "slower, and that is exactly the point" tension do the work.

**Don't:**
- Guilt anyone about not reading their Bible.
- Use hype words — *revolutionary*, *game-changing*, *unlock the secrets*.
- Imply theological authority. The product presents Scripture and cites sources;
  it does not interpret on anyone's behalf.
- Promise a specific chapter's audio without checking it exists.

---

## Scripture references

- In copy, write references the way readers do: **John 3:16**, **Psalm 117**,
  **1 Corinthians 13:4-7**.
- In API calls, use the URL form: `john-3-16`, `psa-117`, `1co-13-4-7`.
- **Always name the translation** when quoting, e.g. *"John 3:16 · BSB"*.
- Spanish copy should use Spanish book names — *Juan 3:16*, *Salmo 117* — and
  quote from a Spanish translation, not a translated English one.

---

## Numbers in copy

Use the live figures from the Content API's `/meta` endpoint, never a
remembered number. The product's own landing page currently says **"400+
translations"** and **"3,000+ Bible characters"**, which are honest roundings of
404 and 3,067. Matching that phrasing is safe; inventing a different number is
not.
