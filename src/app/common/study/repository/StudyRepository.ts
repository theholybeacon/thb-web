import { Study, StudyFullWithBible, StudyInsert } from "../model/Study";
import { StudyPostgreSQLDao } from "../dao/StudyPostgreSQLDao";

export class StudyRepository {

    private studyPostgreSQLDao = new StudyPostgreSQLDao();

    async create(study: StudyInsert): Promise<Study> {
        return await this.studyPostgreSQLDao.create(study);
    }

    async getById(id: string): Promise<StudyFullWithBible | null> {
        return await this.studyPostgreSQLDao.getById(id);
    }

    async getByOwnerId(ownerId: string): Promise<StudyFullWithBible[]> {
        return await this.studyPostgreSQLDao.getByOwnerId(ownerId);
    }

    async update(id: string, data: Partial<Study>): Promise<Study> {
        return await this.studyPostgreSQLDao.update(id, data);
    }

    async delete(id: string): Promise<void> {
        return await this.studyPostgreSQLDao.delete(id);
    }

    async deleteSteps(studyId: string): Promise<void> {
        return await this.studyPostgreSQLDao.deleteSteps(studyId);
    }
}
