import Stripe from "stripe";

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
	if (!_stripe) {
		if (!process.env.STRIPE_SECRET_KEY) {
			throw new Error("STRIPE_SECRET_KEY is not set");
		}
		_stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
			apiVersion: "2026-01-28.clover",
			typescript: true,
		});
	}
	return _stripe;
}

// For backward compatibility
export const stripe = {
	get customers() { return getStripe().customers; },
	get subscriptions() { return getStripe().subscriptions; },
	get checkout() { return getStripe().checkout; },
	get billingPortal() { return getStripe().billingPortal; },
	get webhooks() { return getStripe().webhooks; },
	get prices() { return getStripe().prices; },
	get invoices() { return getStripe().invoices; },
};

export const STRIPE_PRODUCT_ID = process.env.STRIPE_PRODUCT_ID!;

export function getAppUrl() {
	return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
