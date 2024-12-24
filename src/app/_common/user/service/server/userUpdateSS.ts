"use server";
import { User } from "../../model/User";
import { UserRepository } from "../../repository/UserRepository";

export async function userUpdateSS(c: User): Promise<void> {

	const repository: UserRepository = new UserRepository();

	return await repository.update(c);

}

