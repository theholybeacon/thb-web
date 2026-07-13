"use server";

import { StudyFullWithBible } from "../../model/Study";
import { StudyRepository } from "../../repository/StudyRepository";
import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";

export async function studyGetAllByOwnerIdSS(_ownerId: string): Promise<StudyFullWithBible[]> {
    // Owner is derived from the authenticated + premium user, not the caller-supplied id.
    const user = await requirePremiumUserSS();

    const studyRepository = new StudyRepository();

    return await studyRepository.getByOwnerId(user.id);
}
