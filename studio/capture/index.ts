import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { SceneSchema, type Scene, type CaptureManifest } from "../schema";
import { resolveSelector, SELECTORS } from "../selectors";
import { launch } from "./browser";
import { Screencast } from "./screencast";
import { humanType } from "./humanize";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Read TypeMode's rendered char spans in order → the exact expected string. */
async function readTypeText(page: any): Promise<string> {
  return await page.evaluate((sel: string) => {
    const root = document.querySelector(sel);
    if (!root) return "";
    const spans = root.querySelectorAll(":scope > span > span");
    const NBSP = String.fromCharCode(160); // TypeMode renders spaces as nbsp
    return Array.from(spans)
      .map((s) => ((s as HTMLElement).textContent ?? "").split(NBSP).join(" "))
      .join("");
  }, SELECTORS["type.text"]);
}

export async function capture(runDir: string): Promise<CaptureManifest> {
  const scene: Scene = SceneSchema.parse(
    JSON.parse(await readFile(path.join(runDir, "scene.json"), "utf8")),
  );

  const rawDir = path.join(runDir, "raw");
  const framesDir = path.join(runDir, "frames");
  await mkdir(rawDir, { recursive: true });
  await mkdir(framesDir, { recursive: true });

  const { browser, context, page, css } = await launch(scene);
  const markers: Record<string, number> = {};
  let sc: Screencast | null = null;

  try {
    for (const action of scene.capture.actions) {
      switch (action.do) {
        case "goto": {
          await page.goto(scene.baseUrl + action.url, {
            waitUntil: action.waitUntil,
            timeout: 45000,
          });
          // Re-apply the cinematic CSS post-navigation (belt-and-suspenders vs.
          // the init-script style losing to app hydration).
          await page.addStyleTag({ content: css }).catch(() => {});
          // Fonts loaded + settle before the first recorded frame (no FOUT).
          await page.evaluate(() => (document as any).fonts?.ready).catch(() => {});
          await sleep(scene.capture.settleMs);
          if (!sc) sc = await Screencast.start(page, rawDir);
          break;
        }
        case "click": {
          await page.locator(resolveSelector(action.target)).first().click({ timeout: 15000 });
          break;
        }
        case "waitFor": {
          await page
            .locator(resolveSelector(action.target))
            .first()
            .waitFor({ state: action.state, timeout: action.timeoutMs });
          break;
        }
        case "wait": {
          await sleep(action.ms);
          break;
        }
        case "mark": {
          markers[action.name] = Math.round(sc ? sc.nowMs() : 0);
          break;
        }
        case "typeInto": {
          const expected =
            action.text === "dom" ? await readTypeText(page) : action.text;
          if (!expected) throw new Error("typeInto: expected text is empty (selector missed?)");
          await humanType(page, expected, {
            wpm: action.wpm,
            typoRate: action.typoRate,
            maxChars: action.maxChars,
            stopWhenVisible: action.stopWhenVisible
              ? resolveSelector(action.stopWhenVisible)
              : undefined,
          });
          break;
        }
      }
    }

    if (!sc) throw new Error("No goto action ran — nothing was recorded.");
    await sleep(200);
    await sc.stop();

    const { frameCount, durationMs } = await sc.resample(scene.capture.fps, framesDir);
    const manifest: CaptureManifest = {
      sceneId: scene.id,
      fps: scene.capture.fps,
      frameCount,
      durationMs,
      viewport: {
        width: scene.capture.viewport.width * scene.capture.deviceScaleFactor,
        height: scene.capture.viewport.height * scene.capture.deviceScaleFactor,
      },
      markers,
    };
    await writeFile(path.join(runDir, "capture.json"), JSON.stringify(manifest, null, 2));
    return manifest;
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}
