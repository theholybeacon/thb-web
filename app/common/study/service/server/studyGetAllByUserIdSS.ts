"use server";

import { StudyFull } from "../../model/Study";
import { StudyRepository } from "../../repository/StudyRepository";

export async function studyGetAllByOwnerIdSS(ownerId: string): Promise<StudyFull[]> {

    const studyRepository = new StudyRepository();

    return await studyRepository.getByOwnerId(ownerId);
}


