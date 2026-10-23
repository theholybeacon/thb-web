import OpenAI from 'openai';
import { StudyInsert } from '../../study/model/Study';
import { StudyStepInsert } from '../../studyStep/model/StudyStep';
import { StudyStepFromAIDTO } from '../../studyStep/model/StudyStepFromAIDTO';
import { aiStudyStepAbbreviatonToIdParserSS } from '../service/server/aiStudyStepAbbreviatonToIdParserSS';
import { BibleWithBooks } from '../../bible/model/Bible';

export class AIOpenAiDao {



	private client = new OpenAI();

	async studyStepsCreate(input: StudyInsert, bible: BibleWithBooks): Promise<StudyStepInsert[]> {


		var messagesToSend: any[] = [];

		messagesToSend.push({
			role: "system", content: `
				Create a comprehensive Bible study plan for the bible version "${bible.name}" (ID: ${bible.id}).

				CRITICAL - Book Abbreviations:
				${createBibleBookAdAbbreviationAIReadable(bible)}

				Study Plan Attributes:
				- Topic: ${input.name}
				- Description: ${input.description}
				- Depth: ${input.depth} (1=shallow - 10=deep)
				- Length: ${input.length} (1=5 minutes - 10=1 year)

				Response Format: Pure JSON array, no extra text or markdown.

				Write every title, explanation, body and prompt in the language of this Bible (${bible.language}).

				Step Kinds:
				- "scripture": a passage to read. Most steps are scripture steps.
				- "text": a short piece of background that helps the reader understand the passages
				  around it (historical setting, who someone is, how a passage connects to another).
				  Every claim must cite a verse, e.g. "(Genesis 12:1)". At most one text step per four
				  scripture steps, and never two text steps in a row.
				- "reflection": a single personal question about what was just read. Use one near the
				  end, and at most one per five steps.

				Fields for a "text" step: kind, stepNumber, title, explanation (one sentence), body
				(2-4 short paragraphs separated by a blank line, plain text, no markdown).
				Fields for a "reflection" step: kind, stepNumber, title, explanation (one sentence),
				prompt (the question).

				Required Fields for Each "scripture" Step (ALL fields are REQUIRED, never null):
				- kind: "scripture"
				- stepNumber: Sequential step number (integer)
				- bibleId: "${bible.id}"
				- bookAbbreviation: MUST be one of the exact abbreviations listed above (string)
				- chapterNumber: Single ("5") or range ("5-7") or null for full book
				- verseNumber: Single ("16") or range ("16-18") or null for full chapter/book
				- stepType: One of: FullBook, ChapterRange, SingleChapter, VerseRange, SingleVerse
				- title: A clear, engaging title for the step (string, REQUIRED)
				- explanation: A thoughtful, detailed explanation (string, REQUIRED, 2-4 sentences minimum)

				EXPLANATION GUIDELINES (VERY IMPORTANT):
				The explanation field must NEVER be null or empty. Each explanation should:
				- Provide spiritual wisdom and insight about the passage
				- Explain WHY this scripture is relevant to the study topic
				- Offer practical guidance on what to look for while reading
				- Share theological context or historical background when helpful
				- Connect the passage to the broader theme of the study
				- Be written in an encouraging, pastoral tone

				General Guidelines:
				- Use ONLY the abbreviations provided above (they are specific to this Bible version)
				- Cover the topic comprehensively from various biblical perspectives
				- Mix different step types for depth and variety
				- Arrange steps to build understanding progressively
				- Set verseNumber to null when stepType is FullBook, ChapterRange, or SingleChapter
				- The study must be mostly Scripture: text and reflection steps support the readings, they never replace them

				RESPOND ONLY WITH THE JSON ARRAY. NO OTHER TEXT.` });



		const chatCompletion = await this.client.chat.completions.create({
			messages: messagesToSend,
			model: 'gpt-4o-mini',
		});



		const responseContent = chatCompletion.choices[0].message.content!;

		let out: StudyStepInsert[] = [];

		try {
			const parsedData: StudyStepFromAIDTO[] = JSON.parse(responseContent);

			for (let i = 0; i < parsedData.length; i++) {
				out.push(await aiStudyStepAbbreviatonToIdParserSS(parsedData[i]))
			}

		} catch (error) {
			console.error("Error parsing or validating the OpenAI response:", error);
			throw new Error("Invalid response format from OpenAI API.");
		}

		return out;
	}

}
function createBibleBookAdAbbreviationAIReadable(bible: BibleWithBooks): string {
	const bookList = bible.books.map((b) => `${b.name}: "${b.abbreviation}"`).join(", ");
	return `You MUST use EXACTLY these book abbreviations (book name: abbreviation): ${bookList}`;
}
