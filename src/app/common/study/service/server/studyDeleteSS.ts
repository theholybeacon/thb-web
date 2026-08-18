'use server';

import { StudyRepository } from "../../repository/StudyRepository";
import { requireOwnedStudySS } from "./studyOwnership";

export async function studyDeleteSS(id: string): Promise<void> {
    await requireOwnedStudySS(id);

    const repository = new StudyRepository();
    await repository.delete(id);
}
