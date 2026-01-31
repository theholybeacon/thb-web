'use server';

import { StudyFullWithBible } from "../../model/Study";
import { StudyRepository } from "../../repository/StudyRepository";

export async function studyGetByIdSS(id: string): Promise<StudyFullWithBible | null> {
    const repository = new StudyRepository();
    return await repository.getById(id);
}
