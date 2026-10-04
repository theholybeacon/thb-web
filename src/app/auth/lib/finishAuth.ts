import type { useSignIn } from "@clerk/nextjs";

// @clerk/shared is only a transitive dependency, so derive the type from the hook.
type SetActive = NonNullable<ReturnType<typeof useSignIn>["setActive"]>;

type Router = { replace: (href: string) => void };

const DEFAULT_DEST = "/home";

/**
 * Where to send the user once they are signed in. The middleware bounces
 * protected routes to /auth/login?redirect_url=<absolute url>, so honour that —
 * but only for our own origin, or it becomes an open redirect.
 *
 * Read from window.location at call time rather than useSearchParams(), which
 * would force a Suspense boundary around every auth page.
 */
export function safeRedirect(): string {
	if (typeof window === "undefined") return DEFAULT_DEST;
	const raw = new URLSearchParams(window.location.search).get("redirect_url");
	if (!raw) return DEFAULT_DEST;
	try {
		const url = new URL(raw, window.location.origin);
		if (url.origin !== window.location.origin) return DEFAULT_DEST;
		if (url.pathname.startsWith("/auth/")) return DEFAULT_DEST;
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return DEFAULT_DEST;
	}
}

/**
 * Activate a freshly created session and leave the auth page.
 *
 * Navigating via setActive's `navigate` (instead of router.push after it
 * resolves) lets Clerk move on only once the session cookie is in place, so the
 * middleware sees a signed-in request. The hard-navigation fallback guarantees
 * the user is never left staring at a finished form if the client transition
 * stalls for any reason.
 */
export async function activateAndGo(
	setActive: SetActive,
	sessionId: string | null,
	router: Router,
	dest: string = safeRedirect(),
): Promise<void> {
	const startPath = window.location.pathname;
	await setActive({
		session: sessionId,
		navigate: async () => {
			router.replace(dest);
		},
	});
	window.setTimeout(() => {
		if (window.location.pathname === startPath) window.location.assign(dest);
	}, 1500);
}
