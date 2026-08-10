import type { Page, CDPSession } from "playwright";
import { writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

interface RawFrame {
  file: string;
  tMs: number;
}

/**
 * CDP Page.startScreencast recorder. Frames are pushed off the compositor with
 * real timestamps and near-zero back-pressure on the page — so TypeMode's
 * Date.now()-based WPM stays honest (a screenshot loop would stall the page and
 * make the product's own stats lie on camera).
 *
 * Frames only arrive on repaint; the resampler sample-and-holds onto a fixed
 * grid, so idle beats cost no disk.
 */
export class Screencast {
  private frames: RawFrame[] = [];
  private i = 0;
  private t0: number | null = null;
  private startPerf = 0;

  private constructor(private cdp: CDPSession, private rawDir: string) {}

  static async start(page: Page, rawDir: string): Promise<Screencast> {
    const cdp = await page.context().newCDPSession(page);
    const sc = new Screencast(cdp, rawDir);
    cdp.on("Page.screencastFrame", async (f: any) => {
      // ACK immediately or Chrome stops emitting.
      await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
      const tMs = (f.metadata?.timestamp ?? 0) * 1000;
      if (sc.t0 === null) {
        sc.t0 = tMs;
        sc.startPerf = performance.now();
      }
      const file = `raw-${String(sc.i++).padStart(6, "0")}.jpg`;
      await writeFile(path.join(rawDir, file), Buffer.from(f.data, "base64")).catch(() => {});
      sc.frames.push({ file, tMs: tMs - sc.t0 });
    });
    await cdp.send("Page.startScreencast", {
      format: "jpeg",
      quality: 92,
      everyNthFrame: 1,
      // Clamp to the portrait device surface so stray oversized frames can't slip in.
      maxWidth: 1080,
      maxHeight: 1920,
    });
    return sc;
  }

  /** ms since the first frame — same clock captions/markers are stamped on. */
  nowMs(): number {
    return this.t0 === null ? 0 : performance.now() - this.startPerf;
  }

  async stop(): Promise<void> {
    await this.cdp.send("Page.stopScreencast").catch(() => {});
  }

  /** Sample-and-hold the raw frames onto a fixed fps grid → frames/frame-NNNNN.jpg. */
  async resample(fps: number, outDir: string): Promise<{ frameCount: number; durationMs: number }> {
    if (this.frames.length === 0) return { frameCount: 0, durationMs: 0 };
    const dtMs = 1000 / fps;
    const durationMs = this.frames[this.frames.length - 1].tMs;
    const total = Math.max(1, Math.ceil(durationMs / dtMs));
    let src = 0;
    for (let n = 0; n < total; n++) {
      const t = n * dtMs;
      while (src + 1 < this.frames.length && this.frames[src + 1].tMs <= t) src++;
      await copyFile(
        path.join(this.rawDir, this.frames[src].file),
        path.join(outDir, `frame-${String(n).padStart(5, "0")}.jpg`),
      );
    }
    return { frameCount: total, durationMs };
  }
}
