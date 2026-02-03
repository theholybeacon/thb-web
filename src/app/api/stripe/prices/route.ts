import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET() {
	const stripe = getStripe();
	const productId = process.env.STRIPE_PRODUCT_ID;

	if (!productId) {
		return NextResponse.json({ error: "Product not configured" }, { status: 500 });
	}

	try {
		const prices = await stripe.prices.list({
			product: productId,
			active: true,
		});

		const monthly = prices.data.find(p => p.recurring?.interval === "month");
		const yearly = prices.data.find(p => p.recurring?.interval === "year");

		return NextResponse.json({
			monthly: monthly ? { id: monthly.id, amount: monthly.unit_amount, currency: monthly.currency } : null,
			yearly: yearly ? { id: yearly.id, amount: yearly.unit_amount, currency: yearly.currency } : null,
		});
	} catch (error) {
		console.error("Error fetching prices:", error);
		return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
	}
}
