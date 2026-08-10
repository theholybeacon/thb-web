import type { Scene } from "../schema";

/**
 * "Type the Word" — the typing trainer on Psalm 117 (shortest chapter in the
 * Bible: 2 verses, ~130 chars), so a full run COMPLETES on camera in ~20s and
 * lands the 3-stat-tile payoff. Public route, no auth, no audio, no AI —
 * Milestone 1.
 *
 * This is a plain object (input shape); the CLI runs it through SceneSchema to
 * fill defaults, then writes scene.json. Edit the resolved scene.json by hand
 * between stages, not this template.
 */
export const scene: Scene = {
  id: "type-the-word__psa-117",
  title: "Type the Word — Psalm 117",
  baseUrl: "http://localhost:3014",

  capture: {
    // CDP screencast captures at CSS pixels (ignores DSF), so we film at the
    // real output resolution with DSF 1 to get sharp 1080x1920 frames while the
    // recorder stays non-blocking (a screenshot loop would slow typing + lie
    // about WPM). demo.css enlarges type for portrait legibility.
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
    fps: 30,
    settleMs: 900,
    css: "studio/styles/demo.css",
    actions: [
      { do: "goto", url: "/bible/kjv-en/psa/117", waitUntil: "networkidle" },
      { do: "mark", name: "landed" },
      { do: "wait", ms: 900 },
      { do: "click", target: "mode.type" },
      { do: "mark", name: "type_mode" },
      { do: "waitFor", target: "type.text", state: "visible", timeoutMs: 15000 },
      { do: "wait", ms: 800 },
      { do: "click", target: "type.area" },
      { do: "mark", name: "typing_start" },
      {
        do: "typeInto",
        target: "type.area",
        text: "dom",
        // Elite-but-plausible speed: ~13s for Psalm 117's 176 chars, keeping the
        // (real, keystroke-derived) on-screen WPM stat credible.
        wpm: 160,
        typoRate: 0.025,
        stopWhenVisible: "type.complete",
      },
      { do: "mark", name: "typing_end" },
      { do: "wait", ms: 1800 },
    ],
  },

  compose: {
    hook: "You don't read Scripture.\nYou type it.",
    verseRef: "Psalm 117 · KJV",
    captions: [
      {
        text: "Every character, graded live.",
        atMarker: "typing_start",
        offsetMs: 700,
        durationMs: 2600,
        style: "caption",
        position: "bottom",
      },
      {
        text: "Accuracy. WPM. No hiding.",
        atMarker: "typing_end",
        offsetMs: 200,
        durationMs: 2400,
        style: "caption",
        position: "bottom",
      },
    ],
    endCard: {
      headline: "The Holy Beacon",
      sub: "Read. Type. Listen.",
      cta: "theholybeacon.com",
    },
    tailHoldMs: 1400,
  },

  publish: {
    caption:
      "Most people skim the Psalms. Try typing one — accuracy and WPM, live, on Psalm 117.",
    hashtags: ["#bible", "#scripture", "#biblestudy", "#christiantiktok", "#psalms"],
    platforms: ["tiktok", "reels", "shorts"],
  },
};
