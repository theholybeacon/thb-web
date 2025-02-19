import OpenAI from 'openai';
import { StudyInsert, StudyInsertFull } from '../../study/model/Study';
import { StudyStepInsert } from '../../studyStep/model/StudyStep';
import { insertStudyStepSchema } from '@/db/schema/studyStep';
import { StudyStepFromAIDTO } from '../../studyStep/model/StudyStepFromAIDTO';
import { aiStudyStepAbbreviatonToIdParserSS } from '../service/server/aiStudyStepAbbreviatonToIdParserSS';

export class AIOpenAiDao {



	private client = new OpenAI();

	async studyStepsCreate(input: StudyInsert): Promise<StudyStepInsert[]> {


		var messagesToSend: any[] = [];

		messagesToSend.push({
			role: "system", content: `
				Create a comprehensiv  Bible study plan focused on the following attributes:
				- Topic: ${input.name}.
				- Description: ${input.description}
				- Depth: ${input.depth}. (1=shallow - 10=deep)
				- Length: ${input.length}. (1=5 minutes - 10=1year) 

				Structure:

				Format: JSON. NO EXTRA CHARACTERS, CLEAN JSON.I WILL USE ON API no trailing and leading characters that determine this is a json. ONLY the actual JSON.
				Fields for Each Step:
				-stepNumber: The number of the step
				-bibleAbbreviation: Abbreviation of the Bible version (e.g., NIV, ESV).
				-bookAbbreviation: Standard abbreviation of the Bible book THIS IS VERY IMPORTANT DONT  TYPE THE WHOLE NAME (e.g., Gen, Eph).
				Entire book if applicable.
				-chapterNumber:
				Single chapter (e.g., "16"),
				Range of chapters (e.g., "16-18"),
				Entire chapter if applicable.
				-verseNumber:
				Single verse (e.g., "16"),
				Range of verses (e.g., "16-18"),
				Set to null if studying an entire chapter, range of chapters, or full book.
				-stepType: Specifies the scope of the study step. It should be one of the following:
				--FullBook: Study the entire book.
				--ChapterRange: Study specific chapters within a book.
				--SingleChapter: Study a single chapter.
				--VerseRange: Study a range of verses within a chapter.
				--SingleVerse: Study a single verse.

				Title for the step.
				Explanation on what to focus on the step.

				VERY IMPORTANT: Only respond with the JSON. NO more text. I am using this for an api.

				Content Guidelines:

				Comprehensive Coverage: Ensure the study plan covers the topic from various perspectives within the Bible.
				Variety: Include a mix of different types (fullBook, chapterRange, singleChapter, verseRange, singleVerse) to provide depth and variety.
				Logical Organization: Arrange the steps in a sequence that builds understanding progressively.
				Additional Instructions:
				Consistency: Use a consistent Bible version abbreviation throughout (e.g., NIV).
				Standard Abbreviations: Follow standard abbreviations for all books.
				Null Values: When the Type is fullBook, chapterRange, or singleChapter, set VerseNumber to null.


				VERY IMPORTANT: Only use KJV protestant english bible version.
			` });



		const chatCompletion = await this.client.chat.completions.create({
			messages: messagesToSend,
			model: 'gpt-4o-mini',
		});



		const responseContent = chatCompletion.choices[0].message.content!;

		console.log(responseContent);

		let out: StudyStepInsert[] = [];

		try {
			const parsedData: StudyStepFromAIDTO[] = JSON.parse(responseContent);
			console.log(parsedData);

			for (let i = 0; i < parsedData.length; i++) {

				//TODO an orchestrator that gets the abbreviations from the api and turns it into actual ids.
				out.push(await aiStudyStepAbbreviatonToIdParserSS(parsedData[i]))

			}

		} catch (error) {
			console.error("Error parsing or validating the OpenAI response:", error);
			throw new Error("Invalid response format from OpenAI API.");
		}

		return out;
	}

}
