// The lighthouse mark, inlined for Satori.
//
// Satori resolves an <img src> by fetching it, and a serverless render has no
// reliable way to reach our own /images/logo.png — a cold invocation may be up
// before the deployment's static assets are, and a self-fetch costs a round trip
// on every share. So the bytes are read from disk and handed over as a data URI,
// the same trade already made for the fonts in ./fonts.ts.
//
// The committed copy is public/images/logo.png cropped to its artwork (the
// original is 1024x1024 with a wide transparent margin) and downscaled to 256px:
// it is never drawn larger than ~104px, and a 370 KB source would be re-encoded
// to base64 on every render.
//
// Requires the NODE runtime, and next.config.ts `outputFileTracingIncludes` must
// ship ./src/lib/og/*.png into any function that renders it.
import { readFile } from "node:fs/promises";
import path from "node:path";

const file = path.join(process.cwd(), "src/lib/og", "logo.png");

// Module-level so the read and the base64 encode happen once per lambda, not
// once per image.
let cached: Promise<string> | null = null;

export function ogLogo(): Promise<string> {
	cached ??= readFile(file).then((buf) => `data:image/png;base64,${buf.toString("base64")}`);
	return cached;
}
