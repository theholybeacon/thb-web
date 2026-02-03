"use client";

import { useState } from "react";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AppShell } from "@/components/app";
import { Users, Heart, Globe, MessageCircle, Gift, Crown, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { membershipRequestGetAllPendingSS } from "@/app/common/membershipRequest/service/server/membershipRequestGetAllPendingSS";
import { membershipRequestGetPendingByRequesterIdSS } from "@/app/common/membershipRequest/service/server/membershipRequestGetPendingByRequesterIdSS";
import { membershipRequestCreateSS } from "@/app/common/membershipRequest/service/server/membershipRequestCreateSS";
import { membershipRequestUpdateSS } from "@/app/common/membershipRequest/service/server/membershipRequestUpdateSS";

export default function SponsorshipPage() {
	const t = useTranslations("sponsorship");
	const tCommon = useTranslations("common");
	const { user, isPremium, loading: userLoading } = useLoggedUserContext();
	const queryClient = useQueryClient();
	const [message, setMessage] = useState("");
	const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
	const [isSponsorLoading, setIsSponsorLoading] = useState(false);

	const { data: pendingRequests, isLoading: requestsLoading } = useQuery({
		queryKey: ["membershipRequests", "pending"],
		queryFn: membershipRequestGetAllPendingSS,
	});

	const { data: myRequest } = useQuery({
		queryKey: ["membershipRequest", "mine", user?.id],
		queryFn: async () => {
			if (!user?.id) return null;
			return await membershipRequestGetPendingByRequesterIdSS(user.id);
		},
		enabled: Boolean(user?.id) && !isPremium,
	});

	const createRequestMutation = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Not logged in");
			return await membershipRequestCreateSS({
				requesterId: user.id,
				message,
				requesterName: user.name,
				requesterCountry: user.country || undefined,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["membershipRequests"] });
			queryClient.invalidateQueries({ queryKey: ["membershipRequest", "mine"] });
			setMessage("");
			toast.success(t("requestSubmitted"));
		},
		onError: () => {
			toast.error(tCommon("error"));
		},
	});

	const cancelRequestMutation = useMutation({
		mutationFn: async () => {
			if (!myRequest) throw new Error("No request to cancel");
			return await membershipRequestUpdateSS(myRequest.id, { status: "canceled" });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["membershipRequests"] });
			queryClient.invalidateQueries({ queryKey: ["membershipRequest", "mine"] });
			toast.success(t("requestCanceled"));
		},
		onError: () => {
			toast.error(tCommon("error"));
		},
	});

	const handleSponsor = async (requestId: string) => {
		setSelectedRequestId(requestId);
		setIsSponsorLoading(true);
		try {
			const response = await fetch("/api/stripe/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					billingInterval: "year",
					isGift: true,
					membershipRequestId: requestId,
				}),
			});
			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
			}
		} catch (error) {
			console.error("Error creating sponsor checkout:", error);
			toast.error(tCommon("error"));
		} finally {
			setIsSponsorLoading(false);
			setSelectedRequestId(null);
		}
	};

	if (userLoading) {
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
						<Users className="h-8 w-8 text-primary" />
						<h1 className="text-3xl font-bold">{t("title")}</h1>
					</div>

					<p className="text-muted-foreground mb-8 max-w-2xl">{t("description")}</p>

					{/* Request sponsorship section - only for non-premium users */}
					{!isPremium && !myRequest && (
						<div className="rounded-lg border bg-card p-6 mb-8">
							<div className="flex items-center gap-2 mb-4">
								<Heart className="h-5 w-5 text-primary" />
								<h2 className="text-xl font-semibold">{t("requestSponsorship")}</h2>
							</div>
							<p className="text-muted-foreground mb-4">{t("requestDescription")}</p>

							<div className="space-y-4">
								<div>
									<Label htmlFor="message">{t("whyNeedSponsorship")}</Label>
									<Textarea
										id="message"
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										placeholder={t("messagePlaceholder")}
										rows={3}
										className="mt-1"
									/>
								</div>
								<Button
									onClick={() => createRequestMutation.mutate()}
									disabled={createRequestMutation.isPending || !message.trim()}
								>
									{createRequestMutation.isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											{t("submitting")}
										</>
									) : (
										t("joinQueue")
									)}
								</Button>
							</div>
						</div>
					)}

					{/* Current request status */}
					{!isPremium && myRequest && (
						<div className="rounded-lg border border-primary/50 bg-primary/5 p-6 mb-8">
							<div className="flex items-center gap-2 mb-4">
								<Check className="h-5 w-5 text-primary" />
								<h2 className="text-xl font-semibold">{t("yourRequest")}</h2>
							</div>
							<p className="text-muted-foreground mb-2">{t("requestPending")}</p>
							{myRequest.message && (
								<p className="text-sm bg-background rounded p-3 mb-4">"{myRequest.message}"</p>
							)}
							<Button
								variant="outline"
								onClick={() => cancelRequestMutation.mutate()}
								disabled={cancelRequestMutation.isPending}
							>
								{cancelRequestMutation.isPending ? t("canceling") : t("cancelRequest")}
							</Button>
						</div>
					)}

					{/* Premium user - sponsor option */}
					{isPremium && (
						<div className="rounded-lg border border-green-500/50 bg-green-500/5 p-6 mb-8">
							<div className="flex items-center gap-2 mb-4">
								<Crown className="h-5 w-5 text-green-600" />
								<h2 className="text-xl font-semibold">{t("becomeSponsor")}</h2>
							</div>
							<p className="text-muted-foreground mb-4">{t("sponsorDescription")}</p>
							<Link href="/gift">
								<Button>
									<Gift className="mr-2 h-4 w-4" />
									{t("sponsorNow")}
								</Button>
							</Link>
						</div>
					)}

					{/* Queue list */}
					<div className="rounded-lg border bg-card p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold">{t("sponsorshipQueue")}</h2>
							<span className="text-sm text-muted-foreground">
								{pendingRequests?.length || 0} {t("peopleWaiting")}
							</span>
						</div>

						{requestsLoading && (
							<div className="text-center py-8">
								<Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
							</div>
						)}

						{!requestsLoading && pendingRequests?.length === 0 && (
							<div className="text-center py-8">
								<Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
								<p className="text-muted-foreground">{t("noRequestsYet")}</p>
							</div>
						)}

						<div className="space-y-3">
							{pendingRequests?.map((request) => (
								<div
									key={request.id}
									className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-background"
								>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="font-medium">{request.requesterName}</span>
											{request.requesterCountry && (
												<span className="flex items-center gap-1 text-xs text-muted-foreground">
													<Globe className="h-3 w-3" />
													{request.requesterCountry}
												</span>
											)}
										</div>
										{request.message && (
											<div className="flex items-start gap-1.5 mt-2 text-sm text-muted-foreground">
												<MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
												<p className="line-clamp-2">{request.message}</p>
											</div>
										)}
									</div>
									{isPremium && request.requesterId !== user?.id && (
										<Button
											size="sm"
											onClick={() => handleSponsor(request.id)}
											disabled={isSponsorLoading && selectedRequestId === request.id}
										>
											{isSponsorLoading && selectedRequestId === request.id ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<>
													<Heart className="mr-1 h-3 w-3" />
													{t("sponsor")}
												</>
											)}
										</Button>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</AppShell>
	);
}
