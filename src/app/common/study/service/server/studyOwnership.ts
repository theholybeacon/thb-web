import { StudyFullWithBible } from "../../model/Study";
import { StudyRepository } from "../../repository/StudyRepository";
import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";

/**
 * Resolves a study the caller is actually allowed to change.
 *
 * Not a "use server" module on purpose: it is a guard the mutating actions call,
 * not an endpoint of its own.
 *
 * Server actions are public endpoints — anyone can post to them with any id —
 * so update/delete/regenerate need the same ownership check that
 * studyGetByIdSS and the regenerate-steps route already make. That matters more
 * now that the study table also holds the shared global catalog, whose rows are
 * owned by nobody: without this, one call could delete the plan for every user.
 */
export async function requireOwnedStudySS(studyId: string): Promise<StudyFullWithBible> {
	const user = await requirePremiumUserSS();

	const repository = new StudyRepository();
	const study = await repository.getById(studyId);

	// A global study has ownerId null, so it fails this the same way another
	// user's study does.
	if (!study || study.ownerId !== user.id) {
		throw new Error("NOT_FOUND");
	}
	return study;
}
