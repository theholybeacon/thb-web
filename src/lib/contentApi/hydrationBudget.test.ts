import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { __resetHydrationBudgets, hydrationBudgetStatus, tryConsumeHydration } from "./hydrationBudget";

const ORIGINAL = process.env.CONTENT_API_HYDRATION_BUDGET;
const DAY_ONE = Date.UTC(2026, 7, 24, 12, 0, 0);
const DAY_TWO = Date.UTC(2026, 7, 25, 12, 0, 0);

beforeEach(() => {
	__resetHydrationBudgets();
	process.env.CONTENT_API_HYDRATION_BUDGET = "3";
});
afterEach(() => {
	if (ORIGINAL === undefined) delete process.env.CONTENT_API_HYDRATION_BUDGET;
	else process.env.CONTENT_API_HYDRATION_BUDGET = ORIGINAL;
});

describe("tryConsumeHydration", () => {
	it("allows up to the daily cap, then stops", () => {
		for (let i = 0; i < 3; i++) {
			expect(tryConsumeHydration("marketing", DAY_ONE)).toBe(true);
		}
		// Past this point the endpoint degrades to stored-only rather than
		// spending the api.bible quota live readers depend on.
		expect(tryConsumeHydration("marketing", DAY_ONE)).toBe(false);
		expect(hydrationBudgetStatus("marketing", DAY_ONE)).toEqual({
			limit: 3,
			spent: 3,
			remaining: 0,
		});
	});

	it("resets on a new UTC day", () => {
		for (let i = 0; i < 3; i++) tryConsumeHydration("marketing", DAY_ONE);
		expect(tryConsumeHydration("marketing", DAY_ONE)).toBe(false);
		expect(tryConsumeHydration("marketing", DAY_TWO)).toBe(true);
		expect(hydrationBudgetStatus("marketing", DAY_TWO).spent).toBe(1);
	});

	it("budgets each consumer separately", () => {
		for (let i = 0; i < 3; i++) tryConsumeHydration("marketing", DAY_ONE);
		expect(tryConsumeHydration("marketing", DAY_ONE)).toBe(false);
		expect(tryConsumeHydration("localdev", DAY_ONE)).toBe(true);
	});

	it("forbids on-demand hydration entirely when set to 0", () => {
		process.env.CONTENT_API_HYDRATION_BUDGET = "0";
		expect(tryConsumeHydration("marketing", DAY_ONE)).toBe(false);
	});

	it("falls back to the default when misconfigured", () => {
		process.env.CONTENT_API_HYDRATION_BUDGET = "nonsense";
		expect(hydrationBudgetStatus("marketing", DAY_ONE).limit).toBe(200);
	});
});
