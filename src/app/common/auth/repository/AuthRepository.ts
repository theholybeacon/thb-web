import { FirebaseAuthDao } from "../dao/FirebaseAuthDao";
import { User as FirebaseUser } from "firebase/auth";

export class AuthRepository {

	dao: FirebaseAuthDao = new FirebaseAuthDao();


	async logIn(email: string, password: string): Promise<void> {
		await this.dao.logIn(email, password);
	}
	async signUp(email: string, password: string): Promise<string> {
		return await this.dao.signUp(email, password);
	}
	async logOut(): Promise<void> {
		await this.dao.logOut();
	}

	async sendVerificationEmail(): Promise<void> {
		await this.dao.sendVerificationEmail();
	}
	async changePassword(user: FirebaseUser, newPassword: string): Promise<void> {
		await this.dao.changePassword(user, newPassword);
	}
	async changeEmail(user: FirebaseUser, newEmail: string): Promise<void> {
		await this.dao.changeEmail(user, newEmail);
	}

}
