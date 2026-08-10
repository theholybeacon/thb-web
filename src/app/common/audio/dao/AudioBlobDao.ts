import { put, del } from "@vercel/blob";
import { logger } from "@/app/utils/logger";

const log = logger.child({ module: "AudioBlobDao" });

export interface UploadedAudio {
	url: string;
	pathname: string;
	size: number;
}

/**
 * Audio file storage on Vercel Blob.
 *
 * Assets are immutable once generated (a chapter's narration never changes), so
 * they are cached for a year and served straight from the CDN — the app never
 * proxies the bytes.
 */
export class AudioBlobDao {
	async upload(pathname: string, mp3: Buffer): Promise<UploadedAudio> {
		const blob = await put(pathname, mp3, {
			access: "public",
			contentType: "audio/mpeg",
			cacheControlMaxAge: 60 * 60 * 24 * 365,
		});
		log.info({ pathname, size: mp3.length }, "uploaded audio asset");
		return { url: blob.url, pathname: blob.pathname, size: mp3.length };
	}

	async remove(url: string): Promise<void> {
		await del(url);
	}
}
