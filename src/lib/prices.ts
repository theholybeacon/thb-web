/**
 * The premium price: its shape and how it is displayed.
 *
 * Four surfaces show this price (the landing card, /subscription, /gift and the
 * upgrade modal). They each used to carry their own copy of the type and the
 * formatter, and they disagreed: one substituted a hardcoded number when Stripe
 * failed, three rendered a dangling "Subscribe Now - ".
 *
 * The fetch lives in ./usePrices.
 */

export interface PriceData {
	id: string;
	amount: number | null;
	currency: string;
}

export interface PricesResponse {
	monthly: PriceData | null;
	yearly: PriceData | null;
}

/**
 * Formats a Stripe amount (minor units) for display. Returns null when there is
 * nothing to show, so callers must decide what to render instead of silently
 * interpolating an empty string into a label.
 *
 * `locale` must be the app's active locale from next-intl's useLocale(), not the
 * browser's: passing undefined here means an es reader on an en-US browser is
 * quoted in dollars for a price charged in euros.
 */
export function formatPrice(price: PriceData | null | undefined, locale: string): string | null {
	if (!price || price.amount === null) return null;

	// Round prices read better without trailing zeros, but never hide cents.
	const fractionDigits = price.amount % 100 === 0 ? 0 : 2;

	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: price.currency,
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(price.amount / 100);
}
