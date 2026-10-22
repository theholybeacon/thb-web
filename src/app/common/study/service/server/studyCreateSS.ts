"use server";

import { StudyStepRepository } from "@/app/common/studyStep/repository/StudyStepRepository";
import { sanitizeStudySteps } from "@/app/common/studyStep/model/sanitizeSteps";
import { BibleRepository } from "@/app/common/bible/repository/BibleRepository";
import { requirePremiumUserSS } from "@/app/common/subscription/service/server/requirePremiumUserSS";
import { languageNameToIso } from "@/lib/bibleLanguage";
import { StudyFull, StudyInsertFull } from "../../model/Study";
import { StudyRepository } from "../../repository/StudyRepository";

/**
 * Saves a study a reader designed (today: generated from their topic).
 *
 * Who it belongs to and who created it are the signed-in reader, never what
 * the form sent: this is a public endpoint. Its language is the language of the
 * Bible it is read in, because that is the language the steps were written in.
 */
export async function studyCreateSS(input: StudyInsertFull): Promise<StudyFull> {
    const user = await requirePremiumUserSS();

    const studyRepository = new StudyRepository();
    const studyStepRepository = new StudyStepRepository();

    const bible = input.bibleId ? await new BibleRepository().getBasicById(input.bibleId) : undefined;
    if (!bible) {
        throw new Error("BIBLE_NOT_FOUND");
    }

    const steps = sanitizeStudySteps(input.steps);

    const returnedStudy: StudyFull = await studyRepository.create({
        name: input.name,
        description: input.description,
        topic: input.topic,
        depth: input.depth,
        length: input.length,
        bibleId: bible.id,
        // Stories a reader writes themselves are a later feature.
        kind: "plan",
        language: languageNameToIso(bible.language) ?? "en",
        ownerId: user.id,
        creatorId: user.id,
    }) as StudyFull;
    returnedStudy.steps = [];

    for (const step of steps) {
        step.studyId = returnedStudy.id;

        returnedStudy.steps.push(await studyStepRepository.create(step));
    }

    return returnedStudy;
}
