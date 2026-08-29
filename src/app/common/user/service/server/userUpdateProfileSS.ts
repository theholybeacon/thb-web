"use server";

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/app/utils/logger";
import { normalizeUsername, validateUsername } from "@/lib/username";
import { UserRepository } from "../../repository/UserRepository";
import { User } from "../../model/User";
import { userGetByAuthIdSS } from "./userGetByAuthIdSS";

const log = logger.child({ module: "userUpdateProfileSS" });

export interface UpdateProfileParams {
	name?: string;
	username?: string;
	profilePicture?: string;
	country?: string;
}

export type UpdateProfileResult =
	| { ok: true; user: User }
	| { ok: false; error: "auth" | "invalid" | "taken" };

/**
 * Saves the profile form.
 *
 * The row is resolved from the session, never from a client-supplied id: this
 * action is callable by anyone, so trusting a passed-in userId would let one
 * account rewrite another's profile.
 *
 * The handle is normalized and uniqueness-checked here because it is the key of
 * the public /u/[username] page and is NOT NULL UNIQUE — a raw write would fail
 * at the constraint with no usable error for the form.
 */
export async function userUpdateProfileSS(params: UpdateProfileParams): Promise<UpdateProfileResult> {
	log.trace("userUpdateProfileSS");

	const { userId: authId } = await auth();
	if (!authId) return { ok: false, error: "auth" };

	let user;
	try {
		user = await userGetByAuthIdSS(authId);
	} catch {
		return { ok: false, error: "auth" };
	}
	if (!user) return { ok: false, error: "auth" };

	const repository = new UserRepository();

	let username: string | undefined;
	if (params.username !== undefined) {
		username = normalizeUsername(params.username);
		if (validateUsername(username)) return { ok: false, error: "invalid" };

		if (username !== user.username) {
			const existing = await repository.getByUsername(username);
			if (existing && existing.id !== user.id) return { ok: false, error: "taken" };
		}
	}

	const updated = await repository.updateProfile(user.id, {
		name: params.name,
		username,
		profilePicture: params.profilePicture,
		country: params.country,
	});

	return { ok: true, user: updated };
}
