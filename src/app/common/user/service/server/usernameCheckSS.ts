"use server";

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/app/utils/logger";
import { normalizeUsername, validateUsername } from "@/lib/username";
import { UserRepository } from "../../repository/UserRepository";
import { userGetByAuthIdSS } from "./userGetByAuthIdSS";

const log = logger.child({ module: "usernameCheckSS" });

export interface UsernameCheckResult {
	/** The handle as it will actually be stored — the caller should show this. */
	username: string;
	available: boolean;
	reason?: "invalid" | "tooShort" | "tooLong" | "taken";
}

/**
 * Availability of a handle in OUR table. Clerk owns uniqueness for the sign-up
 * itself; this exists so the user finds out before submitting, and so we never
 * hand Clerk a name that would then blow up the NOT NULL UNIQUE insert in
 * fetchOrCreateUser.
 *
 * Callable while signed out — it runs during sign-up, before a session exists.
 */
export async function usernameCheckSS(input: string): Promise<UsernameCheckResult> {
	log.trace("usernameCheckSS");

	const username = normalizeUsername(input);
	const invalid = validateUsername(username);
	if (invalid) {
		return { username, available: false, reason: invalid === "invalid" ? "invalid" : invalid };
	}

	const repository = new UserRepository();
	const existing = await repository.getByUsername(username);
	if (!existing) return { username, available: true };

	// The caller's own current handle is "available" to them, so re-saving an
	// unchanged profile form is not blocked by its own row.
	const { userId: authId } = await auth();
	if (authId) {
		try {
			const self = await userGetByAuthIdSS(authId);
			if (self?.id === existing.id) return { username, available: true };
		} catch {
			// No DB row yet (first sync). Fall through to "taken".
		}
	}

	return { username, available: false, reason: "taken" };
}
