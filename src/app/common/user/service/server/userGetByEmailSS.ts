'use server';

import { User } from "../../model/User";
import { UserRepository } from "../../repository/UserRepository";

export async function userGetByEmailSS(email: string): Promise<User | null> {
    const repository: UserRepository = new UserRepository();
    return await repository.getByEmail(email);
}
