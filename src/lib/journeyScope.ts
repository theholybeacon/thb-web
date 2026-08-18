"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Which zoom level the journey is being viewed at: null is "All Bibles", a slug
 * is one translation.
 */
export type JourneyScopeValue = string | null;

const STORAGE_KEY = "journeyScope";

/**
 * Reads and writes the journey zoom level.
 *
 * The URL wins over the stored value, so a `?bible=` link opens at the level the
 * sender meant regardless of what the recipient last looked at — and so the
 * choice is shareable at all. The stored value is what carries the choice to the
 * surfaces with no URL of their own, like the home card.
 *
 * localStorage rather than a cookie: every consumer is a client component
 * fetching through React Query, so a cookie would buy nothing on the server and
 * cost an SSR/CSR mismatch. Reading it in an effect (not during render) is what
 * keeps the first paint identical on both sides.
 */
export function useJourneyScope(): {
	scope: JourneyScopeValue;
	setScope: (next: JourneyScopeValue) => void;
	/** False until localStorage has been consulted — hold queries so they don't run twice. */
	ready: boolean;
} {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const fromUrl = searchParams.get("bible");

	const [stored, setStored] = useState<JourneyScopeValue>(null);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		try {
			setStored(window.localStorage.getItem(STORAGE_KEY));
		} catch {
			// Private mode or a blocked origin — All Bibles is a fine default.
		}
		setReady(true);
	}, []);

	const setScope = useCallback(
		(next: JourneyScopeValue) => {
			setStored(next);
			try {
				if (next) window.localStorage.setItem(STORAGE_KEY, next);
				else window.localStorage.removeItem(STORAGE_KEY);
			} catch {
				// Non-fatal: the choice still applies for this render.
			}

			// Only rewrite the URL on pages that carry the param, so switching on the
			// home card doesn't push a query string onto an unrelated route.
			if (searchParams.has("bible") || pathname === "/journey") {
				const params = new URLSearchParams(searchParams.toString());
				if (next) params.set("bible", next);
				else params.delete("bible");
				const query = params.toString();
				router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
			}
		},
		[pathname, router, searchParams],
	);

	return { scope: fromUrl ?? stored, setScope, ready: ready || fromUrl !== null };
}
