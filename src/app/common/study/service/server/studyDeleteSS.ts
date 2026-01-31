'use server';

import { StudyRepository } from "../../repository/StudyRepository";

export async function studyDeleteSS(id: string): Promise<void> {
    const repository = new StudyRepository();
    await repository.delete(id);
}
