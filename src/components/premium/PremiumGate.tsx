"use client";

import { ReactNode, useEffect } from "react";
import posthog from "posthog-js";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { UpgradeModal } from "./UpgradeModal";

interface PremiumGateProps {
	children: ReactNode;
	fallback?: ReactNode;
}

export function PremiumGate({ children, fallback }: PremiumGateProps) {
	const { isPremium, loading, user } = useLoggedUserContext();

	useEffect(() => {
		if (!loading && user && !isPremium) {
			posthog.capture("paywall_shown");
		}
	}, [loading, user, isPremium]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<div className="animate-pulse text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<div className="text-muted-foreground">Please sign in to access this content.</div>
			</div>
		);
	}

	if (!isPremium) {
		return fallback ?? <UpgradeModal />;
	}

	return <>{children}</>;
}
