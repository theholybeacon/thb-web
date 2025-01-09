import { AuthRepository } from "../../repository/AuthRepository";
import { auth } from "../../../../../../firebase.config";

export async function authChangePasswordCS(currentPassword: string, newPassword: string, email: string): Promise<void> {


	const authRepository = new AuthRepository();


	const uid = await authRepository.logIn(email, currentPassword);

	await authRepository.changePassword(auth.currentUser!, newPassword);

}
