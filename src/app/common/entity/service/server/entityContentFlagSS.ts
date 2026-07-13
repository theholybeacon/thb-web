"use server";

import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "../../../user/service/server/userGetByAuthIdSS";
import { EntityContentRepository } from "../../repository/EntityContentRepository";

/** Record a user report that a generated content section is inaccurate. Auth required. */
export async function entityContentFlagSS(
	entityContentId: string,
	section: string,
	reason?: string,
): Promise<{ ok: boolean }> {
	const { userId: authId } = await auth();
	if (!authId) return { ok: false };

	let user;
	try {
		user = await userGetByAuthIdSS(authId);
	} catch {
		return { ok: false };
	}
	if (!user) return { ok: false };

	await new EntityContentRepository().createFlag({
		entityContentId,
		userId: user.id,
		section,
		reason: reason ?? null,
	});
	return { ok: true };
}
