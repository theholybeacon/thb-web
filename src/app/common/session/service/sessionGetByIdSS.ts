"use server";

import { SessionFull } from "../model/Session";
import { SessionRepository } from "../repository/SessionRepository";
import { requirePremiumUserSS } from "../../subscription/service/server/requirePremiumUserSS";

export async function sessionGetByIdSS(id: string): Promise<SessionFull | null> {
    const user = await requirePremiumUserSS();
    const sessionRepository = new SessionRepository();
    const session = await sessionRepository.getById(id);
    if (!session || session.userId !== user.id) {
        throw new Error("NOT_FOUND");
    }
    return session;
}



