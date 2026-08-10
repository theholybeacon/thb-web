import type { Page } from "playwright";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Lognormal-ish jitter around a base delay — real typing isn't uniform.
function jitter(baseMs: number): number {
  const f = Math.exp((Math.random() - 0.5) * 0.7);
  return Math.max(20, baseMs * f);
}

const NEIGHBORS: Record<string, string> = {
  a: "s", s: "d", d: "f", f: "g", g: "h", h: "j", j: "k", k: "l", l: "k",
  e: "r", r: "t", t: "y", y: "u", u: "i", i: "o", o: "p", n: "m", m: "n", c: "v", v: "b",
};
function neighbor(ch: string): string {
  const lower = ch.toLowerCase();
  const n = NEIGHBORS[lower];
  if (!n) return ch;
  return ch === lower ? n : n.toUpperCase();
}

export interface TypeOpts {
  wpm: number;
  typoRate: number;
  maxChars?: number;
  /** Stop once this selector becomes visible (e.g. completion tiles). */
  stopWhenVisible?: string;
}

/**
 * Dispatch a key, then sleep only the REMAINDER of the intended gap.
 *
 * Each keystroke costs a CDP round-trip (~15-25ms). Sleeping the full gap on
 * top of that makes every char take `dispatch + gap`, so the achieved WPM
 * always undershoots the target (60 -> ~50; a naive 160 -> ~126). Subtracting
 * the dispatch time makes the requested wpm actually land. Below ~20ms/char the
 * dispatch floor dominates and WPM plateaus — irrelevant at 160 (75ms/char).
 */
async function keyThenGap(page: Page, key: string, gapMs: number, press = false): Promise<void> {
  const t0 = Date.now();
  if (press) await page.keyboard.press(key);
  else await page.keyboard.type(key);
  const spent = Date.now() - t0;
  await sleep(Math.max(0, gapMs - spent));
}

/**
 * Type `expected` with human cadence: real key events (TypeMode reads e.key on
 * keydown, so insertText is ignored), occasional adjacent-key typos + backspace
 * (a flawless run looks fake), faster spaces, slower punctuation.
 */
export async function humanType(page: Page, expected: string, o: TypeOpts): Promise<void> {
  const baseMs = 60_000 / (o.wpm * 5); // chars/min = wpm*5
  const limit = o.maxChars ? Math.min(o.maxChars, expected.length) : expected.length;

  for (let idx = 0; idx < limit; idx++) {
    const ch = expected[idx];

    if (Math.random() < o.typoRate && /[a-z]/i.test(ch)) {
      await keyThenGap(page, neighbor(ch), jitter(baseMs * 1.6));
      await keyThenGap(page, "Backspace", jitter(baseMs * 1.1), true);
    }

    let d = baseMs;
    if (ch === " ") d *= 0.65;
    else if (/[.,;:!?]/.test(ch)) d *= 2.1;
    await keyThenGap(page, ch, jitter(d));

    if (o.stopWhenVisible && idx % 5 === 0) {
      const done = await page
        .locator(o.stopWhenVisible)
        .first()
        .isVisible()
        .catch(() => false);
      if (done) return;
    }
  }
}
