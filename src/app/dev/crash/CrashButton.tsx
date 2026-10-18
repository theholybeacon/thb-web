"use client";

import { useEffect, useState } from "react";

export function CrashButton() {
  const [crashed, setCrashed] = useState(false);
  // Disabled until hydrated, so a click can't land before React handles it.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (crashed) throw new Error("Test crash while rendering in the browser");

  return (
    <button
      type="button"
      disabled={!ready}
      onClick={() => setCrashed(true)}
      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
    >
      Crash the page
    </button>
  );
}
