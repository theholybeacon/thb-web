/**
 * The Studio CLI — staged, inspectable, resumable.
 *
 *   npm run studio -- plan type-the-word        # → .runs/<id>/scene.json (edit by hand)
 *   npm run studio -- capture <id>              # → frames/ + capture.json
 *   npm run studio -- preview <id>              # Remotion Studio: scrub + tune scene.json
 *   npm run studio -- render <id>               # → out/*.mp4 + out/*.md
 *
 * Each stage reads only the previous stage's files, so re-running one never
 * forces the others. Requires the app running at the scene's baseUrl.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { SceneSchema, type Scene } from "./schema";
import { scene as typeTheWord } from "./scenes/type-the-word";
import { capture } from "./capture";

const RUNS_DIR = path.join(process.cwd(), "studio", ".runs");
const OUT_DIR = path.join(process.cwd(), "out");

const SCENES: Record<string, Scene> = {
  "type-the-word": typeTheWord,
};

function die(msg: string): never {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

function stamp(): { date: string; run: string } {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  const run = `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  return { date, run };
}

function runDirFor(id: string): string {
  const dir = path.join(RUNS_DIR, id);
  if (!existsSync(dir)) die(`Run not found: ${id}\n  (expected ${dir})`);
  return dir;
}

async function cmdPlan(name: string, flags: Record<string, string>) {
  const tmpl = SCENES[name];
  if (!tmpl) die(`Unknown scene "${name}". Known: ${Object.keys(SCENES).join(", ")}`);

  const scene: Scene = SceneSchema.parse(JSON.parse(JSON.stringify(tmpl)));
  if (flags.baseUrl) scene.baseUrl = flags.baseUrl;

  const { date, run } = stamp();
  const id = `${date.replace(/-/g, "")}-${run}__${scene.id}`;
  const dir = path.join(RUNS_DIR, id);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "scene.json"), JSON.stringify(scene, null, 2));

  console.log(`\n✓ Planned  ${id}`);
  console.log(`  scene.json → studio/.runs/${id}/scene.json`);
  console.log(`  Edit it by hand, then:  npm run studio -- capture ${id}\n`);
}

async function cmdCapture(id: string) {
  const dir = runDirFor(id);
  console.log(`\n● Capturing ${id} … (a Chrome window will open — don't touch it)`);
  const manifest = await capture(dir);
  console.log(`\n✓ Captured ${manifest.frameCount} frames · ${Math.round(manifest.durationMs)}ms`);
  console.log(`  markers: ${JSON.stringify(manifest.markers)}`);
  console.log(`  frames → studio/.runs/${id}/frames/  (flip through: open that folder)`);
  console.log(`  next:  npm run studio -- preview ${id}   or   render ${id}\n`);
}

/**
 * The composition reads scene.json + capture.json itself from the public dir
 * (see Root.tsx), so `--public-dir` is the only thing to pass — no props to
 * thread and lose.
 */
function requireCaptured(dir: string): void {
  if (!existsSync(path.join(dir, "capture.json"))) die("No capture.json — run `capture` first.");
}

async function cmdPreview(id: string) {
  const dir = runDirFor(id);
  requireCaptured(dir);
  console.log(`\n● Opening Remotion Studio for ${id} …`);
  spawnSync(
    "npx",
    ["remotion", "studio", "studio/remotion/index.ts", `--public-dir=${dir}`],
    { stdio: "inherit" },
  );
}

async function cmdRender(id: string, flags: Record<string, string>) {
  const dir = runDirFor(id);
  requireCaptured(dir);
  await mkdir(OUT_DIR, { recursive: true });

  const scene: Scene = JSON.parse(await readFile(path.join(dir, "scene.json"), "utf8"));
  const base = flags.out ?? `${id.replace(/__/g, "__")}`;
  const outFile = path.join(OUT_DIR, `${base}.mp4`);

  console.log(`\n● Rendering ${id} → ${path.relative(process.cwd(), outFile)} …`);
  const res = spawnSync(
    "npx",
    [
      "remotion",
      "render",
      "studio/remotion/index.ts",
      "Demo",
      outFile,
      `--public-dir=${dir}`,
      "--codec=h264",
    ],
    { stdio: "inherit" },
  );
  if (res.status !== 0) die("Remotion render failed (see output above).");

  // Copy-paste posting sidecar.
  const md = [
    `# ${scene.title}`,
    `${scene.compose.endCard.cta} · 1080x1920`,
    ``,
    `## Caption`,
    scene.publish.caption,
    ``,
    `## Hashtags`,
    scene.publish.hashtags.join(" "),
    ``,
    `## Platforms`,
    scene.publish.platforms.join(" · "),
    ``,
    `## Provenance`,
    `run: ${id}`,
    ``,
  ].join("\n");
  await writeFile(path.join(OUT_DIR, `${base}.md`), md);
  console.log(`\n✓ Rendered  out/${base}.mp4`);
  console.log(`  caption + hashtags → out/${base}.md  (copy-paste to post)\n`);
}

async function main() {
  const [cmd, arg, ...rest] = process.argv.slice(2);
  const flags: Record<string, string> = {};
  for (const r of rest) {
    const m = r.match(/^--([^=]+)=(.*)$/);
    if (m) flags[m[1]] = m[2];
  }

  switch (cmd) {
    case "plan":
      if (!arg) die("Usage: studio plan <scene-name>");
      return cmdPlan(arg, flags);
    case "capture":
      if (!arg) die("Usage: studio capture <run-id>");
      return cmdCapture(arg);
    case "preview":
      if (!arg) die("Usage: studio preview <run-id>");
      return cmdPreview(arg);
    case "render":
      if (!arg) die("Usage: studio render <run-id>");
      return cmdRender(arg, flags);
    default:
      console.log(
        [
          "The Holy Beacon — Studio",
          "",
          "  plan <scene>     resolve a scene template → .runs/<id>/scene.json",
          "  capture <id>     drive the app, record frames → capture.json",
          "  preview <id>     open Remotion Studio to scrub + tune",
          "  render <id>      → out/<id>.mp4 + .md",
          "",
          `Scenes: ${Object.keys(SCENES).join(", ")}`,
          "",
        ].join("\n"),
      );
  }
}

main().catch((e) => die(e instanceof Error ? e.stack ?? e.message : String(e)));
