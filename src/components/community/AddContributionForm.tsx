"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { contributionCreateSS } from "@/app/common/community/service/server/contributionCreateSS";
import type { ContributionSection } from "@/app/common/community/model/Community";
import { useCommunity } from "./CommunityContext";

const KINDS = [
	{ id: "fact", label: "Fact" },
	{ id: "analysis", label: "Analysis" },
	{ id: "correction", label: "Correction" },
] as const;

export function AddContributionForm({
	entityId,
	section,
	onDone,
}: {
	entityId: string;
	section: ContributionSection;
	onDone?: () => void;
}) {
	const { requirePremium } = useCommunity();
	const router = useRouter();
	const [kind, setKind] = useState<"fact" | "analysis" | "correction">("fact");
	const [body, setBody] = useState("");
	const [busy, setBusy] = useState(false);

	const submit = async () => {
		if (!requirePremium() || !body.trim() || busy) return;
		setBusy(true);
		const res = await contributionCreateSS({ entityId, section, kind, body });
		setBusy(false);
		if (res.ok) {
			setBody("");
			toast.success("Contribution posted");
			onDone?.();
			router.refresh();
		} else if (res.error === "rate") {
			toast.error("Please wait a moment before posting again");
		} else if (res.error === "premium") {
			requirePremium();
		} else {
			toast.error("Could not post");
		}
	};

	return (
		<div className="space-y-2 rounded-lg border p-3">
			<div className="flex gap-1">
				{KINDS.map((k) => (
					<button
						key={k.id}
						type="button"
						onClick={() => setKind(k.id)}
						className={`text-xs rounded-full px-2.5 py-1 border ${
							kind === k.id ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground"
						}`}
					>
						{k.label}
					</button>
				))}
			</div>
			<textarea
				value={body}
				onChange={(e) => setBody(e.target.value)}
				rows={3}
				placeholder="Share a fact, analysis, or correction — cite scripture references where possible…"
				className="w-full rounded border bg-background p-2 text-sm"
			/>
			<div className="flex gap-2">
				<Button size="sm" onClick={submit} disabled={busy}>
					Post
				</Button>
				{onDone && (
					<Button size="sm" variant="ghost" onClick={onDone}>
						Cancel
					</Button>
				)}
			</div>
		</div>
	);
}
