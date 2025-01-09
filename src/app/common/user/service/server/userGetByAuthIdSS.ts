"use server";

import { User } from "../../model/User";
import { UserRepository } from "../../repository/UserRepository";

export async function userGetByAuthIdSS(authId: string): Promise<User> {

	const repository: UserRepository = new UserRepository();
	return await repository.getByAuthId(authId);
}

