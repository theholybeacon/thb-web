
import { StudyStepPostgreSQLDao } from "../dao/StudyStepPostgreSQLDao";
import { StudyStep, StudyStepInsert } from "../model/StudyStep";

export class StudyStepRepository {

    private studyStepPostgreSQLDao = new StudyStepPostgreSQLDao();

    async create(studyStep: StudyStepInsert): Promise<StudyStep> {
        return await this.studyStepPostgreSQLDao.create(studyStep);
    }

}
