"use client";

import { ReactNode, useEffect } from "react";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { UpgradeModal } from "./UpgradeModal";

interface PremiumGateProps {
	children: ReactNode;
	fallback?: ReactNode;
}

export function PremiumGate({ children, fallback }: PremiumGateProps) {
	const t = useTranslations("premium");
	const { isPremium, loading, user } = useLoggedUserContext();

	useEffect(() => {
		if (!loading && user && !isPremium) {
			track("paywall_shown");
		}
	}, [loading, user, isPremium]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<div className="animate-pulse text-muted-foreground">{t("loading")}</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<div className="text-muted-foreground">{t("signInRequired")}</div>
			</div>
		);
	}

	if (!isPremium) {
		return fallback ?? <UpgradeModal />;
	}

	return <>{children}</>;
}
