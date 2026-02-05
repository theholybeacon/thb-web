import { SessionPostgreSQLDao } from "../dao/SessionPostgreSQLDao";
import { Session, SessionFull, SessionInsert } from "../model/Session";

export class SessionRepository {

    private sessionPostgreSQLDao = new SessionPostgreSQLDao();

    async create(session: SessionInsert): Promise<Session> {
        return await this.sessionPostgreSQLDao.create(session);
    }

    async getById(id: string): Promise<SessionFull | null> {
        return await this.sessionPostgreSQLDao.getById(id);
    }

    async getAllByOwnerId(ownerId: string): Promise<SessionFull[]> {
        return await this.sessionPostgreSQLDao.getAllByOwnerId(ownerId);
    }

    async updateCurrentStep(sessionId: string, stepId: string): Promise<void> {
        return await this.sessionPostgreSQLDao.updateCurrentStep(sessionId, stepId);
    }

    async updateProgress(
        sessionId: string,
        bookAbbreviation: string | null,
        chapter: number | null,
        verse: number | null
    ): Promise<void> {
        return await this.sessionPostgreSQLDao.updateProgress(sessionId, bookAbbreviation, chapter, verse);
    }

    async delete(id: string): Promise<void> {
        return await this.sessionPostgreSQLDao.delete(id);
    }

    async deleteByStudyId(studyId: string): Promise<void> {
        return await this.sessionPostgreSQLDao.deleteByStudyId(studyId);
    }
}
