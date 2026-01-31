'use server';

import { Study } from "../../model/Study";
import { StudyRepository } from "../../repository/StudyRepository";

export async function studyUpdateSS(id: string, data: Partial<Study>): Promise<Study> {
    const repository = new StudyRepository();
    return await repository.update(id, data);
}
