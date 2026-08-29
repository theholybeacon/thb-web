"use client";

import { useCallback, useEffect, useState } from "react";
import { PricesResponse } from "./prices";

export type PricesStatus = "loading" | "ready" | "error";

/**
 * Loads the premium prices, distinguishing "not loaded yet" from "failed".
 *
 * The `response.ok` check is the load-bearing line: /api/stripe/prices answers a
 * failure with a JSON body, and storing that body as state made an outage look
 * like a successful fetch — which is how a broken Stripe config reached users as
 * a dead button labelled "Subscribe Now - " instead of an error.
 */
export function usePrices(): {
	prices: PricesResponse | null;
	status: PricesStatus;
	retry: () => void;
} {
	const [prices, setPrices] = useState<PricesResponse | null>(null);
	const [status, setStatus] = useState<PricesStatus>("loading");
	const [attempt, setAttempt] = useState(0);

	useEffect(() => {
		let cancelled = false;

		async function fetchPrices() {
			setStatus("loading");
			try {
				const response = await fetch("/api/stripe/prices");
				if (!response.ok) throw new Error(`prices responded ${response.status}`);

				const data: PricesResponse = await response.json();
				if (cancelled) return;

				// A 200 carrying no price is still a failure for every caller.
				if (!data.monthly && !data.yearly) throw new Error("prices response carried no price");

				setPrices(data);
				setStatus("ready");
			} catch (error) {
				if (cancelled) return;
				console.error("Error fetching prices:", error);
				setPrices(null);
				setStatus("error");
			}
		}

		fetchPrices();
		return () => {
			cancelled = true;
		};
	}, [attempt]);

	const retry = useCallback(() => setAttempt((n) => n + 1), []);

	return { prices, status, retry };
}
