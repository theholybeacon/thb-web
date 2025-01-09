"use server";

import { User, UserInsert } from "../../model/User";
import { UserRepository } from "../../repository/UserRepository";

export async function userCreateSS(c: UserInsert): Promise<User> {

	const repository: UserRepository = new UserRepository();
	const createdUser = await repository.create(c);
	return createdUser;

}

