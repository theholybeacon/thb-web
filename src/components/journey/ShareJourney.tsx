"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/lib/toast";
import { userSetPublicProfileSS } from "@/app/common/completion/service/server/userSetPublicProfileSS";
import { ShareStoryButton } from "@/components/share/ShareStoryButton";
import { localDateString } from "@/lib/activityClient";

/**
 * Turns a private journey into a shareable one.
 *
 * Public sharing is opt-in and starts off: reading habits are personal, and a
 * progress page keyed to a username says a lot about someone. The link controls
 * only appear once the user has actually chosen to publish.
 *
 * The story export is deliberately NOT behind that opt-in: it hands the user an
 * image of their own progress to post wherever they like. Nothing is published
 * and no URL is created, so gating it behind a public profile would be asking
 * permission to do something private.
 */
export function ShareJourney({
	username,
	isPublic,
	scope,
}: {
	username: string;
	isPublic: boolean;
	/** Translation slug the story should be scoped to, or null for All Bibles. */
	scope?: string | null;
}) {
	const t = useTranslations("journey");
	const [enabled, setEnabled] = useState(isPublic);
	const [saving, setSaving] = useState(false);
	const [copied, setCopied] = useState(false);

	const url =
		typeof window !== "undefined" ? `${window.location.origin}/u/${username}` : `/u/${username}`;

	const toggle = async (next: boolean) => {
		if (saving) return;
		setSaving(true);
		const previous = enabled;
		setEnabled(next);
		try {
			const res = await userSetPublicProfileSS(next);
			if (!res.ok) throw new Error("failed");
		} catch {
			setEnabled(previous);
			toast.error(t("shareDisabled"));
		} finally {
			setSaving(false);
		}
	};

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			toast.success(t("shareCopied"));
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard can be blocked by permissions; the link is on screen anyway.
		}
	};

	const share = async () => {
		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({ title: t("title"), url });
				return;
			} catch {
				// User dismissed the sheet, or the browser refused — fall back to copy.
			}
		}
		void copy();
	};

	return (
		<div className="rounded-lg border bg-card p-5">
			<h2 className="mb-4 font-heading text-lg font-semibold">{t("shareTitle")}</h2>

			<div className="mb-5 flex flex-wrap items-center gap-3 border-b pb-5">
				<ShareStoryButton kind="journey" bible={scope} date={localDateString()} />
				<span className="text-xs text-muted-foreground">{t("shareStoryHint")}</span>
			</div>

			<label className="flex cursor-pointer items-start gap-3">
				<Checkbox
					checked={enabled}
					onCheckedChange={(v) => void toggle(v === true)}
					disabled={saving}
					className="mt-0.5"
				/>
				<span className="min-w-0">
					<span className="block text-sm font-medium">{t("shareEnable")}</span>
					<span className="mt-0.5 block text-xs text-muted-foreground">{t("shareEnableHint")}</span>
				</span>
			</label>

			{enabled && (
				<div className="mt-4 flex flex-wrap items-center gap-2">
					<code className="min-w-0 flex-1 truncate rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">
						{url}
					</code>
					<Button size="sm" variant="outline" onClick={() => void copy()}>
						{copied ? <Check className="h-4 w-4 sm:mr-1.5" /> : <Link2 className="h-4 w-4 sm:mr-1.5" />}
						<span className="hidden sm:inline">{copied ? t("shareCopied") : t("shareCopy")}</span>
					</Button>
					<Button size="sm" onClick={() => void share()}>
						<Share2 className="h-4 w-4 sm:mr-1.5" />
						<span className="hidden sm:inline">{t("shareButton")}</span>
					</Button>
				</div>
			)}
		</div>
	);
}
