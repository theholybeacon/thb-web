"use server";

import { logger } from "@/app/utils/logger";
import { UserRepository } from "../../repository/UserRepository";
import { User } from "../../model/User";

const log = logger.child({ module: "userUpdateProfileSS" });

export interface UpdateProfileParams {
	userId: string;
	name?: string;
	username?: string;
	profilePicture?: string;
	country?: string;
}

export async function userUpdateProfileSS(params: UpdateProfileParams): Promise<User> {
	log.trace("userUpdateProfileSS");

	const repository = new UserRepository();

	return await repository.updateProfile(params.userId, {
		name: params.name,
		username: params.username,
		profilePicture: params.profilePicture,
		country: params.country,
	});
}
