import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe, getStripe, STRIPE_PRODUCT_ID, getAppUrl } from "@/lib/stripe";
import { UserRepository } from "@/app/common/user/repository/UserRepository";

export async function POST(request: NextRequest) {
	try {
		const { userId: authId } = await auth();

		if (!authId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { priceId, billingInterval, isGift, giftRecipientEmail, membershipRequestId } = body;

		if (!priceId) {
			return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
		}

		// Validate price belongs to our product
		const stripeClient = getStripe();
		const price = await stripeClient.prices.retrieve(priceId);
		if (!price || price.product !== STRIPE_PRODUCT_ID) {
			return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
		}

		const validPriceId = priceId;

		const userRepository = new UserRepository();
		const user = await userRepository.getByAuthId(authId);

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Create or retrieve Stripe customer
		let stripeCustomerId = user.stripeCustomerId;
		if (!stripeCustomerId) {
			const customer = await stripe.customers.create({
				email: user.email,
				name: user.name,
				metadata: { userId: user.id, authId },
			});
			stripeCustomerId = customer.id;
			await userRepository.update({ ...user, stripeCustomerId });
		}

		const appUrl = getAppUrl();

		if (isGift) {
			// Gift purchase - one-time payment using price_data since recurring prices can't be used with mode: "payment"
			const giftAmount = price.unit_amount;
			if (!giftAmount) {
				return NextResponse.json({ error: "Invalid price amount" }, { status: 400 });
			}

			const session = await stripe.checkout.sessions.create({
				customer: stripeCustomerId,
				payment_method_types: ["card"],
				line_items: [
					{
						price_data: {
							currency: price.currency,
							product: STRIPE_PRODUCT_ID,
							unit_amount: giftAmount,
						},
						quantity: 1,
					},
				],
				mode: "payment",
				success_url: `${appUrl}/gift/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${appUrl}/gift?canceled=true`,
				metadata: {
					isGift: "true",
					gifterId: user.id,
					stripePriceId: validPriceId,
					billingInterval: price.recurring?.interval || "month",
					giftRecipientEmail: giftRecipientEmail || "",
					membershipRequestId: membershipRequestId || "",
				},
			});

			return NextResponse.json({ url: session.url });
		} else {
			// Regular subscription
			const session = await stripe.checkout.sessions.create({
				customer: stripeCustomerId,
				payment_method_types: ["card"],
				line_items: [
					{
						price: validPriceId,
						quantity: 1,
					},
				],
				mode: "subscription",
				success_url: `${appUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${appUrl}/subscription?canceled=true`,
				subscription_data: {
					metadata: {
						userId: user.id,
					},
				},
				metadata: {
					userId: user.id,
				},
			});

			return NextResponse.json({ url: session.url });
		}
	} catch (error) {
		console.error("Checkout error:", error);
		return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
	}
}
