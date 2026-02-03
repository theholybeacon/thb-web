import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { GiftSubscriptionRepository } from "@/app/common/giftSubscription/repository/GiftSubscriptionRepository";
import { SubscriptionRepository } from "@/app/common/subscription/repository/SubscriptionRepository";
import { UserRepository } from "@/app/common/user/repository/UserRepository";
import { sendGiftClaimedEmail } from "@/lib/email";
import { logger } from "@/app/utils/logger";

const log = logger.child({ module: "GiftClaim" });

export async function POST(request: NextRequest) {
	try {
		const { userId: authId } = await auth();
		if (!authId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { claimToken } = await request.json();
		if (!claimToken) {
			return NextResponse.json({ error: "Missing claim token" }, { status: 400 });
		}

		const giftSubscriptionRepository = new GiftSubscriptionRepository();
		const userRepository = new UserRepository();
		const subscriptionRepository = new SubscriptionRepository();

		// Get user by auth ID
		const user = await userRepository.getByAuthId(authId);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Get gift subscription
		const gift = await giftSubscriptionRepository.getByClaimToken(claimToken);
		if (!gift) {
			return NextResponse.json({ error: "Gift not found" }, { status: 404 });
		}

		if (gift.status !== "pending") {
			return NextResponse.json({ error: "Gift already claimed or expired" }, { status: 400 });
		}

		// Check if user already has an active subscription
		const existingSubscription = await subscriptionRepository.getByUserId(user.id);
		if (existingSubscription && existingSubscription.status === "active") {
			return NextResponse.json({ error: "User already has an active subscription" }, { status: 400 });
		}

		// Create or get Stripe customer
		let stripeCustomerId = user.stripeCustomerId;
		if (!stripeCustomerId) {
			const customer = await stripe.customers.create({
				email: user.email,
				name: user.name,
				metadata: { userId: user.id },
			});
			stripeCustomerId = customer.id;
			await userRepository.update({ ...user, stripeCustomerId });
		}

		// Create subscription in Stripe
		const stripeSubscription = await stripe.subscriptions.create({
			customer: stripeCustomerId,
			items: [{ price: gift.stripePriceId }],
			metadata: {
				userId: user.id,
				gifterId: gift.gifterId,
				giftSubscriptionId: gift.id,
			},
		});

		// Create subscription record
		const subAny = stripeSubscription as unknown as { current_period_start: number; current_period_end: number };
		await subscriptionRepository.create({
			userId: user.id,
			stripeCustomerId,
			stripeSubscriptionId: stripeSubscription.id,
			stripePriceId: gift.stripePriceId,
			status: "active",
			billingInterval: gift.billingInterval as "month" | "year",
			currentPeriodStart: new Date(subAny.current_period_start * 1000),
			currentPeriodEnd: new Date(subAny.current_period_end * 1000),
			cancelAtPeriodEnd: false,
		});

		// Update gift subscription as claimed
		await giftSubscriptionRepository.update(gift.id, {
			recipientId: user.id,
			stripeSubscriptionId: stripeSubscription.id,
			status: "claimed",
			claimedAt: new Date(),
		});

		// Get gifter info for email
		const gifter = await userRepository.getById(gift.gifterId);
		const gifterName = gifter?.name || "A generous member";

		// Send confirmation email
		if (user.email) {
			await sendGiftClaimedEmail({
				recipientEmail: user.email,
				recipientName: user.name || "Friend",
				gifterName,
				billingInterval: gift.billingInterval,
			});
			log.info({ recipientEmail: user.email }, "Sent gift claimed email");
		}

		log.info({ userId: user.id, giftId: gift.id }, "Gift claimed successfully");

		return NextResponse.json({ success: true });
	} catch (error) {
		log.error({ error }, "Error claiming gift");
		return NextResponse.json({ error: "Failed to claim gift" }, { status: 500 });
	}
}
