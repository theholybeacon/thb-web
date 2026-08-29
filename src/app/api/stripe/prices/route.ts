import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { logger } from "@/app/utils/logger";

const log = logger.child({ module: "StripePrices" });

// Every sibling data route declares this. A price is live billing state; it must
// never be answered from a build-time snapshot.
export const dynamic = "force-dynamic";

/**
 * The monthly and yearly price of the premium product.
 *
 * Answers with a machine-readable `code` on failure, so a plain curl against
 * this endpoint names the cause. The whole pricing UI hangs off this one call:
 * when it fails opaquely, every surface either shows nothing or falls back to a
 * number nobody verified.
 */
export async function GET() {
	const productId = process.env.STRIPE_PRODUCT_ID;

	if (!productId || !process.env.STRIPE_SECRET_KEY) {
		log.error(
			{ hasProductId: Boolean(productId), hasSecretKey: Boolean(process.env.STRIPE_SECRET_KEY) },
			"Stripe billing is not configured"
		);
		return NextResponse.json({ error: "not_configured" }, { status: 500 });
	}

	try {
		// Inside the try on purpose: getStripe() throws when STRIPE_SECRET_KEY is
		// missing, and outside it that became a framework 500 with no JSON body —
		// a failure shape the client could not parse at all.
		const stripe = getStripe();

		// One query per interval, filtered by Stripe rather than by us. Listing
		// unfiltered returns Stripe's default page of 10, so on a product with
		// several currency variants the yearly price can fall off the page and
		// silently read as "no yearly price".
		const [monthlyPrices, yearlyPrices] = await Promise.all([
			stripe.prices.list({ product: productId, active: true, recurring: { interval: "month" }, limit: 1 }),
			stripe.prices.list({ product: productId, active: true, recurring: { interval: "year" }, limit: 1 }),
		]);

		const monthly = monthlyPrices.data[0];
		const yearly = yearlyPrices.data[0];

		if (!monthly && !yearly) {
			log.error({ productId }, "Stripe product has no active recurring prices");
			return NextResponse.json({ error: "no_active_prices" }, { status: 500 });
		}

		return NextResponse.json({
			monthly: monthly ? { id: monthly.id, amount: monthly.unit_amount, currency: monthly.currency } : null,
			yearly: yearly ? { id: yearly.id, amount: yearly.unit_amount, currency: yearly.currency } : null,
		});
	} catch (error) {
		// The message can name the product id, so it is logged and not returned.
		// The code is not sensitive and is what actually identifies the problem:
		// `resource_missing` means the key and the product id are from different
		// Stripe modes; `authentication_error` means the key itself is bad.
		if (error instanceof Stripe.errors.StripeError) {
			log.error(
				{ productId, type: error.type, code: error.code, statusCode: error.statusCode, message: error.message },
				"Stripe rejected the price lookup"
			);
			return NextResponse.json({ error: "stripe_error", code: error.code ?? error.type }, { status: 500 });
		}

		log.error({ productId, error }, "Failed to fetch prices");
		return NextResponse.json({ error: "unknown_error" }, { status: 500 });
	}
}
