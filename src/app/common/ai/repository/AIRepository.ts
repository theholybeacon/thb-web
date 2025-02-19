import { StudyInsert, StudyInsertFull } from "../../study/model/Study";
import { StudyStepInsert } from "../../studyStep/model/StudyStep";
import { AIOpenAiDao } from "../dao/AIOpenAiDao";

export class AIRepository {

	private dao: AIOpenAiDao = new AIOpenAiDao();

	async studyStepsCreate(input: StudyInsert): Promise<StudyStepInsert[]> {
		return this.dao.studyStepsCreate(input);
	}
}
