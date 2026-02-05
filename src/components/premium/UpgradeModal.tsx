"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Crown, Sparkles, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PriceData {
	id: string;
	amount: number | null;
	currency: string;
}

interface PricesResponse {
	monthly: PriceData | null;
	yearly: PriceData | null;
}

interface UpgradeModalProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	inline?: boolean;
}

export function UpgradeModal({ open, onOpenChange, inline = false }: UpgradeModalProps) {
	const t = useTranslations("premium");
	const router = useRouter();
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

	const handleUpgrade = async () => {
		if (!selectedPrice) return;
		setIsLoading(true);
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
			console.error("Error creating checkout session:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const formatPrice = (price: PriceData | null | undefined) => {
		if (!price || price.amount === null) return "";
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency: price.currency,
		}).format(price.amount / 100);
	};

	const features = [
		{ icon: BookOpen, text: t("features.sessions") },
		{ icon: GraduationCap, text: t("features.studies") },
		{ icon: Sparkles, text: t("features.explore") },
	];

	const content = (
		<div className="space-y-6">
			<div className="text-center space-y-2">
				<div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
					<Crown className="h-6 w-6 text-primary" />
				</div>
				<h2 className="text-2xl font-bold">{t("title")}</h2>
				<p className="text-muted-foreground">{t("description")}</p>
			</div>

			<div className="space-y-3">
				{features.map((feature, index) => (
					<div key={index} className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
							<feature.icon className="h-4 w-4 text-primary" />
						</div>
						<span>{feature.text}</span>
					</div>
				))}
			</div>

			<div className="flex gap-2 p-1 bg-muted rounded-lg">
				<button
					onClick={() => setBillingInterval("month")}
					className={cn(
						"flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
						billingInterval === "month"
							? "bg-background shadow-sm"
							: "hover:bg-background/50"
					)}
				>
					{t("monthly")}
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
					{t("yearly")}
					<span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
						{t("save")}
					</span>
				</button>
			</div>

			<Button
				onClick={handleUpgrade}
				disabled={isLoading || pricesLoading || !selectedPrice}
				className="w-full"
				size="lg"
			>
				{isLoading ? t("processing") : pricesLoading ? t("loading") : `${t("upgrade")} - ${formatPrice(selectedPrice)}`}
			</Button>

			<div className="text-center">
				<Button
					variant="link"
					onClick={() => router.push("/sponsorship")}
					className="text-sm text-muted-foreground"
				>
					{t("needHelp")}
				</Button>
			</div>
		</div>
	);

	const handleOpenChange = (newOpen: boolean) => {
		if (onOpenChange) {
			onOpenChange(newOpen);
		} else if (!newOpen) {
			// If no onOpenChange handler, navigate to home when closing
			router.push("/home");
		}
	};

	if (inline) {
		return (
			<div className="max-w-md mx-auto p-6 border rounded-lg bg-card">
				{content}
			</div>
		);
	}

	return (
		<Dialog open={open ?? true} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader className="sr-only">
					<DialogTitle>{t("title")}</DialogTitle>
					<DialogDescription>{t("description")}</DialogDescription>
				</DialogHeader>
				{content}
			</DialogContent>
		</Dialog>
	);
}
