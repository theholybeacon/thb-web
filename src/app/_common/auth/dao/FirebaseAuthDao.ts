import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut, updatePassword, User as FirebaseUser, updateEmail } from "firebase/auth";
import { auth } from '@/../firebase.config';

export class FirebaseAuthDao {

	async logIn(email: string, password: string): Promise<void> {
		await signInWithEmailAndPassword(auth, email, password);
	}
	async signUp(email: string, password: string): Promise<string> {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		return userCredential.user.uid;
	}
	async logOut(): Promise<void> {
		await signOut(auth);
	}

	async sendVerificationEmail(): Promise<void> {
		await sendEmailVerification(auth.currentUser!);
	}

	async changePassword(user: FirebaseUser, newPassword: string): Promise<void> {
		await updatePassword(user, newPassword);
	}

	async changeEmail(user: FirebaseUser, newEmail: string): Promise<void> {
		await updateEmail(user, newEmail);
	}
}
