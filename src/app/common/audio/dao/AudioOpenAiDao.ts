import OpenAI from "openai";
import { logger } from "@/app/utils/logger";
import { AudioVoice, narrationInstructions } from "../model/AudioAsset";

const log = logger.child({ module: "AudioOpenAiDao" });

/** gpt-4o-mini-tts rejects input longer than this. */
const MAX_INPUT_CHARS = 4096;

const MODEL = "gpt-4o-mini-tts";

export interface SynthesizeInput {
	text: string;
	voice: AudioVoice;
	language?: string | null;
}

/**
 * Narration via OpenAI TTS.
 *
 * Two constraints of `gpt-4o-mini-tts` shape everything downstream:
 *  1. `input` is capped at 4096 chars — a long chapter (Psalm 119 is ~20k) cannot
 *     be one request. So we always synthesize one verse at a time.
 *  2. It returns NO timestamps. Per-verse clips are how we recover exact verse
 *     offsets at all (by frame-counting each clip — see src/lib/mp3.ts).
 *
 * It also ignores `speed`; playback rate is applied client-side via
 * `audio.playbackRate`, which is instant and needs no re-synthesis.
 */
export class AudioOpenAiDao {
	private client = new OpenAI();

	/** One MP3 clip (24 kHz mono). Retries on 429/5xx with exponential backoff. */
	async synthesize(input: SynthesizeInput, attempt = 0): Promise<Buffer> {
		const text = input.text.trim();
		if (!text) throw new Error("synthesize: empty text");
		if (text.length > MAX_INPUT_CHARS) {
			throw new Error(`synthesize: input ${text.length} chars exceeds ${MAX_INPUT_CHARS}`);
		}

		try {
			const res = await this.client.audio.speech.create({
				model: MODEL,
				voice: input.voice,
				input: text,
				response_format: "mp3",
				instructions: narrationInstructions(input.language),
			});
			return Buffer.from(await res.arrayBuffer());
		} catch (err) {
			const status = (err as { status?: number }).status;
			const retryable = status === 429 || (status !== undefined && status >= 500);
			if (retryable && attempt < 4) {
				const backoffMs = 2 ** attempt * 500;
				log.warn({ status, attempt, backoffMs }, "TTS request failed, retrying");
				await new Promise((r) => setTimeout(r, backoffMs));
				return this.synthesize(input, attempt + 1);
			}
			throw err;
		}
	}

	/**
	 * Synthesizes many texts with bounded concurrency, preserving order.
	 *
	 * Order matters absolutely: the clips are concatenated in this order and their
	 * durations become the verse offsets. One misordered clip corrupts every offset
	 * after it.
	 */
	async synthesizeMany(inputs: SynthesizeInput[], concurrency = 5): Promise<Buffer[]> {
		const results: Buffer[] = new Array(inputs.length);
		let cursor = 0;

		const worker = async () => {
			while (cursor < inputs.length) {
				const index = cursor++;
				results[index] = await this.synthesize(inputs[index]);
			}
		};

		await Promise.all(Array.from({ length: Math.min(concurrency, inputs.length) }, worker));
		return results;
	}

	static readonly MODEL = MODEL;
	static readonly MAX_INPUT_CHARS = MAX_INPUT_CHARS;
}
