import { auth } from "@clerk/nextjs/server";
import { User } from "@/app/common/user/model/User";
import { userGetByAuthIdSS } from "@/app/common/user/service/server/userGetByAuthIdSS";

/**
 * The signed-in user, if they may use the admin panel; throws "NOT_FOUND"
 * otherwise, so the panel answers like a page that does not exist.
 *
 * Not a "use server" module on purpose: it is the guard every admin page and
 * action calls, not an endpoint of its own. `isAdmin` is only ever read here:
 * it is set by hand in the database, and nothing in the codebase writes it.
 */
export async function requireAdminSS(): Promise<User> {
	const { userId: authId } = await auth();
	if (!authId) throw new Error("NOT_FOUND");

	let user: User | null = null;
	try {
		user = await userGetByAuthIdSS(authId);
	} catch {
		throw new Error("NOT_FOUND");
	}
	if (!user?.isAdmin) throw new Error("NOT_FOUND");
	return user;
}
