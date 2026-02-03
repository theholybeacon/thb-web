"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app";
import { Gift, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { giftSubscriptionGetByClaimTokenSS } from "@/app/common/giftSubscription/service/server/giftSubscriptionGetByClaimTokenSS";

export default function ClaimGiftPage({ params }: { params: Promise<{ token: string }> }) {
	const { token } = use(params);
	const t = useTranslations("gift");
	const router = useRouter();
	const { user, loading: userLoading, reload } = useLoggedUserContext();
	const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "claimed" | "error">("loading");
	const [isClaiming, setIsClaiming] = useState(false);

	useEffect(() => {
		async function checkGift() {
			try {
				const gift = await giftSubscriptionGetByClaimTokenSS(token);
				if (!gift) {
					setStatus("invalid");
				} else if (gift.status === "claimed") {
					setStatus("claimed");
				} else if (gift.status === "pending") {
					setStatus("valid");
				} else {
					setStatus("invalid");
				}
			} catch (error) {
				console.error("Error checking gift:", error);
				setStatus("error");
			}
		}

		if (token) {
			checkGift();
		}
	}, [token]);

	const handleClaim = async () => {
		if (!user) {
			// Redirect to sign in
			router.push("/sign-in?redirect=/gift/claim/" + token);
			return;
		}

		setIsClaiming(true);
		try {
			// Call the claim API which creates the subscription and sends email
			const response = await fetch("/api/stripe/gift/claim", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ claimToken: token }),
			});

			if (!response.ok) {
				const data = await response.json();
				console.error("Error claiming gift:", data.error);
				setStatus("error");
				return;
			}

			// Reload user context to get updated subscription status
			await reload();

			setStatus("claimed");
			router.push("/subscription/success");
		} catch (error) {
			console.error("Error claiming gift:", error);
			setStatus("error");
		} finally {
			setIsClaiming(false);
		}
	};

	if (userLoading || status === "loading") {
		return (
			<AppShell>
				<div className="flex h-full items-center justify-center py-20">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			</AppShell>
		);
	}

	if (status === "invalid" || status === "error") {
		return (
			<AppShell>
				<div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
					<div className="text-center max-w-md">
						<div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
							<XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
						</div>
						<h1 className="text-2xl font-bold mb-3">{t("invalidGift")}</h1>
						<p className="text-muted-foreground mb-6">{t("invalidGiftDescription")}</p>
						<Link href="/home">
							<Button variant="outline">{t("backToHome")}</Button>
						</Link>
					</div>
				</div>
			</AppShell>
		);
	}

	if (status === "claimed") {
		return (
			<AppShell>
				<div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
					<div className="text-center max-w-md">
						<div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
							<CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
						</div>
						<h1 className="text-2xl font-bold mb-3">{t("giftClaimed")}</h1>
						<p className="text-muted-foreground mb-6">{t("giftClaimedDescription")}</p>
						<Link href="/study/create">
							<Button>{t("startStudying")}</Button>
						</Link>
					</div>
				</div>
			</AppShell>
		);
	}

	return (
		<AppShell>
			<div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
				<div className="text-center max-w-md">
					<div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
						<Gift className="h-8 w-8 text-primary" />
					</div>

					<h1 className="text-3xl font-bold mb-3">{t("claimTitle")}</h1>
					<p className="text-muted-foreground mb-6">{t("claimDescription")}</p>

					{!user ? (
						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">{t("signInToClaim")}</p>
							<Link href={"/sign-in?redirect=/gift/claim/" + token}>
								<Button size="lg">{t("signIn")}</Button>
							</Link>
						</div>
					) : (
						<Button onClick={handleClaim} disabled={isClaiming} size="lg">
							{isClaiming ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t("claiming")}
								</>
							) : (
								t("claimGift")
							)}
						</Button>
					)}
				</div>
			</div>
		</AppShell>
	);
}
