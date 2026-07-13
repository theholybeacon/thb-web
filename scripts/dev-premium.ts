/**
 * Dev-only: force a user into any subscription state so premium-gated UI and
 * server gates can be exercised without running a real Stripe Checkout.
 *
 * Premium is derived, not stored: `isPremiumStatus` (src/lib/premium.ts) returns
 * true iff the user's single `subscription` row has status "active" or "trialing".
 * Seeding that row therefore satisfies both the client (LoggedUserContext) and the
 * server gate (requirePremiumUserSS) at once — no product code is bypassed.
 *
 * The user row is created lazily on first Clerk sign-in, so sign in once before
 * running this. Refuses to run against anything but the dev Neon branch.
 *
 * Run:  npx tsx scripts/dev-premium.ts <status|none> [email]
 *       npx tsx scripts/dev-premium.ts active
 *       npx tsx scripts/dev-premium.ts trialing        # also renders TrialBanner
 *       npx tsx scripts/dev-premium.ts none            # deletes the row
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

// The dev Neon branch. Guard runs before src/db is imported, since importing it
// evaluates neon(process.env.DATABASE_URL) at module load.
const DEV_DB_HOST = "ep-spring-silence";

if (!process.env.DATABASE_URL?.includes(DEV_DB_HOST)) {
	console.error(
		`Refusing to run: DATABASE_URL is not the dev Neon branch (${DEV_DB_HOST}).\n` +
			`This script writes fake Stripe ids and must never touch production.`
	);
	process.exit(1);
}

const STATUSES = [
	"active",
	"canceled",
	"past_due",
	"incomplete",
	"trialing",
	"unpaid",
] as const;

type Status = (typeof STATUSES)[number];

const DEFAULT_EMAIL = "andresfra92@gmail.com";

const [statusArg, emailArg] = process.argv.slice(2);
const email = emailArg ?? DEFAULT_EMAIL;

if (!statusArg || (statusArg !== "none" && !STATUSES.includes(statusArg as Status))) {
	console.error(
		`Usage: npx tsx scripts/dev-premium.ts <status|none> [email]\n` +
			`  status: ${STATUSES.join(", ")}\n` +
			`  none:   delete the subscription row\n` +
			`  email:  defaults to ${DEFAULT_EMAIL}`
	);
	process.exit(1);
}

async function main() {
	// Imported after the guard so a bad DATABASE_URL can't reach the DB client.
	const { UserRepository } = await import("../src/app/common/user/repository/UserRepository");
	const { SubscriptionRepository } = await import(
		"../src/app/common/subscription/repository/SubscriptionRepository"
	);

	const user = await new UserRepository().getByEmail(email);
	if (!user) {
		console.error(
			`No user row for ${email}. Sign in at https://theholybeacon.localhost once ` +
				`— the row is created lazily on first Clerk sign-in.`
		);
		process.exit(1);
	}

	const subscriptions = new SubscriptionRepository();

	if (statusArg === "none") {
		await subscriptions.deleteByUserId(user.id);
		console.log(`✓ Deleted subscription for ${email} — premium revoked.`);
		return;
	}

	const status = statusArg as Status;
	const now = new Date();
	const periodEnd = new Date(now);
	periodEnd.setFullYear(periodEnd.getFullYear() + 1);

	const row = await subscriptions.upsertByUserId({
		userId: user.id,
		stripeCustomerId: "cus_dev_local",
		stripeSubscriptionId: `sub_dev_${user.id}`,
		stripePriceId: "price_dev_local",
		status,
		billingInterval: "month",
		currentPeriodStart: now,
		currentPeriodEnd: periodEnd,
		cancelAtPeriodEnd: false,
	});

	// upsertByUserId's conflict clause doesn't touch canceledAt, so reconcile it
	// explicitly — otherwise a row flipped canceled -> active keeps a stale timestamp.
	await subscriptions.update(row.id, { canceledAt: status === "canceled" ? now : null });

	const premium = status === "active" || status === "trialing";
	console.log(
		`✓ ${email} → status="${status}" (premium: ${premium ? "yes" : "no"})\n` +
			`  Reload the app to pick it up.`
	);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
