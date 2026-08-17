/**
 * Grants or revokes the lifetime premium comp tier for a user, by email.
 *
 * Unlike `scripts/dev-premium.ts` — which fakes a Stripe subscription row and so
 * hard-refuses to run outside the dev Neon branch — this script is *meant* to be
 * run against production. It writes no Stripe data: lifetime is a flag on the
 * user row (`user.lifetimePremium`), read by `isPremiumUser` (src/lib/premium.ts)
 * alongside the subscription status, so a lifetime user needs no subscription,
 * no Stripe customer, and no billing at all.
 *
 * Because it can touch production, it prints the target database and the matched
 * user and then refuses to write unless you pass --yes.
 *
 * The user row is created lazily on first Clerk sign-in, so the person must have
 * signed in at least once before you can grant them anything.
 *
 * Run:  npx tsx scripts/grant-lifetime.ts <grant|revoke> <email> [--yes]
 *       npx tsx scripts/grant-lifetime.ts grant  someone@example.com
 *       npx tsx scripts/grant-lifetime.ts grant  someone@example.com --yes
 *       npx tsx scripts/grant-lifetime.ts revoke someone@example.com --yes
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

const USAGE =
	"Usage: npx tsx scripts/grant-lifetime.ts <grant|revoke> <email> [--yes]\n" +
	"  grant   give lifetime premium\n" +
	"  revoke  take it away\n" +
	"  --yes   actually write (without it this is a dry run)";

const args = process.argv.slice(2);
const confirmed = args.includes("--yes");
const [action, email] = args.filter((a) => a !== "--yes");

if ((action !== "grant" && action !== "revoke") || !email) {
	console.error(USAGE);
	process.exit(1);
}

if (!process.env.DATABASE_URL) {
	console.error("DATABASE_URL is not set — nothing to connect to.");
	process.exit(1);
}

/** Host only, so the connection string's credentials never reach the terminal. */
function describeDatabase(url: string): string {
	try {
		return new URL(url).host;
	} catch {
		return "<unparseable DATABASE_URL>";
	}
}

async function main() {
	// Imported after loadEnvConfig: importing src/db evaluates
	// neon(process.env.DATABASE_URL) at module load.
	const { UserRepository } = await import("../src/app/common/user/repository/UserRepository");

	const users = new UserRepository();
	const user = await users.getByEmail(email);

	if (!user) {
		console.error(
			`No user row for ${email}.\n` +
				`The row is created lazily on first Clerk sign-in — have them sign in once, then re-run.`
		);
		process.exit(1);
	}

	const enable = action === "grant";

	console.log(`Database: ${describeDatabase(process.env.DATABASE_URL!)}`);
	console.log(`User:     ${user.name} <${user.email}>  (id ${user.id})`);
	console.log(`Current:  lifetimePremium=${user.lifetimePremium}`);
	console.log(`Action:   ${action} lifetime premium\n`);

	if (user.lifetimePremium === enable) {
		console.log(`Nothing to do — already ${enable ? "granted" : "revoked"}.`);
		return;
	}

	if (!confirmed) {
		console.log("Dry run — no changes written. Re-run with --yes to apply.");
		return;
	}

	await users.setLifetimePremium(user.id, enable);

	console.log(
		enable
			? `✓ ${email} now has lifetime premium.\n` +
					`  They may need to sign out and back in (or hard-reload) — the client\n` +
					`  caches premium status in localStorage under "subscription".`
			: `✓ Lifetime premium revoked for ${email}.\n` +
					`  Any real Stripe subscription they have is untouched and still applies.`
	);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
