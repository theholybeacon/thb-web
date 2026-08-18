'use server';

import { Study } from "../../model/Study";
import { StudyRepository } from "../../repository/StudyRepository";
import { requireOwnedStudySS } from "./studyOwnership";

/**
 * The fields the edit form actually offers.
 *
 * Narrower than Partial<Study> because this is a public endpoint: a
 * caller-supplied patch object would otherwise let anyone set `isGlobal`,
 * `ownerId` or `slug` on their own study and push it into the shared catalog.
 */
export type StudyEditableFields = Pick<Study, "name" | "description" | "topic" | "length" | "depth">;

export async function studyUpdateSS(id: string, data: Partial<StudyEditableFields>): Promise<Study> {
    await requireOwnedStudySS(id);

    const repository = new StudyRepository();
    return await repository.update(id, {
        name: data.name,
        description: data.description,
        topic: data.topic,
        length: data.length,
        depth: data.depth,
    });
}
