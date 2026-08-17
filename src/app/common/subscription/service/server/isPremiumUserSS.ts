"use server";

import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "../../../user/service/server/userGetByAuthIdSS";
import { subscriptionGetByUserIdSS } from "./subscriptionGetByUserIdSS";
import { isPremiumUser } from "@/lib/premium";

/**
 * Non-throwing premium check for surfaces that render for everyone (e.g. the
 * public Bible reader). Returns false for anonymous users or on any lookup miss.
 * The throwing variant `requirePremiumUserSS` is for gated data access.
 */
export async function isPremiumUserSS(): Promise<boolean> {
	try {
		const { userId: authId } = await auth();
		if (!authId) return false;
		const user = await userGetByAuthIdSS(authId);
		if (!user) return false;
		const subscription = await subscriptionGetByUserIdSS(user.id);
		return isPremiumUser({ status: subscription?.status, lifetimePremium: user.lifetimePremium });
	} catch {
		return false;
	}
}
