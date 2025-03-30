"use server";

import { Session, SessionInsert } from "../model/Session";
import { SessionRepository } from "../repository/SessionRepository";


export async function sessionCreateSS(session: SessionInsert): Promise<Session> {

    const sessionRepository = new SessionRepository();
    return await sessionRepository.create(session);
}



