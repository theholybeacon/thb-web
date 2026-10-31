"use client";

import { useCallback, useSyncExternalStore } from "react";
import { setBibleFollowsLanguage } from "@/app/actions/locale";
import { BIBLE_FOLLOWS_LANGUAGE_COOKIE, bibleFollowsLanguage } from "@/lib/bibleFollowsLanguage";

/** Fired after the preference changes, so every reader of it re-renders. */
const CHANGED = "thb:bible-follows-language";

function read(): boolean {
  const entry = document.cookie.split("; ").find((c) => c.startsWith(`${BIBLE_FOLLOWS_LANGUAGE_COOKIE}=`));
  return bibleFollowsLanguage(entry?.split("=")[1]);
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGED, onChange);
  return () => window.removeEventListener(CHANGED, onChange);
}

/** Whether the Bible follows the app language (see src/lib/bibleFollowsLanguage.ts), and its setter. */
export function useBibleFollowsLanguage(): [boolean, (follows: boolean) => Promise<void>] {
  // The server renders the default; the cookie is read once hydrated.
  const follows = useSyncExternalStore(subscribe, read, () => true);

  const setFollows = useCallback(async (next: boolean) => {
    await setBibleFollowsLanguage(next);
    window.dispatchEvent(new Event(CHANGED));
  }, []);

  return [follows, setFollows];
}
