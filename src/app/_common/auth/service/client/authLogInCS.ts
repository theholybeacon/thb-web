import { AuthRepository } from "../../repository/AuthRepository";

export async function authLogInCS(email: string, password: string) {
	const authRepository = new AuthRepository();
	await authRepository.logIn(email, password);
}
