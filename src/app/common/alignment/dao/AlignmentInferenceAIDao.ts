import OpenAI from "openai";
import { logger } from "@/app/utils/logger";
import { normalizeStrongs } from "@/lib/strongs";
import type { AlignedOriginal } from "../model/Alignment";

const log = logger.child({ module: "AlignmentInferenceAIDao" });

/**
 * gpt-4o rather than gpt-4o-mini. Measured against French editorial ground
 * truth: 4o answered 100% of the answerable cases correctly (38/38, 95% overall
 * against a 95% data ceiling), mini 97% (93% overall). Each answer is computed
 * once and cached forever, so the better model costs a one-off few hundredths of
 * a cent per word and removes a class of wrong answers a reader cannot detect.
 */
const MODEL = "gpt-4o";

export interface InferenceInput {
	/** Language name for the prompt, e.g. "Spanish". */
	languageName: string;
	verseText: string;
	/** The same verse in English, which grounds the mapping. */
	englishText: string;
	word: string;
	occurrence: number;
	candidates: AlignedOriginal[];
}

/**
 * Picks which original-language word a translated word renders.
 *
 * The model never translates and never invents a Strong's number: it chooses an
 * index from the verse's verified Greek/Hebrew inventory. That constraint is
 * what makes this usable at all — an unconstrained lookup would hallucinate
 * plausible-looking numbers that a reader has no way to check.
 */
export class AlignmentInferenceAIDao {

	private client = new OpenAI();

	async infer(input: InferenceInput): Promise<{ strongs: string | null; model: string }> {
		const { languageName, verseText, englishText, word, occurrence, candidates } = input;
		if (candidates.length === 0) return { strongs: null, model: MODEL };

		const list = candidates
			.map((c, i) => `${i}. ${c.strongs} ${c.lemma ?? ""} (${c.translit ?? ""}) — English "${c.surface ?? ""}" — ${c.shortDefinition ?? ""}`)
			.join("\n");

		const completion = await this.client.chat.completions.create({
			model: MODEL,
			temperature: 0,
			response_format: { type: "json_object" },
			messages: [
				{
					role: "system",
					content:
						"You align one word of a translated Bible verse to the original Greek/Hebrew word it renders. " +
						"Choose ONLY from the numbered candidates — they are the verified original-language words of " +
						"this very verse. Use null if the word renders none of them (an added article, for example). " +
						'Respond with json: {"index": <candidate number or null>}.',
				},
				{
					role: "user",
					// The English parallel matters: it grounds an inflected Romance form
					// against the candidate glosses, which are themselves English.
					content:
						`${languageName} verse: ${verseText}\n` +
						`Same verse in English: ${englishText}\n\n` +
						`Highlighted ${languageName} word: "${word}" (occurrence ${occurrence} in this verse)\n\n` +
						`Candidates:\n${list}\n\nReturn json.`,
				},
			],
		});

		const raw = completion.choices[0]?.message?.content ?? "{}";
		let index: unknown;
		try {
			index = (JSON.parse(raw) as { index?: unknown }).index;
		} catch {
			log.warn({ raw: raw.slice(0, 120) }, "inference returned unparseable json");
			return { strongs: null, model: MODEL };
		}

		if (typeof index !== "number" || !Number.isInteger(index)) return { strongs: null, model: MODEL };
		const picked = candidates[index];
		// Re-normalise rather than trusting the echoed value — the id must match
		// what strongs_entry is keyed on or the gloss join silently misses.
		return { strongs: picked ? normalizeStrongs(picked.strongs) : null, model: MODEL };
	}
}
