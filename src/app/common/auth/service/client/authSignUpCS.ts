import { AuthRepository } from "../../repository/AuthRepository";
import { User, UserInsert } from "@/app/common/user/model/User";
import { userCreateSS } from "@/app/common/user/service/server/userCreateSS";

export async function authSignUpCS(email: string, password: string, username: string, name: string): Promise<void> {


	const authRepository = new AuthRepository();


	const authId = await authRepository.signUp(email, password);

	const userToAdd: UserInsert = {
		authId: authId,
		username: username,
		email: email,
		isEmailVerified: false,
		name: name
	};

	userCreateSS(userToAdd);


	//This triggers rebuild on all the app with the full new user.
	await authRepository.logIn(email, password);

	await authRepository.sendVerificationEmail();


}
