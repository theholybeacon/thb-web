import { config } from "dotenv";
import { clerkSetup } from "@clerk/testing/playwright";

/**
 * Signed-in tests sign in through Clerk's testing tokens, which need the dev
 * instance's keys (the worktree env file has them). Without them the
 * signed-out tests still run; the signed-in ones fail at sign-in and say why.
 */
export default async function globalSetup() {
	config({ path: ".env.local" });
	const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
	if (!publishableKey || !process.env.CLERK_SECRET_KEY) return;
	// Never against production: clerkSetup refuses live keys too, this says so first.
	if (process.env.CLERK_SECRET_KEY.startsWith("sk_live_")) return;
	await clerkSetup({ publishableKey });
}
