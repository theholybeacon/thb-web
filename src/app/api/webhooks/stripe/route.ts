import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";
import { SubscriptionRepository } from "@/app/common/subscription/repository/SubscriptionRepository";
import { UserRepository } from "@/app/common/user/repository/UserRepository";
import { GiftSubscriptionRepository } from "@/app/common/giftSubscription/repository/GiftSubscriptionRepository";
import { MembershipRequestRepository } from "@/app/common/membershipRequest/repository/MembershipRequestRepository";
import { logger } from "@/app/utils/logger";
import { sendGiftReceivedEmail, sendSponsorshipFulfilledEmail } from "@/lib/email";
import { trackServerEvent } from "@/lib/posthog-server";

const log = logger.child({ module: "StripeWebhook" });

/*
 * PostHog events sent from here, the authoritative record of money changing
 * hands (the browser can't be trusted to report these, and often isn't open).
 * The distinct id is always the database user id, the same one the browser
 * identifies with:
 *   trial_started / subscription_activated  a subscription was created
 *   gift_purchased                          someone paid for a gift or a sponsorship (the gifter)
 *   subscription_cancel_scheduled           cancel at period end turned on in the billing portal
 *   subscription_cancel_reverted            ...and turned off again
 *   subscription_canceled                   the subscription ended
 *   payment_failed                          a renewal payment failed
 */

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
	const body = await request.text();
	const headersList = await headers();
	const signature = headersList.get("stripe-signature");

	if (!signature) {
		log.error("No stripe signature found");
		return NextResponse.json({ error: "No signature" }, { status: 400 });
	}

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
	} catch (err) {
		log.error({ error: err }, "Webhook signature verification failed");
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	}

	log.info({ type: event.type }, "Received webhook event");

	try {
		switch (event.type) {
			case "checkout.session.completed":
				await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
				break;
			case "customer.subscription.created":
				await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
				break;
			case "customer.subscription.updated":
				await handleSubscriptionUpdated(
					event.data.object as Stripe.Subscription,
					event.data.previous_attributes as Partial<Stripe.Subscription> | undefined
				);
				break;
			case "customer.subscription.deleted":
				await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
				break;
			case "invoice.payment_failed":
				await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
				break;
			default:
				log.info({ type: event.type }, "Unhandled event type");
		}
	} catch (error) {
		log.error({ error, type: event.type }, "Error processing webhook");
		return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
	}

	return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
	const userId = session.metadata?.userId;
	const giftRecipientEmail = session.metadata?.giftRecipientEmail;
	const membershipRequestId = session.metadata?.membershipRequestId;
	const isGift = session.metadata?.isGift === "true";

	log.info({ isGift, userId, membershipRequestId }, "handleCheckoutSessionCompleted");

	if (isGift) {
		await handleGiftCheckout(session, giftRecipientEmail, membershipRequestId);
	} else if (userId) {
		log.info({ userId }, "Regular subscription checkout");
	}
}

async function handleGiftCheckout(
	session: Stripe.Checkout.Session,
	recipientEmail: string | undefined,
	membershipRequestId: string | undefined
) {
	const gifterId = session.metadata?.gifterId;
	const stripePriceId = session.metadata?.stripePriceId;
	const billingInterval = session.metadata?.billingInterval;

	if (!gifterId || !stripePriceId || !billingInterval) {
		log.error({ gifterId, stripePriceId, billingInterval }, "Missing gift metadata");
		return;
	}

	const giftSubscriptionRepository = new GiftSubscriptionRepository();
	const userRepository = new UserRepository();

	const gifter = await userRepository.getById(gifterId);
	const gifterName = gifter?.name || "A generous member";

	const claimToken = crypto.randomUUID();

	const giftRecord = await giftSubscriptionRepository.create({
		gifterId,
		recipientEmail: recipientEmail || null,
		membershipRequestId: membershipRequestId || null,
		stripePaymentIntentId: session.payment_intent as string,
		stripePriceId,
		billingInterval,
		status: "pending",
		claimToken,
	});

	log.info({ giftRecordId: giftRecord.id }, "Gift subscription record created");

	if (membershipRequestId) {
		const membershipRequestRepository = new MembershipRequestRepository();
		const request = await membershipRequestRepository.getById(membershipRequestId);

		if (request) {
			await membershipRequestRepository.update(membershipRequestId, {
				fulfillerId: gifterId,
				status: "fulfilled",
				fulfilledAt: new Date(),
			});

			const requester = await userRepository.getById(request.requesterId);

			if (requester) {
				try {
					await createSubscriptionForUser(
						requester.id,
						stripePriceId,
						billingInterval,
						gifterId,
						giftRecord.id,
						membershipRequestId
					);
					log.info({ userId: requester.id }, "createSubscriptionForUser succeeded");
				} catch (subError) {
					log.error({ error: subError, userId: requester.id }, "createSubscriptionForUser failed");
				}

				await giftSubscriptionRepository.update(giftRecord.id, {
					recipientId: request.requesterId,
					status: "claimed",
					claimedAt: new Date(),
				});

				if (requester.email) {
					try {
						await sendSponsorshipFulfilledEmail({
							recipientEmail: requester.email,
							recipientName: requester.name || "Friend",
							sponsorName: gifterName,
							billingInterval,
						});
						log.info({ recipientEmail: requester.email }, "Sent sponsorship fulfilled email");
					} catch (emailError) {
						log.error(
							{ error: emailError, recipientEmail: requester.email },
							"Failed to send sponsorship fulfilled email"
						);
					}
				}
			}
		}
	} else if (recipientEmail) {
		try {
			await sendGiftReceivedEmail({
				recipientEmail,
				gifterName,
				billingInterval,
				claimToken,
			});
			log.info({ recipientEmail }, "Sent gift received email");
		} catch (emailError) {
			log.error({ error: emailError, recipientEmail }, "Failed to send gift received email");
		}
	}

	await trackServerEvent(gifterId, "gift_purchased", {
		billingInterval,
		recipient: membershipRequestId ? "queue" : recipientEmail ? "email" : "link",
	});

	log.info({ giftRecordId: giftRecord.id }, "handleGiftCheckout finished");
}

