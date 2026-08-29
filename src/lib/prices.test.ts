import { describe, expect, it } from "vitest";
import { formatPrice } from "./prices";

describe("formatPrice", () => {
	it("formats a Stripe amount in the app's locale, not the browser's", () => {
		const price = { id: "price_1", amount: 1000, currency: "eur" };
		// Intl separates the amount and the symbol with a non-breaking space in
		// es, so compare on normalized whitespace rather than the exact bytes.
		const normalized = (value: string | null) => value?.replace(/\s/g, " ");
		expect(normalized(formatPrice(price, "en-US"))).toBe("€10");
		expect(normalized(formatPrice(price, "es-ES"))).toBe("10 €");
	});

	it("drops trailing zeros on round amounts but never hides cents", () => {
		expect(formatPrice({ id: "p", amount: 10000, currency: "eur" }, "en-US")).toBe("€100");
		expect(formatPrice({ id: "p", amount: 1050, currency: "eur" }, "en-US")).toBe("€10.50");
	});

	it("returns null rather than an empty string when there is nothing to show", () => {
		// An empty string silently interpolated into "Subscribe Now - ${price}"
		// is exactly how a Stripe outage reached users as a dangling hyphen.
		expect(formatPrice(null, "en-US")).toBeNull();
		expect(formatPrice(undefined, "en-US")).toBeNull();
		expect(formatPrice({ id: "p", amount: null, currency: "eur" }, "en-US")).toBeNull();
	});
});
