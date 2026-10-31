"use server";

import { auth } from "@clerk/nextjs/server";
import { User } from "../../../user/model/User";
import { UserRepository } from "../../../user/repository/UserRepository";
import { SubscriptionRepository } from "../../repository/SubscriptionRepository";
import { isWelcomePremiumClaimable, WELCOME_PREMIUM_DAYS } from "@/lib/premium";
import { logger } from "@/app/utils/logger";

const log = logger.child({ module: "welcomePremiumClaimSS" });

export type WelcomePremiumClaim =
	| { granted: false }
	| {
			granted: true;
			/** The user row with the week on it, for the client state. */
			user: User;
			/** No study or session yet: the reader is starting from nothing. */
			firstSteps: boolean;
	  };

/**
 * Starts the signed-in reader's welcome week (seven days of premium) if they
 * have never had it and are not premium otherwise. Called on every sign-in by
 * LoggedUserContext; it grants at most once per reader, so new readers get it
 * on their first sign-in and readers who were already free on their next one.
 *
 * Reads the reader from the session, never from an argument: this hands out
 * premium, so a caller must not be able to name someone else.
 */
export async function welcomePremiumClaimSS(): Promise<WelcomePremiumClaim> {
	const { userId: authId } = await auth();
	if (!authId) return { granted: false };

	const users = new UserRepository();
	let user: User;
	try {
		user = await users.getByAuthId(authId);
	} catch {
		return { granted: false };
	}

	const subscription = await new SubscriptionRepository().getByUserId(user.id);
	const claimable = isWelcomePremiumClaimable({
		status: subscription?.status,
		lifetimePremium: user.lifetimePremium,
		welcomePremiumEndsAt: user.welcomePremiumEndsAt,
	});
	if (!claimable) return { granted: false };

	const endsAt = new Date(Date.now() + WELCOME_PREMIUM_DAYS * 24 * 60 * 60 * 1000);
	const claimed = await users.claimWelcomePremium(user.id, endsAt);
	// Another tab claimed it a moment earlier: that tab tells the reader.
	if (!claimed) return { granted: false };

	const firstSteps = !(await users.hasStudyOrSession(user.id));
	log.info({ userId: user.id, endsAt, firstSteps }, "Welcome premium week started");
	return { granted: true, user: claimed, firstSteps };
}
