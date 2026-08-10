/**
 * Every selector in ONE place — the app has no data-testids, so these lean on
 * lucide icon classes (stable, i18n-independent) and structural classes. If a
 * UI refactor breaks capture, fix it here.
 */
export const SELECTORS: Record<string, string> = {
  // Reader mode switch (icons: Eye / Keyboard / Headphones).
  "mode.read": "button:has(svg.lucide-eye)",
  "mode.type": "button:has(svg.lucide-keyboard)",
  "mode.listen": "button:has(svg.lucide-headphones)",

  // TypeMode: the typing surface and its exact char-span container.
  "type.area": "div.cursor-text",
  "type.text": ".font-mono.text-lg",
  // Completion screen: the 3 stat tiles (accuracy / wpm / time).
  "type.complete": ".grid.grid-cols-3",
};

/** Resolve a scene `target` — a known key, or a raw Playwright selector as-is. */
export function resolveSelector(target: string): string {
  return SELECTORS[target] ?? target;
}
