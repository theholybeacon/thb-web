/**
 * Offline audio, via the Cache API — no service worker needed.
 *
 * Because a chapter is ONE immutable file at ONE stable URL, "download for
 * offline" is just: put that URL in a cache, and prefer the cached copy when
 * loading. A page can read and write the Cache API directly.
 *
 * Only license-safe audio is ever offered for download (see src/lib/bibleLicense.ts) —
 * API.Bible's terms prohibit downloadable recordings of copyrighted translations.
 */

const CACHE_NAME = "thb-audio-v1";
const INDEX_KEY = "thb.audio.downloads";

function supported(): boolean {
	return typeof window !== "undefined" && "caches" in window;
}

function readIndex(): string[] {
	if (typeof window === "undefined") return [];
	try {
		return JSON.parse(window.localStorage.getItem(INDEX_KEY) ?? "[]");
	} catch {
		return [];
	}
}

function writeIndex(urls: string[]): void {
	window.localStorage.setItem(INDEX_KEY, JSON.stringify(urls));
}

/** Downloads and stores an audio file for offline playback. */
export async function cacheAudio(url: string): Promise<void> {
	if (!supported()) throw new Error("OFFLINE_UNSUPPORTED");
	const cache = await caches.open(CACHE_NAME);
	await cache.add(url);
	const index = readIndex();
	if (!index.includes(url)) writeIndex([...index, url]);
}

export async function removeCachedAudio(url: string): Promise<void> {
	if (!supported()) return;
	const cache = await caches.open(CACHE_NAME);
	await cache.delete(url);
	writeIndex(readIndex().filter((u) => u !== url));
}

export async function isAudioCached(url: string): Promise<boolean> {
	if (!supported()) return false;
	const cache = await caches.open(CACHE_NAME);
	return (await cache.match(url)) !== undefined;
}

/**
 * A playable object URL for a cached file, or null if it isn't downloaded.
 * Callers must revokeObjectURL when done — the player does this on track change.
 */
export async function getCachedAudioUrl(url: string): Promise<string | null> {
	if (!supported()) return null;
	try {
		const cache = await caches.open(CACHE_NAME);
		const hit = await cache.match(url);
		if (!hit) return null;
		return URL.createObjectURL(await hit.blob());
	} catch {
		return null;
	}
}

export function listDownloads(): string[] {
	return readIndex();
}

export async function clearDownloads(): Promise<void> {
	if (!supported()) return;
	await caches.delete(CACHE_NAME);
	writeIndex([]);
}

/** Bytes used / available, for a storage row in settings. */
export async function estimateUsage(): Promise<{ usageBytes: number; quotaBytes: number } | null> {
	if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;
	const { usage, quota } = await navigator.storage.estimate();
	return { usageBytes: usage ?? 0, quotaBytes: quota ?? 0 };
}
