"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Instagram, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type Props = {
	/** Which story to render. Mirrors the route handler's `kind`. */
	kind: "journey" | "profile" | "session";
	/** Translation slug to scope a journey/profile story to. */
	bible?: string | null;
	username?: string;
	sessionId?: string;
	/** The viewer's local date, so the image's timeframes match the page's. */
	date?: string;
	label?: string;
	variant?: React.ComponentProps<typeof Button>["variant"];
	size?: React.ComponentProps<typeof Button>["size"];
	className?: string;
};

/**
 * Hands the user a vertical image to post.
 *
 * Web Share Level 2 (`navigator.share` with files) is the only path that puts an
 * image directly into Instagram or TikTok from the web, and it exists on mobile
 * only — which is where stories get posted anyway. Everywhere else this falls
 * back to a download, so the button is never a dead end on desktop.
 *
 * `canShare({files})` is checked before `share()` rather than after: browsers
 * that expose `navigator.share` but refuse files reject asynchronously, and by
 * then the user gesture is spent and a retry cannot open a share sheet.
 */
export function ShareStoryButton({
	kind,
	bible,
	username,
	sessionId,
	date,
	label,
	variant = "outline",
	size = "sm",
	className,
}: Props) {
	const t = useTranslations("journey");
	const [busy, setBusy] = useState(false);

	const buildUrl = () => {
		const params = new URLSearchParams({ kind });
		if (bible) params.set("bible", bible);
		if (username) params.set("username", username);
		if (sessionId) params.set("sessionId", sessionId);
		if (date) params.set("date", date);
		return `/api/share/story?${params.toString()}`;
	};

	const run = async () => {
		if (busy) return;
		setBusy(true);
		try {
			const res = await fetch(buildUrl());
			if (!res.ok) throw new Error(String(res.status));
			const blob = await res.blob();
			const file = new File([blob], `holybeacon-${kind}.png`, { type: "image/png" });

			if (navigator.canShare?.({ files: [file] })) {
				await navigator.share({ files: [file], title: t("title") });
				return;
			}

			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = file.name;
			a.click();
			// Revoked on the next tick: revoking synchronously can cancel the download
			// in some browsers before it has read the blob.
			setTimeout(() => URL.revokeObjectURL(url), 1000);
		} catch (e) {
			// A dismissed share sheet rejects with AbortError; that is a choice, not a
			// failure, and must not raise a toast.
			if (e instanceof DOMException && e.name === "AbortError") return;
			toast.error(t("shareStoryFailed"));
		} finally {
			setBusy(false);
		}
	};

	return (
		<Button
			variant={variant}
			size={size}
			className={cn("gap-1.5", className)}
			disabled={busy}
			onClick={() => void run()}
		>
			{busy ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : (
				<Instagram className="h-4 w-4" />
			)}
			{label ?? t("shareStory")}
		</Button>
	);
}
