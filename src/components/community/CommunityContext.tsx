"use client";

import { createContext, useContext } from "react";

type CommunityContextValue = {
	isPremium: boolean;
	/** Returns true if the user may proceed; otherwise opens the upgrade modal and returns false. */
	requirePremium: () => boolean;
	/**
	 * Called after any write. The host decides how to refresh: the character page
	 * is server-rendered and re-runs the route, while the reader panel fetches its
	 * own data and re-runs its loader — `router.refresh()` would do nothing there.
	 */
	onChanged: () => void;
};

/**
 * Note the defaults: a community component rendered outside a provider silently
 * refuses every action. The provider is not optional.
 */
export const CommunityContext = createContext<CommunityContextValue>({
	isPremium: false,
	requirePremium: () => false,
	onChanged: () => {},
});

export const useCommunity = () => useContext(CommunityContext);
