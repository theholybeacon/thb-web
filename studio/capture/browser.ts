import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Scene } from "../schema";

/**
 * Launch real Google Chrome (channel: "chrome") HEADLESS. Headless is what makes
 * the capture correct: the rendering surface equals the viewport exactly
 * (360x640 @ DSF 3 = 1080x1920 portrait), so there's no OS window chrome or
 * dead space. Headed mode captures the whole desktop window instead — a small
 * viewport ends up as a narrow column on a big black frame. channel:"chrome"
 * (not bundled Chromium) keeps real MP3/font/GPU behavior for later audio scenes.
 *
 * Returns `css` so capture can (re)apply it after every navigation.
 */
export async function launch(scene: Scene): Promise<{
  browser: Browser;
  context: BrowserContext;
  page: Page;
  css: string;
}> {
  const css = readFileSync(path.join(process.cwd(), scene.capture.css), "utf8");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--hide-scrollbars", "--force-color-profile=srgb", "--autoplay-policy=no-user-gesture-required"],
  });

  const context = await browser.newContext({
    viewport: { width: scene.capture.viewport.width, height: scene.capture.viewport.height },
    deviceScaleFactor: scene.capture.deviceScaleFactor,
    colorScheme: "dark",
    reducedMotion: "no-preference",
    ignoreHTTPSErrors: true,
  });

  // Init scripts must be registered BEFORE the page is created so they run on
  // its first navigation. Pin dark theme + English locale + inject demo.css.
  await context.addInitScript(() => {
    try {
      localStorage.setItem("theme", "dark");
    } catch {}
  });
  await context.addInitScript((cssText: string) => {
    const apply = () => {
      const style = document.createElement("style");
      style.setAttribute("data-studio", "");
      style.textContent = cssText;
      document.head?.appendChild(style);
    };
    if (document.head) apply();
    else document.addEventListener("DOMContentLoaded", apply);
  }, css);

  await context.addCookies([{ name: "locale", value: "en", url: scene.baseUrl }]);

  // Never send capture traffic to analytics.
  await context.route(
    /(posthog|vercel-insights|vitals\.vercel|va\.vercel-scripts|google-analytics)/,
    (r) => r.abort(),
  );

  const page = await context.newPage();
  return { browser, context, page, css };
}
