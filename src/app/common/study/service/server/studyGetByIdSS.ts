'use server';

import { StudyFullWithBible } from "../../model/Study";
import { StudyRepository } from "../../repository/StudyRepository";
import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";

export async function studyGetByIdSS(id: string): Promise<StudyFullWithBible | null> {
    const user = await requirePremiumUserSS();
    const repository = new StudyRepository();
    const study = await repository.getById(id);
    if (!study || study.ownerId !== user.id) {
        throw new Error("NOT_FOUND");
    }
    return study;
}
