"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app";
import { CheckCircle, Gift, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GiftSuccessPage() {
	const t = useTranslations("gift");

	return (
		<AppShell>
			<div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
				<div className="text-center max-w-md">
					<div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
						<CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
					</div>

					<h1 className="text-3xl font-bold mb-3">{t("successTitle")}</h1>
					<p className="text-muted-foreground mb-6">{t("successDescription")}</p>

					<div className="rounded-lg border bg-card p-4 mb-6">
						<div className="flex items-center justify-center gap-2 text-primary">
							<Gift className="h-5 w-5" />
							<span className="font-medium">{t("giftSent")}</span>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Link href="/gift">
							<Button>
								{t("sendAnother")}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</Link>
						<Link href="/home">
							<Button variant="outline">{t("backToHome")}</Button>
						</Link>
					</div>
				</div>
			</div>
		</AppShell>
	);
}
