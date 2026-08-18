/**
 * localStorage for the reader's own preferences — panel layout, text size.
 *
 * Both callers read on the client only and must survive storage being disabled
 * or holding something they didn't write, so every access is wrapped: a reader
 * with cookies off still gets a working reader, it just won't remember.
 */

export function readStored<T>(key: string, fallback: T): T {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = window.localStorage.getItem(key);
		return raw === null ? fallback : (JSON.parse(raw) as T);
	} catch {
		return fallback;
	}
}

export function writeStored(key: string, value: unknown): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {
		/* storage disabled — the preference still applies, it just won't persist */
	}
}
