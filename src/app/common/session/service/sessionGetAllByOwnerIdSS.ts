"use server";

import { SessionFull } from "../model/Session";
import { SessionRepository } from "../repository/SessionRepository";

export async function sessionGetAllByOwnerId(id: string): Promise<SessionFull[]> {
    const sessionRepository = new SessionRepository();
    return await sessionRepository.getAllByOwnerId(id);
}



