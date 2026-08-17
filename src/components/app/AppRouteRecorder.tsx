"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordAppRoute } from "@/lib/lastAppRoute";

/**
 * Records the current route whenever it is an in-app one, so BackToAppButton
 * can offer a way back once the user wanders into the public /bible tree.
 *
 * Mounted from AppShell, which is now the chrome for both the (app) group and
 * signed-in /bible pages — recordAppRoute ignores anything outside the app.
 */
export function AppRouteRecorder() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) recordAppRoute(pathname);
  }, [pathname]);

  return null;
}
