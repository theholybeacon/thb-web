import { AuthRepository } from "../../repository/AuthRepository";
import { auth } from "../../../../../firebase.config";
import { userUpdateSS } from "../../../user/service/server/userUpdateSS";
import { userGetByAuthIdSS } from "../../../user/service/server/userGetByAuthIdSS";

export async function authChangeEmailCS(email: string): Promise<void> {

	const authRepository = new AuthRepository();

	auth.currentUser?.getIdToken(true);
	await authRepository.changeEmail(auth.currentUser!, email);

	let userToUpdate = await userGetByAuthIdSS(auth.currentUser?.uid!);

	userToUpdate.email = email;

	await userUpdateSS(userToUpdate);
}
