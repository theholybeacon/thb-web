import { z } from "zod";

/**
 * The Scene spec — the hand-editable contract between stages.
 *
 * `plan` writes a resolved scene.json into a run dir; you edit it; `capture`
 * reads only it; `render` reads scene.json + capture.json. Re-running one stage
 * never forces the others.
 */

export const ActionSchema = z.discriminatedUnion("do", [
  z.object({
    do: z.literal("goto"),
    url: z.string(),
    waitUntil: z.enum(["load", "domcontentloaded", "networkidle"]).default("networkidle"),
  }),
  z.object({ do: z.literal("click"), target: z.string() }),
  z.object({
    do: z.literal("waitFor"),
    target: z.string(),
    state: z.enum(["visible", "hidden"]).default("visible"),
    timeoutMs: z.number().default(15000),
  }),
  z.object({ do: z.literal("wait"), ms: z.number() }),
  /** Stamp a named instant on the capture timeline; captions anchor to these. */
  z.object({ do: z.literal("mark"), name: z.string() }),
  z.object({
    do: z.literal("typeInto"),
    target: z.string(),
    /** "dom" = read the expected string out of TypeMode's rendered spans (exact). */
    text: z.union([z.literal("dom"), z.string()]).default("dom"),
    maxChars: z.number().optional(),
    wpm: z.number().default(160),
    typoRate: z.number().default(0.025),
    /** Stop early once this selector appears (e.g. the completion stat tiles). */
    stopWhenVisible: z.string().optional(),
  }),
]);
export type CaptureAction = z.infer<typeof ActionSchema>;

export const CaptionSchema = z.object({
  text: z.string(),
  /** Anchor to a `mark` name; edit offset/duration by hand after eyeballing capture.json. */
  atMarker: z.string(),
  offsetMs: z.number().default(0),
  durationMs: z.number().default(2400),
  style: z.enum(["hook", "caption"]).default("caption"),
  position: z.enum(["top", "center", "bottom"]).default("bottom"),
});
export type Caption = z.infer<typeof CaptionSchema>;

export const SceneSchema = z.object({
  id: z.string(),
  title: z.string(),
  /** The running app to film. Founder's dev server is :3014; :3016 is the proxy-free port used in this repo. */
  baseUrl: z.string().default("http://localhost:3014"),

  capture: z.object({
    viewport: z
      .object({ width: z.number().default(360), height: z.number().default(640) })
      .default({ width: 360, height: 640 }),
    // 360x640 @3 = exactly 1080x1920 (portrait short-form).
    deviceScaleFactor: z.number().default(3),
    fps: z.number().default(30),
    settleMs: z.number().default(800),
    /** Chrome-hiding / cinematic CSS injected on every navigation. */
    css: z.string().default("studio/styles/demo.css"),
    actions: z.array(ActionSchema),
  }),

  compose: z.object({
    hook: z.string(),
    verseRef: z.string().optional(),
    captions: z.array(CaptionSchema).default([]),
    endCard: z.object({
      headline: z.string(),
      sub: z.string(),
      cta: z.string(),
    }),
    /** Freeze on the final frame this long before the end card fully takes over. */
    tailHoldMs: z.number().default(1400),
  }),

  publish: z.object({
    caption: z.string(),
    hashtags: z.array(z.string()).default([]),
    platforms: z.array(z.string()).default(["tiktok", "reels", "shorts"]),
  }),
});
export type Scene = z.infer<typeof SceneSchema>;

/** Written by `capture`, read by `render`. */
export interface CaptureManifest {
  sceneId: string;
  fps: number;
  frameCount: number;
  durationMs: number;
  viewport: { width: number; height: number };
  /** marker name -> ms from frame 0 */
  markers: Record<string, number>;
}
