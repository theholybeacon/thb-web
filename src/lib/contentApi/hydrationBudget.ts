import { logger } from "@/app/utils/logger";

/**
 * Caps how many COLD chapters one API key may pull from api.bible per day.
 *
 * Why this exists: verse text is hydrated lazily. Reading a chapter nobody has
 * opened yet costs one upstream api.bible request, and that daily quota is
 * shared with live readers — scripts/warm-bible-text.ts caps its own runs at
 * 4,000 precisely to leave them headroom. An unbounded crawl by the marketing
 * pipeline would spend the quota and make real readers see "No content
 * available for this chapter".
 *
 * Chapters already stored are served unmetered; only a cold read spends budget.
 * When the budget is gone the endpoint degrades to stored-only and says so, and
 * bulk coverage is steered to `npm run warm:bible`, which is built for it.
 *
 * Same in-process caveat as the rate limiter: per-instance, best-effort.
 */

const log = logger.child({ module: "contentApi/hydrationBudget" });

type Budget = { day: string; spent: number };

const budgets = new Map<string, Budget>();

function dailyLimit(): number {
	const configured = Number(process.env.CONTENT_API_HYDRATION_BUDGET);
	return Number.isFinite(configured) && configured >= 0 ? configured : 200;
}

function utcDay(nowMs: number): string {
	return new Date(nowMs).toISOString().slice(0, 10);
}

/** True when this key may pay for one cold-chapter fetch right now. */
export function tryConsumeHydration(key: string, nowMs: number = Date.now()): boolean {
	const limit = dailyLimit();
	if (limit === 0) return false;

	const day = utcDay(nowMs);
	const budget = budgets.get(key);
	const current = budget && budget.day === day ? budget : { day, spent: 0 };

	if (current.spent >= limit) {
		budgets.set(key, current);
		log.warn({ key, limit }, "content API hydration budget exhausted; serving stored text only");
		return false;
	}

	current.spent += 1;
	budgets.set(key, current);
	log.info({ key, spent: current.spent, limit }, "content API hydrated a cold chapter");
	return true;
}

export function hydrationBudgetStatus(key: string, nowMs: number = Date.now()) {
	const limit = dailyLimit();
	const budget = budgets.get(key);
	const spent = budget && budget.day === utcDay(nowMs) ? budget.spent : 0;
	return { limit, spent, remaining: Math.max(0, limit - spent) };
}

/** Test seam. Never called at runtime. */
export function __resetHydrationBudgets(): void {
	budgets.clear();
}
