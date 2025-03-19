"use server";

import { SessionFull } from "../model/Session";
import { SessionRepository } from "../repository/SessionRepository";

export async function sessionGetByIdSS(id: string): Promise<SessionFull> {
    const sessionRepository = new SessionRepository();
    return await sessionRepository.getById(id);
}



