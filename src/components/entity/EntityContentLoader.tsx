"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { entityContentEnsureSS } from "@/app/common/entity/service/server/entityContentEnsureSS";

/**
 * Triggers lazy generation of a character's AI content for signed-in viewers,
 * polls until ready, then refreshes to pick up the server-rendered (SEO)
 * version. Renders nothing once content is ready. The character page is public
 * (no QueryClientProvider), so this uses plain effects, not react-query.
 */
export function EntityContentLoader({
	entityId,
	initialStatus,
}: {
	entityId: string;
	initialStatus: string;
}) {
	const { isSignedIn, isLoaded } = useAuth();
	const router = useRouter();
	const [state, setState] = useState<"idle" | "loading" | "signin" | "done">("idle");

	useEffect(() => {
		if (!isLoaded || initialStatus === "ready") return;
		if (!isSignedIn) {
			setState("signin");
			return;
		}

		let cancelled = false;
		setState("loading");
		(async () => {
			for (let tries = 0; tries < 7 && !cancelled; tries++) {
				const row = await entityContentEnsureSS(entityId);
				if (cancelled) return;
				if (row?.generationStatus === "ready") {
					router.refresh();
					setState("done");
					return;
				}
				if (row?.generationStatus === "failed") {
					setState("done");
					return;
				}
				await new Promise((r) => setTimeout(r, 3000));
			}
			if (!cancelled) setState("done");
		})();

		return () => {
			cancelled = true;
		};
	}, [isLoaded, isSignedIn, initialStatus, entityId, router]);

	if (initialStatus === "ready" || state === "idle" || state === "done") return null;

	if (state === "signin") {
		return (
			<p className="text-sm text-muted-foreground mb-8">
				Sign in to generate an AI overview, timeline, and relationships for this person.
			</p>
		);
	}

	return (
		<div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
			<Loader2 className="h-4 w-4 animate-spin" />
			Generating insights…
		</div>
	);
}
