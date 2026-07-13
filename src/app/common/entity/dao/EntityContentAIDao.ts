import OpenAI from "openai";
import { entityContentAISchema, EntityContentAIDTO, EntityContentGenerationInput } from "../model/EntityContent";

/**
 * Generates structured, cited character content with gpt-4o-mini. Grounded on
 * the person's name, aliases, and canonical reference list; instructed to cite
 * ONLY from those references (the service filters citations afterward as a
 * hard guarantee). Returns a validated DTO; throws on malformed output.
 */
export class EntityContentAIDao {
	private client = new OpenAI();

	async generate(input: EntityContentGenerationInput): Promise<EntityContentAIDTO> {
		const referenceList = input.references.length
			? input.references.join(", ")
			: "(no references available)";

		const system = `You are a careful, neutral Bible reference editor writing factual encyclopedia content about a biblical person. Write in a neutral, scholarly-consensus tone — no devotional or denominational interpretation, no speculation beyond what Scripture and mainstream scholarship support.

PERSON: ${input.name}
ALSO CALLED: ${input.aliases.length ? input.aliases.join(", ") : "(none)"}

AVAILABLE SCRIPTURE REFERENCES (you may cite ONLY these, copied verbatim):
${referenceList}

Respond with a SINGLE JSON object, no markdown, no extra text, with this exact shape:
{
  "overview": { "text": string, "refs": string[] },
  "significance": { "text": string, "refs": string[] },
  "timeline": [ { "title": string, "description": string, "refs": string[] } ],
  "relationships": [ { "name": string, "relation": string, "refs": string[] } ]
}

RULES:
- "overview": 2-4 sentences on who this person was.
- "significance": 1-3 sentences on why they matter biblically/historically.
- "timeline": key life events in chronological (narrative) order; concise title + one-sentence description each. Omit if genuinely unknown.
- "relationships": notable family members and close associates; "relation" is a short label (e.g. "father", "wife", "brother", "disciple").
- Every "refs" array must contain ONLY strings copied EXACTLY from the AVAILABLE SCRIPTURE REFERENCES above. If you cannot support a claim with one of those references, leave its refs array empty. Never invent a reference.
- If a section is genuinely unknown, return an empty string or empty array for it.
- Output ONLY the JSON object.`;

		const chat = await this.client.chat.completions.create({
			model: "gpt-4o-mini",
			temperature: 0.4,
			max_tokens: 2500,
			response_format: { type: "json_object" },
			messages: [{ role: "system", content: system }],
		});

		const raw = chat.choices[0]?.message?.content ?? "{}";
		return entityContentAISchema.parse(JSON.parse(raw));
	}
}