async function createSubscriptionForUser(
	userId: string,
	stripePriceId: string,
	billingInterval: string,
	gifterId?: string,
	giftSubscriptionId?: string,
	membershipRequestId?: string
) {
	const userRepository = new UserRepository();
	const subscriptionRepository = new SubscriptionRepository();

	const user = await userRepository.getById(userId);

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

	const stripeSubscription = await stripe.subscriptions.create({
		customer: stripeCustomerId,
		items: [{ price: stripePriceId }],
		collection_method: 'send_invoice',
		days_until_due: 0,
		metadata: {
			userId,
			gifterId: gifterId || "",
		},
	});

	const latestInvoice = stripeSubscription.latest_invoice;
	const invoiceId = typeof latestInvoice === "string" ? latestInvoice : latestInvoice?.id;
	if (invoiceId) {
		await stripe.invoices.pay(invoiceId, { paid_out_of_band: true });
		log.info({ invoiceId, subscriptionId: stripeSubscription.id }, "Marked gift subscription invoice as paid out-of-band");
	}

	const updatedSubscription = await stripe.subscriptions.retrieve(stripeSubscription.id);

	const periodStart = (updatedSubscription as unknown as { current_period_start: number }).current_period_start;
	const periodEnd = (updatedSubscription as unknown as { current_period_end: number }).current_period_end;

	await subscriptionRepository.upsertByUserId({
		userId,
		stripeCustomerId,
		stripeSubscriptionId: updatedSubscription.id,
		stripePriceId,
		status: mapStripeStatus(updatedSubscription.status),
		billingInterval: billingInterval as "month" | "year",
		currentPeriodStart: new Date(periodStart * 1000),
		currentPeriodEnd: new Date(periodEnd * 1000),
		cancelAtPeriodEnd: false,
		gifterId: gifterId || null,
		giftSubscriptionId: giftSubscriptionId || null,
		membershipRequestId: membershipRequestId || null,
	});

	log.info({ userId, stripeSubscriptionId: updatedSubscription.id, status: updatedSubscription.status }, "Upserted subscription for gifted user");
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
	log.info({ subscriptionId: subscription.id }, "Handling customer.subscription.created");

	const userId = subscription.metadata?.userId;
	if (!userId) {
		log.error("No userId in subscription metadata");
		return;
	}

	const subscriptionRepository = new SubscriptionRepository();

	const customerId =
		typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
	const priceId = subscription.items.data[0]?.price.id;
	const interval = subscription.items.data[0]?.price.recurring?.interval || "month";
	const subAny = subscription as unknown as { current_period_start: number; current_period_end: number };

	const gifterId = subscription.metadata?.gifterId || null;

	await subscriptionRepository.upsertByUserId({
		userId,
		stripeCustomerId: customerId,
		stripeSubscriptionId: subscription.id,
		stripePriceId: priceId,
		status: mapStripeStatus(subscription.status),
		billingInterval: interval as "month" | "year",
		currentPeriodStart: new Date(subAny.current_period_start * 1000),
		currentPeriodEnd: new Date(subAny.current_period_end * 1000),
		cancelAtPeriodEnd: subscription.cancel_at_period_end,
		gifterId: gifterId || null,
	});

	log.info({ userId, subscriptionId: subscription.id }, "Upserted subscription record");

	// Authoritative funnel event (server-side truth, not spoofable by the client).
	await trackServerEvent(userId, subscription.status === "trialing" ? "trial_started" : "subscription_activated", {
		status: subscription.status,
		billingInterval: interval,
		stripeSubscriptionId: subscription.id,
		gifted: Boolean(gifterId),
	});
}

