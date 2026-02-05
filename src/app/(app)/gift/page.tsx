"use client";

import { useState, useEffect } from "react";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppShell } from "@/components/app";
import { Gift, Mail, Users, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { membershipRequestGetAllPendingSS } from "@/app/common/membershipRequest/service/server/membershipRequestGetAllPendingSS";

interface PriceData {
	id: string;
	amount: number | null;
	currency: string;
}

interface PricesResponse {
	monthly: PriceData | null;
	yearly: PriceData | null;
}

export default function GiftPage() {
	const t = useTranslations("gift");
	const tPremium = useTranslations("premium");
	const { isPremium, loading } = useLoggedUserContext();
	const [giftType, setGiftType] = useState<"email" | "queue">("email");
	const [recipientEmail, setRecipientEmail] = useState("");
	const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
	const [billingInterval, setBillingInterval] = useState<"month" | "year">("year");
	const [isLoading, setIsLoading] = useState(false);
	const [prices, setPrices] = useState<PricesResponse | null>(null);
	const [pricesLoading, setPricesLoading] = useState(true);

	useEffect(() => {
		async function fetchPrices() {
			try {
				const response = await fetch("/api/stripe/prices");
				const data = await response.json();
				setPrices(data);
			} catch (error) {
				console.error("Error fetching prices:", error);
			} finally {
				setPricesLoading(false);
			}
		}
		fetchPrices();
	}, []);

	const selectedPrice = billingInterval === "year" ? prices?.yearly : prices?.monthly;

	const formatPrice = (price: PriceData | null | undefined) => {
		if (!price || price.amount === null) return "";
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency: price.currency,
		}).format(price.amount / 100);
	};

	const { data: pendingRequests } = useQuery({
		queryKey: ["membershipRequests", "pending"],
		queryFn: membershipRequestGetAllPendingSS,
	});

	const handleGift = async () => {
		if (!selectedPrice) return;
		setIsLoading(true);
		try {
			const response = await fetch("/api/stripe/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					priceId: selectedPrice.id,
					isGift: true,
					giftRecipientEmail: giftType === "email" ? recipientEmail : undefined,
					membershipRequestId: giftType === "queue" ? selectedRequestId : undefined,
				}),
			});
			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
			}
		} catch (error) {
			console.error("Error creating gift checkout:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (loading) {
		return (
			<AppShell>
				<div className="flex h-full items-center justify-center py-20">
					<div className="animate-pulse">Loading...</div>
				</div>
			</AppShell>
		);
	}

	if (!isPremium) {
		return (
			<AppShell>
				<div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
					<div className="text-center max-w-md">
						<Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h1 className="text-2xl font-bold mb-2">{t("premiumRequired")}</h1>
						<p className="text-muted-foreground mb-6">{t("premiumRequiredDescription")}</p>
						<Link href="/subscription">
							<Button>
								<Crown className="mr-2 h-4 w-4" />
								{t("upgradeToPremium")}
							</Button>
						</Link>
					</div>
				</div>
			</AppShell>
		);
	}

	return (
		<AppShell>
			<div className="p-6 lg:p-8">
				<div className="max-w-2xl mx-auto">
					<div className="flex items-center gap-3 mb-8">
						<Gift className="h-8 w-8 text-primary" />
						<h1 className="text-3xl font-bold">{t("title")}</h1>
					</div>

					<div className="rounded-lg border bg-card p-6 space-y-6">
						<div>
							<h2 className="text-lg font-semibold mb-4">{t("chooseRecipient")}</h2>
							<div className="grid gap-3 sm:grid-cols-2">
								<button
									onClick={() => setGiftType("email")}
									className={cn(
										"p-4 rounded-lg border text-left transition-colors",
										giftType === "email"
											? "border-primary bg-primary/5"
											: "border-border hover:border-primary/50"
									)}
								>
									<Mail className="h-6 w-6 mb-2 text-primary" />
									<p className="font-medium">{t("sendToEmail")}</p>
									<p className="text-sm text-muted-foreground">{t("sendToEmailDescription")}</p>
								</button>
								<button
									onClick={() => setGiftType("queue")}
									className={cn(
										"p-4 rounded-lg border text-left transition-colors",
										giftType === "queue"
											? "border-primary bg-primary/5"
											: "border-border hover:border-primary/50"
									)}
								>
									<Users className="h-6 w-6 mb-2 text-primary" />
									<p className="font-medium">{t("sponsorFromQueue")}</p>
									<p className="text-sm text-muted-foreground">{t("sponsorFromQueueDescription")}</p>
								</button>
							</div>
						</div>

						{giftType === "email" && (
							<div>
								<Label htmlFor="email">{t("recipientEmail")}</Label>
								<Input
									id="email"
									type="email"
									value={recipientEmail}
									onChange={(e) => setRecipientEmail(e.target.value)}
									placeholder={t("emailPlaceholder")}
									className="mt-1"
								/>
							</div>
						)}

						{giftType === "queue" && (
							<div>
								<Label>{t("selectFromQueue")}</Label>
								<div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
									{pendingRequests?.length === 0 && (
										<p className="text-muted-foreground text-center py-4">{t("noRequestsInQueue")}</p>
									)}
									{pendingRequests?.map((request) => (
										<button
											key={request.id}
											onClick={() => setSelectedRequestId(request.id)}
											className={cn(
												"w-full p-3 rounded-lg border text-left transition-colors",
												selectedRequestId === request.id
													? "border-primary bg-primary/5"
													: "border-border hover:border-primary/50"
											)}
										>
											<div className="flex items-center justify-between">
												<span className="font-medium">{request.requesterName}</span>
												{request.requesterCountry && (
													<span className="text-xs text-muted-foreground">
														{request.requesterCountry}
													</span>
												)}
											</div>
											{request.message && (
												<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
													{request.message}
												</p>
											)}
										</button>
									))}
								</div>
							</div>
						)}

						<div>
							<Label>{t("giftDuration")}</Label>
							<div className="flex gap-2 p-1 bg-muted rounded-lg mt-2">
								<button
									onClick={() => setBillingInterval("month")}
									className={cn(
										"flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
										billingInterval === "month"
											? "bg-background shadow-sm"
											: "hover:bg-background/50"
									)}
								>
									{tPremium("monthly")}
								</button>
								<button
									onClick={() => setBillingInterval("year")}
									className={cn(
										"flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors relative",
										billingInterval === "year"
											? "bg-background shadow-sm"
											: "hover:bg-background/50"
									)}
								>
									{tPremium("yearly")}
									<span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
										{tPremium("save")}
									</span>
								</button>
							</div>
						</div>

						<Button
							onClick={handleGift}
							disabled={
								isLoading ||
								pricesLoading ||
								!selectedPrice ||
								(giftType === "email" && !recipientEmail) ||
								(giftType === "queue" && !selectedRequestId)
							}
							size="lg"
							className="w-full"
						>
							{isLoading ? t("processing") : pricesLoading ? tPremium("loading") : `${t("purchaseGift")} - ${formatPrice(selectedPrice)}`}
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</AppShell>
	);
}
