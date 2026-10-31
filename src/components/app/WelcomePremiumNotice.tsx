"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { useLoggedUserContext, WELCOME_GRANT_KEY } from "@/app/state/LoggedUserContext";
import { toast } from "@/lib/toast";

const BUILDER_PATH = "/study/create";

/**
 * Tells the reader, once, that their sign-in just started the welcome week
 * (seven days of premium; see welcomePremiumClaimSS).
 *
 * A reader with nothing started yet (no study, no session) who lands on /home,
 * where every sign-in ends by default, is taken to the AI study builder
 * instead: the app's most important feature is what their first visit opens.
 * Anywhere else (a link they followed into a chapter, say) they stay put.
 *
 * Waits until the reader is in the app: a new account is created, and its
 * week granted, while still on the sign-up page or the public landing page.
 * A new reader goes through the /welcome questions first (see home/page.tsx),
 * which end in the builder themselves, so it also waits until they are past them.
 */
export function WelcomePremiumNotice() {
	const t = useTranslations("welcomePremium");
	const format = useFormatter();
	const { welcomeGrant, user, setState } = useLoggedUserContext();
	const router = useRouter();
	const pathname = usePathname();
	// Strict mode runs the effect twice before the state update lands.
	const shown = useRef(false);

	useEffect(() => {
		if (!welcomeGrant || !user || shown.current) return;
		// Explicit null, as on /home: not through /welcome yet.
		if (user.onboardedAt === null || !isAppPage(pathname)) return;
		shown.current = true;

		const toBuilder = welcomeGrant.firstSteps && pathname === "/home";
		const inBuilder = toBuilder || pathname === BUILDER_PATH;
		const endsAt = user.welcomePremiumEndsAt ? new Date(user.welcomePremiumEndsAt) : null;

		toast.success(t("toastTitle"), {
			description: inBuilder
				? t("toastNew")
				: t("toastReturning", { date: endsAt ? format.dateTime(endsAt, { month: "long", day: "numeric" }) : "" }),
			duration: 15_000,
			action: inBuilder ? undefined : { label: t("tryBuilder"), onClick: () => router.push(BUILDER_PATH) },
		});
		if (toBuilder) router.replace(BUILDER_PATH);
		localStorage.removeItem(WELCOME_GRANT_KEY);
		setState((prev) => ({ ...prev, welcomeGrant: null }));
	}, [welcomeGrant, user, pathname, router, setState, t, format]);

	return null;
}

/** Not the auth pages, the public landing page that sign-in starts from, nor the /welcome questions. */
function isAppPage(pathname: string): boolean {
	return pathname !== "/" && pathname !== "/welcome" && !pathname.startsWith("/auth") && !pathname.startsWith("/sso-callback");
}
