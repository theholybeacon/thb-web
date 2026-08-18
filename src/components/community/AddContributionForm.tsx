"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { contributionCreateSS } from "@/app/common/community/service/server/contributionCreateSS";
import type { ContributionKind, ContributionTarget } from "@/app/common/community/model/Community";
import { useCommunity } from "./CommunityContext";

const KINDS: { id: ContributionKind; label: string }[] = [
	{ id: "fact", label: "Fact" },
	{ id: "analysis", label: "Analysis" },
	{ id: "correction", label: "Correction" },
];

export function AddContributionForm({
	target,
	onDone,
	kinds = KINDS.map((k) => k.id),
	placeholder,
}: {
	target: ContributionTarget;
	onDone?: () => void;
	/**
	 * Which kind chips to offer. The reader passes an empty list: asking someone
	 * reflecting on a psalm to first classify it as a Fact, an Analysis or a
	 * Correction is encyclopedia vocabulary, and it suppresses posting.
	 */
	kinds?: ContributionKind[];
	placeholder?: string;
}) {
	const { requirePremium, onChanged } = useCommunity();
	const [kind, setKind] = useState<ContributionKind>(kinds[0] ?? "analysis");
	const [body, setBody] = useState("");
	const [busy, setBusy] = useState(false);

	const visibleKinds = KINDS.filter((k) => kinds.includes(k.id));

	const submit = async () => {
		if (!requirePremium() || !body.trim() || busy) return;
		setBusy(true);
		const res = await contributionCreateSS({ target, kind, body });
		setBusy(false);
		if (res.ok) {
			setBody("");
			toast.success("Contribution posted");
			onDone?.();
			onChanged();
		} else if (res.error === "rate") {
			toast.error("Please wait a moment before posting again");
		} else if (res.error === "premium") {
			requirePremium();
		} else if (res.error === "target") {
			toast.error("Could not find that passage");
		} else {
			toast.error("Could not post");
		}
	};

	return (
		<div className="space-y-2 rounded-lg border p-3">
			{visibleKinds.length > 0 && (
				<div className="flex gap-1">
					{visibleKinds.map((k) => (
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
			)}
			<textarea
				value={body}
				onChange={(e) => setBody(e.target.value)}
				rows={3}
				placeholder={
					placeholder ?? "Share a fact, analysis, or correction — cite scripture references where possible…"
				}
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
