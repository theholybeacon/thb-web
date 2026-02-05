"use client";

import { useState, useEffect } from "react";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app";
import { Crown, CreditCard, Gift, Users, Check, Heart, Clock, Hash } from "lucide-react";
import Link from "next/link";
import { PremiumBadge } from "@/components/premium";
import { cn } from "@/lib/utils";
import { subscriptionGetSponsorshipInfoSS, SponsorshipInfo } from "@/app/common/subscription/service/server/subscriptionGetSponsorshipInfoSS";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { membershipRequestGetPendingByRequesterIdSS } from "@/app/common/membershipRequest/service/server/membershipRequestGetPendingByRequesterIdSS";
import { membershipRequestGetQueuePositionSS } from "@/app/common/membershipRequest/service/server/membershipRequestGetQueuePositionSS";
import { membershipRequestGetLastFulfilledSS, LastFulfilledInfo } from "@/app/common/membershipRequest/service/server/membershipRequestGetLastFulfilledSS";
import { MembershipRequest } from "@/app/common/membershipRequest/model/MembershipRequest";

interface PriceData {
	id: string;
	amount: number | null;
	currency: string;
}

interface PricesResponse {
	monthly: PriceData | null;
	yearly: PriceData | null;
}

export default function SubscriptionPage() {
	const t = useTranslations("subscription");
	const tPremium = useTranslations("premium");
	const tSponsorship = useTranslations("sponsorship");
	const { isPremium, loading, user } = useLoggedUserContext();
	const [isLoadingPortal, setIsLoadingPortal] = useState(false);
	const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
	const [billingInterval, setBillingInterval] = useState<"month" | "year">("year");
	const [prices, setPrices] = useState<PricesResponse | null>(null);
	const [pricesLoading, setPricesLoading] = useState(true);
	const [sponsorshipInfo, setSponsorshipInfo] = useState<SponsorshipInfo | null>(null);
	const [sponsorshipLoading, setSponsorshipLoading] = useState(true);
	const [pendingRequest, setPendingRequest] = useState<MembershipRequest | null>(null);
	const [queuePosition, setQueuePosition] = useState<number | null>(null);
	const [lastFulfilled, setLastFulfilled] = useState<LastFulfilledInfo | null>(null);
	const [queueLoading, setQueueLoading] = useState(true);

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

	useEffect(() => {
		async function fetchSponsorshipInfo() {
			if (!user?.id) {
				setSponsorshipLoading(false);
				return;
			}
			try {
				const info = await subscriptionGetSponsorshipInfoSS(user.id);
				setSponsorshipInfo(info);
			} catch (error) {
				console.error("Error fetching sponsorship info:", error);
			} finally {
				setSponsorshipLoading(false);
			}
		}
		fetchSponsorshipInfo();
	}, [user?.id]);

	useEffect(() => {
		async function fetchQueueStatus() {
			if (!user?.id || isPremium) {
				setQueueLoading(false);
				return;
			}
			try {
				const [request, position, lastFulfilledInfo] = await Promise.all([
					membershipRequestGetPendingByRequesterIdSS(user.id),
					membershipRequestGetQueuePositionSS(user.id),
					membershipRequestGetLastFulfilledSS(),
				]);
				setPendingRequest(request);
				setQueuePosition(position);
				setLastFulfilled(lastFulfilledInfo);
			} catch (error) {
				console.error("Error fetching queue status:", error);
			} finally {
				setQueueLoading(false);
			}
		}
		fetchQueueStatus();
	}, [user?.id, isPremium]);

	const selectedPrice = billingInterval === "year" ? prices?.yearly : prices?.monthly;

	const formatPrice = (price: PriceData | null | undefined) => {
		if (!price || price.amount === null) return "";
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency: price.currency,
		}).format(price.amount / 100);
	};

	const formatDate = (date: Date | null) => {
		if (!date) return "";
		return new Intl.DateTimeFormat(undefined, {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(new Date(date));
	};

	const formatRelativeTime = (date: Date | null) => {
		if (!date) return "";
		const now = new Date();
		const past = new Date(date);
		const diffMs = now.getTime() - past.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays > 0) {
			return tSponsorship("queueStatus.timeAgo", { time: tSponsorship("queueStatus.days", { count: diffDays }) });
		} else if (diffHours > 0) {
			return tSponsorship("queueStatus.timeAgo", { time: tSponsorship("queueStatus.hours", { count: diffHours }) });
		} else if (diffMins > 0) {
			return tSponsorship("queueStatus.timeAgo", { time: tSponsorship("queueStatus.minutes", { count: diffMins }) });
		} else {
			return tSponsorship("queueStatus.lessThanMinute");
		}
	};

	const handleManageSubscription = async () => {
		setIsLoadingPortal(true);
		try {
			const response = await fetch("/api/stripe/portal", {
				method: "POST",
			});
			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
			}
		} catch (error) {
			console.error("Error opening portal:", error);
		} finally {
			setIsLoadingPortal(false);
		}
	};

	const handleSubscribe = async () => {
		if (!selectedPrice) return;
		setIsLoadingCheckout(true);
		try {
			const response = await fetch("/api/stripe/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ priceId: selectedPrice.id }),
			});
			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
			}
		} catch (error) {
			console.error("Error creating checkout:", error);
		} finally {
			setIsLoadingCheckout(false);
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
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

	return (
		<AppShell>
			<div className="p-6 lg:p-8">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center gap-3 mb-8">
						<Crown className="h-8 w-8 text-primary" />
						<h1 className="text-3xl font-bold">{t("title")}</h1>
					</div>

					{isPremium ? (
						<div className="space-y-6">
							<div className="rounded-lg border bg-card p-6">
								<div className="flex items-center gap-3 mb-4">
									<PremiumBadge size="md" />
									<span className="text-lg font-medium">{t("activeSubscription")}</span>
								</div>
								<p className="text-muted-foreground mb-4">{t("thankYou")}</p>
								<div className="flex flex-wrap gap-3">
									<Button onClick={handleManageSubscription} disabled={isLoadingPortal}>
										<CreditCard className="mr-2 h-4 w-4" />
										{isLoadingPortal ? t("loading") : t("manageSubscription")}
									</Button>
									<Link href="/gift">
										<Button variant="outline">
											<Gift className="mr-2 h-4 w-4" />
											{t("giftPremium")}
										</Button>
									</Link>
									<Link href="/sponsorship">
										<Button variant="outline">
											<Users className="mr-2 h-4 w-4" />
											{t("sponsorSomeone")}
										</Button>
									</Link>
								</div>
							</div>

							<div className="rounded-lg border bg-card p-6">
								<h2 className="text-xl font-semibold mb-4">{t("premiumFeatures")}</h2>
								<div className="grid gap-3 md:grid-cols-2">
									<div className="flex items-center gap-2">
										<Check className="h-4 w-4 text-green-500" />
										<span>{tPremium("features.sessions")}</span>
									</div>
									<div className="flex items-center gap-2">
										<Check className="h-4 w-4 text-green-500" />
										<span>{tPremium("features.studies")}</span>
									</div>
									<div className="flex items-center gap-2">
										<Check className="h-4 w-4 text-green-500" />
										<span>{tPremium("features.explore")}</span>
									</div>
								</div>
							</div>

							{/* My Sponsor Section */}
							{!sponsorshipLoading && sponsorshipInfo && sponsorshipInfo.sponsors.length > 0 && (
								<div className="rounded-lg border bg-card p-6">
									<div className="flex items-center gap-2 mb-4">
										<Heart className="h-5 w-5 text-red-500" />
										<h2 className="text-xl font-semibold">{t("mySponsor")}</h2>
									</div>
									<div className="space-y-4">
										{sponsorshipInfo.sponsors.map((sponsor) => (
											<div key={sponsor.user.id} className="flex items-center gap-4">
												<Avatar className="h-12 w-12">
													<AvatarImage src={sponsor.user.profilePicture || undefined} alt={sponsor.user.name} />
													<AvatarFallback>{getInitials(sponsor.user.name)}</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{sponsor.user.name}</p>
													<p className="text-sm text-muted-foreground">
														{t("sponsoredSince", { date: formatDate(sponsor.sponsoredSince) })}
													</p>
												</div>
											</div>
										))}
									</div>
									<p className="text-sm text-muted-foreground mt-4">{t("sponsorGratitude")}</p>
								</div>
							)}

							{/* People I've Sponsored Section */}
							{!sponsorshipLoading && (
								<div className="rounded-lg border bg-card p-6">
									<div className="flex items-center gap-2 mb-4">
										<Users className="h-5 w-5 text-primary" />
										<h2 className="text-xl font-semibold">{t("peopleIveSponsored")}</h2>
									</div>
									{sponsorshipInfo && sponsorshipInfo.sponsored.length > 0 ? (
										<>
											<div className="space-y-4 mb-4">
												{sponsorshipInfo.sponsored.map((person) => (
													<div key={person.user.id} className="flex items-center gap-4">
														<Avatar className="h-12 w-12">
															<AvatarImage src={person.user.profilePicture || undefined} alt={person.user.name} />
															<AvatarFallback>{getInitials(person.user.name)}</AvatarFallback>
														</Avatar>
														<div>
															<p className="font-medium">{person.user.name}</p>
															<p className="text-sm text-muted-foreground">
																{t("sponsoredSince", { date: formatDate(person.sponsoredSince) })}
															</p>
														</div>
													</div>
												))}
											</div>
											<Link href="/sponsorship">
												<Button variant="outline" size="sm">
													<Users className="mr-2 h-4 w-4" />
													{t("sponsorSomeone")}
												</Button>
											</Link>
										</>
									) : (
										<div className="text-center py-4">
											<p className="text-muted-foreground mb-2">{t("noSponsorshipsYet")}</p>
											<p className="text-sm text-muted-foreground mb-4">{t("sponsorSomeoneDescription")}</p>
											<Link href="/sponsorship">
												<Button variant="outline">
													<Users className="mr-2 h-4 w-4" />
													{t("sponsorSomeone")}
												</Button>
											</Link>
										</div>
									)}
								</div>
							)}
						</div>
					) : (
						<div className="space-y-6">
							{/* My Sponsor Section for non-premium sponsored users */}
							{!sponsorshipLoading && sponsorshipInfo && sponsorshipInfo.sponsors.length > 0 && (
								<div className="rounded-lg border bg-card p-6">
									<div className="flex items-center gap-2 mb-4">
										<Heart className="h-5 w-5 text-red-500" />
										<h2 className="text-xl font-semibold">{t("mySponsor")}</h2>
									</div>
									<div className="space-y-4">
										{sponsorshipInfo.sponsors.map((sponsor) => (
											<div key={sponsor.user.id} className="flex items-center gap-4">
												<Avatar className="h-12 w-12">
													<AvatarImage src={sponsor.user.profilePicture || undefined} alt={sponsor.user.name} />
													<AvatarFallback>{getInitials(sponsor.user.name)}</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{sponsor.user.name}</p>
													<p className="text-sm text-muted-foreground">
														{t("sponsoredSince", { date: formatDate(sponsor.sponsoredSince) })}
													</p>
												</div>
											</div>
										))}
									</div>
									<p className="text-sm text-muted-foreground mt-4">{t("sponsorGratitude")}</p>
								</div>
							)}

							{/* Queue Status Section - hide if user already has a sponsor */}
							{!queueLoading && pendingRequest && queuePosition && !(sponsorshipInfo && sponsorshipInfo.sponsors.length > 0) && (
								<div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
									<div className="flex items-center gap-2 mb-4">
										<Clock className="h-5 w-5 text-primary" />
										<h2 className="text-xl font-semibold">{tSponsorship("queueStatus.title")}</h2>
									</div>

									<div className="grid gap-4 md:grid-cols-3 mb-4">
										{/* Queue Position */}
										<div className="rounded-lg bg-card p-4 text-center">
											<div className="flex items-center justify-center gap-1 mb-1">
												<Hash className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm text-muted-foreground">{tSponsorship("queueStatus.position")}</span>
											</div>
											<p className="text-3xl font-bold text-primary">
												{tSponsorship("queueStatus.positionNumber", { position: queuePosition })}
											</p>
										</div>

										{/* Last Sponsored */}
										<div className="rounded-lg bg-card p-4">
											<div className="flex items-center gap-1 mb-2">
												<Gift className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm text-muted-foreground">{tSponsorship("queueStatus.lastSponsored")}</span>
											</div>
											{lastFulfilled && lastFulfilled.recipient ? (
												<div className="flex items-center gap-2">
													<Avatar className="h-8 w-8">
														<AvatarImage src={lastFulfilled.recipient.profilePicture || undefined} alt={lastFulfilled.recipient.name} />
														<AvatarFallback className="text-xs">{getInitials(lastFulfilled.recipient.name)}</AvatarFallback>
													</Avatar>
													<div className="min-w-0">
														<p className="text-sm font-medium truncate">{lastFulfilled.recipient.name}</p>
														<p className="text-xs text-muted-foreground">{formatRelativeTime(lastFulfilled.fulfilledAt)}</p>
													</div>
												</div>
											) : (
												<p className="text-sm text-muted-foreground">{tSponsorship("queueStatus.noRecentSponsorships")}</p>
											)}
										</div>

										{/* Sponsor Info */}
										{lastFulfilled && lastFulfilled.sponsor && (
											<div className="rounded-lg bg-card p-4">
												<div className="flex items-center gap-1 mb-2">
													<Heart className="h-4 w-4 text-red-500" />
													<span className="text-sm text-muted-foreground">{tSponsorship("becomeSponsor")}</span>
												</div>
												<div className="flex items-center gap-2">
													<Avatar className="h-8 w-8">
														<AvatarImage src={lastFulfilled.sponsor.profilePicture || undefined} alt={lastFulfilled.sponsor.name} />
														<AvatarFallback className="text-xs">{getInitials(lastFulfilled.sponsor.name)}</AvatarFallback>
													</Avatar>
													<div className="min-w-0">
														<p className="text-sm font-medium truncate">{lastFulfilled.sponsor.name}</p>
													</div>
												</div>
											</div>
										)}
									</div>

									<p className="text-sm text-muted-foreground">{tSponsorship("queueStatus.waitingMessage")}</p>
								</div>
							)}

							{/* Need help card - hide if already in queue or already has a sponsor */}
							{!pendingRequest && !(sponsorshipInfo && sponsorshipInfo.sponsors.length > 0) && (
								<div className="rounded-lg border border-dashed p-6 text-center">
									<Users className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
									<h3 className="font-medium mb-2">{t("needHelp")}</h3>
									<p className="text-sm text-muted-foreground mb-4">{t("needHelpDescription")}</p>
									<Link href="/sponsorship">
										<Button variant="outline">{t("requestSponsorship")}</Button>
									</Link>
								</div>
							)}

							<div className="rounded-lg border bg-card p-6">
								<h2 className="text-xl font-semibold mb-2">{t("upgradeToPremium")}</h2>
								<p className="text-muted-foreground mb-6">{t("upgradeDescription")}</p>

								<div className="grid gap-4 md:grid-cols-2 mb-6">
									<div className="flex items-center gap-2">
										<Check className="h-4 w-4 text-green-500" />
										<span>{tPremium("features.sessions")}</span>
									</div>
									<div className="flex items-center gap-2">
										<Check className="h-4 w-4 text-green-500" />
										<span>{tPremium("features.studies")}</span>
									</div>
									<div className="flex items-center gap-2">
										<Check className="h-4 w-4 text-green-500" />
										<span>{tPremium("features.explore")}</span>
									</div>
								</div>

								<div className="flex gap-2 p-1 bg-muted rounded-lg mb-6 max-w-md">
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

								<Button onClick={handleSubscribe} disabled={isLoadingCheckout || pricesLoading || !selectedPrice} size="lg">
									<Crown className="mr-2 h-4 w-4" />
									{isLoadingCheckout ? t("loading") : pricesLoading ? t("loading") : `${t("subscribe")} - ${formatPrice(selectedPrice)}`}
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</AppShell>
	);
}
