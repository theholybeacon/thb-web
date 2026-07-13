"use server";

import { SessionFull } from "../model/Session";
import { SessionRepository } from "../repository/SessionRepository";
import { requirePremiumUserSS } from "../../subscription/service/server/requirePremiumUserSS";

export async function sessionGetAllByOwnerId(_id: string): Promise<SessionFull[]> {
    // Owner is derived from the authenticated + premium user, not the caller-supplied id.
    const user = await requirePremiumUserSS();
    const sessionRepository = new SessionRepository();
    return await sessionRepository.getAllByOwnerId(user.id);
}



