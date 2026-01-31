"use server";

import { StudyFullWithBible } from "../../model/Study";
import { StudyRepository } from "../../repository/StudyRepository";

export async function studyGetAllByOwnerIdSS(ownerId: string): Promise<StudyFullWithBible[]> {

    const studyRepository = new StudyRepository();

    return await studyRepository.getByOwnerId(ownerId);
}