async function handleSubscriptionUpdated(
	subscription: Stripe.Subscription,
	previous: Partial<Stripe.Subscription> | undefined
) {
	log.info({ subscriptionId: subscription.id }, "Handling customer.subscription.updated");

	const subscriptionRepository = new SubscriptionRepository();
	const interval = subscription.items.data[0]?.price.recurring?.interval || "month";
	const subAny = subscription as unknown as { current_period_start: number; current_period_end: number };

	await subscriptionRepository.updateByStripeSubscriptionId(subscription.id, {
		status: mapStripeStatus(subscription.status),
		stripePriceId: subscription.items.data[0]?.price.id,
		billingInterval: interval as "month" | "year",
		currentPeriodStart: new Date(subAny.current_period_start * 1000),
		currentPeriodEnd: new Date(subAny.current_period_end * 1000),
		cancelAtPeriodEnd: subscription.cancel_at_period_end,
		canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
	});

	log.info({ subscriptionId: subscription.id }, "Updated subscription record");

	// Only when this update flipped it, not on every renewal or status change.
	if (previous && "cancel_at_period_end" in previous) {
		const userId = await userIdForSubscription(subscription.id, subscription.metadata?.userId);
		if (userId) {
			await trackServerEvent(
				userId,
				subscription.cancel_at_period_end ? "subscription_cancel_scheduled" : "subscription_cancel_reverted",
				{ billingInterval: interval, stripeSubscriptionId: subscription.id }
			);
		}
	}
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
	log.info({ subscriptionId: subscription.id }, "Handling customer.subscription.deleted");

	const subscriptionRepository = new SubscriptionRepository();

	await subscriptionRepository.updateByStripeSubscriptionId(subscription.id, {
		status: "canceled",
		canceledAt: new Date(),
	});

	log.info({ subscriptionId: subscription.id }, "Marked subscription as canceled");

	const userId = await userIdForSubscription(subscription.id, subscription.metadata?.userId);
	if (userId) {
		await trackServerEvent(userId, "subscription_canceled", {
			stripeSubscriptionId: subscription.id,
			// Ended while still on the free trial, so it never became a paid one.
			duringTrial: Boolean(subscription.trial_end && subscription.ended_at && subscription.ended_at <= subscription.trial_end),
		});
	}
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
	log.info({ invoiceId: invoice.id }, "Handling invoice.payment_failed");

	const invoiceAny = invoice as unknown as { subscription: string | null };
	const subscriptionId = invoiceAny.subscription;
	if (!subscriptionId) return;

	const subscriptionRepository = new SubscriptionRepository();

	await subscriptionRepository.updateByStripeSubscriptionId(subscriptionId as string, {
		status: "past_due",
	});

	log.info({ subscriptionId }, "Marked subscription as past_due");

	const userId = await userIdForSubscription(subscriptionId);
	if (userId) {
		await trackServerEvent(userId, "payment_failed", {
			stripeSubscriptionId: subscriptionId,
			attemptCount: invoice.attempt_count,
		});
	}
}

/** The database user a Stripe subscription belongs to: from its metadata, else our record of it. */
async function userIdForSubscription(stripeSubscriptionId: string, metadataUserId?: string): Promise<string | null> {
	if (metadataUserId) return metadataUserId;
	const record = await new SubscriptionRepository().getByStripeSubscriptionId(stripeSubscriptionId);
	return record?.userId ?? null;
}

function mapStripeStatus(
	status: Stripe.Subscription.Status
): "active" | "canceled" | "past_due" | "incomplete" | "trialing" | "unpaid" {
	const statusMap: Record<
		Stripe.Subscription.Status,
		"active" | "canceled" | "past_due" | "incomplete" | "trialing" | "unpaid"
	> = {
		active: "active",
		canceled: "canceled",
		past_due: "past_due",
		incomplete: "incomplete",
		incomplete_expired: "incomplete",
		trialing: "trialing",
		unpaid: "unpaid",
		paused: "incomplete",
	};
	return statusMap[status] || "incomplete";
}
