
import { Study, StudyFull, StudyInsert } from "../model/Study";
import { StudyPostgreSQLDao } from "../dao/StudyPostgreSQLDao";

export class StudyRepository {

    private studyPostgreSQLDao = new StudyPostgreSQLDao();

    async create(study: StudyInsert): Promise<Study> {
        return await this.studyPostgreSQLDao.create(study);
    }

    async getByOwnerId(ownerId: string): Promise<StudyFull[]> {
        return await this.studyPostgreSQLDao.getByOwnerId(ownerId);
    }
}
