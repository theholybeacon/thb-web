"use client";

import { createContext, useContext } from "react";

type CommunityContextValue = {
	isPremium: boolean;
	/** Returns true if the user may proceed; otherwise opens the upgrade modal and returns false. */
	requirePremium: () => boolean;
};

export const CommunityContext = createContext<CommunityContextValue>({
	isPremium: false,
	requirePremium: () => false,
});

export const useCommunity = () => useContext(CommunityContext);
