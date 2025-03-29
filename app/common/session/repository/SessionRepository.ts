import { SessionPostgreSQLDao } from "../dao/SessionPostgreSQLDao";
import { Session, SessionFull, SessionInsert } from "../model/Session";

export class SessionRepository {

    private sessionPostgreSQLDao = new SessionPostgreSQLDao();

    async create(session: SessionInsert): Promise<Session> {
        return await this.sessionPostgreSQLDao.create(session);
    }

    async getById(id: string): Promise<SessionFull> {
        return await this.sessionPostgreSQLDao.getById(id);
    }

    async getAllByOwnerId(ownerId: string): Promise<SessionFull[]> {
        return await this.sessionPostgreSQLDao.getAllByOwnerId(ownerId);
    }
}
