import { list, put } from "@vercel/blob";
import { logger } from "@/app/utils/logger";

const log = logger.child({ module: "AlignmentBlobDao" });

const ROOT = "alignment";
/** Immutable once uploaded — a translation's alignment never changes. */
const CACHE_MAX_AGE = 60 * 60 * 24 * 365;

export function bookPathname(sourceCode: string, bookAbbreviation: string): string {
	return `${ROOT}/${sourceCode}/${bookAbbreviation}.jsonl`;
}

export function lexiconPathname(language: "greek" | "hebrew"): string {
	return `${ROOT}/lexicon/${language}.json`;
}

/**
 * Alignment corpora on Vercel Blob.
 *
 * Unlike AudioBlobDao these are uploaded with `addRandomSuffix: false`, which is
 * the whole point: pathnames must be *derivable* rather than remembered. Audio
 * can afford random URLs because `audio_asset.blobUrl` stores them, but if
 * alignment did the same then wiping the database would also destroy the only
 * record of where its backup lives. With deterministic pathnames the app can
 * rediscover every corpus through `list()` holding no database state at all,
 * which is what makes a full reset recoverable with no human involved.
 */
export class AlignmentBlobDao {

	async upload(pathname: string, body: string, contentType: string): Promise<string> {
		const blob = await put(pathname, body, {
			access: "public",
			contentType,
			// No `allowOverwrite`: that option arrived after @vercel/blob 0.26, which
			// is what this project pins. On 0.26 a put to an existing pathname simply
			// overwrites, so re-running the uploader is already idempotent. If the SDK
			// is ever upgraded, this call needs `allowOverwrite: true` or it will start
			// throwing on the second run.
			addRandomSuffix: false,
			cacheControlMaxAge: CACHE_MAX_AGE,
		});
		log.info({ pathname, bytes: body.length }, "uploaded alignment blob");
		return blob.url;
	}

	/** Public URL for a pathname, or null if it was never uploaded. */
	async resolveUrl(pathname: string): Promise<string | null> {
		const { blobs } = await list({ prefix: pathname, limit: 1 });
		const match = blobs.find((b) => b.pathname === pathname);
		return match?.url ?? null;
	}

	async fetchText(pathname: string): Promise<string | null> {
		const url = await this.resolveUrl(pathname);
		if (!url) {
			log.warn({ pathname }, "alignment blob not found");
			return null;
		}
		const res = await fetch(url);
		if (!res.ok) throw new Error(`ALIGNMENT_BLOB_FETCH_${res.status}`);
		return await res.text();
	}

	/** Which books of a source are available in Blob. Used by the upload audit. */
	async listBooks(sourceCode: string): Promise<string[]> {
		const { blobs } = await list({ prefix: `${ROOT}/${sourceCode}/`, limit: 1000 });
		return blobs
			.map((b) => b.pathname.split("/").pop() ?? "")
			.filter((n) => n.endsWith(".jsonl"))
			.map((n) => n.replace(/\.jsonl$/, ""))
			.sort();
	}
}
