import { AuthRepository } from "../../repository/AuthRepository";

export async function authLogOutCS() {
	const authRepository = new AuthRepository();
	await authRepository.logOut();
}
