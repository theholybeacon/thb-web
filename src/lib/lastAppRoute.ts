/**
 * Remembers the last in-app route so the public /bible tree can offer a
 * one-click way back to where the user actually was, rather than dumping
 * them on /home.
 *
 * sessionStorage (not localStorage) on purpose: "where I was just now" is a
 * per-tab, per-visit notion. A week-old pointer into a session the user has
 * long finished would be worse than the /home fallback.
 */

const KEY = "thb:lastAppRoute";

export type LastAppRoute = {
  path: string;
  /** Human label for the pill. Falls back to a section name when absent. */
  label?: string;
};

/** Route prefixes that count as "in the app" and are worth returning to. */
const APP_PREFIXES = [
  "/home",
  "/study",
  "/session",
  "/notes",
  "/journey",
  "/profile",
] as const;

/**
 * Deliberately excludes /bible (that is where we return *from*), /subscription
 * and /gift (mid-checkout flows), and the marketing and auth routes.
 */
export function isAppRoute(path: string): boolean {
  return APP_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function recordAppRoute(path: string, label?: string): void {
  if (!isAppRoute(path)) return;
  try {
    // A page that knows a better name for itself (a session knows its study
    // title) sets it from a child effect, which React runs *before* the
    // generic recorder in the shell above it. Without this the unlabelled
    // write would immediately clobber the good label.
    let next: LastAppRoute = { path, label };
    if (!label) {
      const existing = getLastAppRoute();
      if (existing?.path === path && existing.label) next = existing;
    }
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private-mode Safari throws on write. The pill just falls back to /home.
  }
}

export function getLastAppRoute(): LastAppRoute | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastAppRoute;
    // Guard against a stale or hand-edited value.
    if (!parsed?.path || !isAppRoute(parsed.path)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Maps a remembered path to the `nav.*` message key naming its section. */
export function sectionKeyForPath(path: string): string | null {
  if (path === "/home" || path.startsWith("/home/")) return "nav.home";
  if (path === "/study" || path.startsWith("/study/")) return "nav.studies";
  if (path === "/session" || path.startsWith("/session/")) return "nav.sessions";
  if (path === "/notes" || path.startsWith("/notes/")) return "nav.notes";
  if (path === "/journey" || path.startsWith("/journey/")) return "nav.journey";
  return null;
}
