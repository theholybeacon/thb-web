"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { track } from "@/lib/analytics";
import { contributionCreateSS } from "@/app/common/community/service/server/contributionCreateSS";
import type { ContributionKind, ContributionTarget } from "@/app/common/community/model/Community";
import { useCommunity } from "./CommunityContext";

/**
 * "Comment" first and preselected: classifying a post is opt-in, and an
 * unclassified one renders with no badge at all. The other three stay available
 * for people writing something that really is a fact or a correction.
 */
const KINDS: ContributionKind[] = ["comment", "fact", "analysis", "correction"];

export function AddContributionForm({
	target,
	onDone,
	kinds = KINDS,
	placeholder,
}: {
	target: ContributionTarget;
	onDone?: () => void;
	/**
	 * Which kind chips to offer. The reader passes an empty list: asking someone
	 * reflecting on a psalm to first classify it as a Fact, an Analysis or a
	 * Correction is encyclopedia vocabulary, and it suppresses posting. With no
	 * chips the post falls back to the unlabelled "comment" kind.
	 */
	kinds?: ContributionKind[];
	placeholder?: string;
}) {
	const t = useTranslations("community");
	const tCommon = useTranslations("common");
	const { requirePremium, onChanged } = useCommunity();
	const [kind, setKind] = useState<ContributionKind>(kinds[0] ?? "comment");
	const [body, setBody] = useState("");
	const [busy, setBusy] = useState(false);

	const visibleKinds = KINDS.filter((k) => kinds.includes(k));

	const submit = async () => {
		if (!requirePremium() || !body.trim() || busy) return;
		setBusy(true);
		const res = await contributionCreateSS({ target, kind, body });
		setBusy(false);
		if (res.ok) {
			track("contribution_posted", { kind, on: target.kind });
			setBody("");
			toast.success(t("contributionPosted"));
			onDone?.();
			onChanged();
		} else if (res.error === "rate") {
			toast.error(t("rateLimited"));
		} else if (res.error === "premium") {
			requirePremium();
		} else if (res.error === "target") {
			toast.error(t("targetNotFound"));
		} else {
			toast.error(t("postFailed"));
		}
	};

	return (
		<div className="space-y-2 rounded-lg border p-3">
			{visibleKinds.length > 0 && (
				<div className="flex gap-1">
					{visibleKinds.map((k) => (
						<button
							key={k}
							type="button"
							onClick={() => setKind(k)}
							className={`text-xs rounded-full px-2.5 py-1 border ${
								kind === k ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground"
							}`}
						>
							{t(`kind.${k}`)}
						</button>
					))}
				</div>
			)}
			<textarea
				value={body}
				onChange={(e) => setBody(e.target.value)}
				rows={3}
				placeholder={placeholder ?? t("contributionPlaceholder")}
				className="w-full rounded border bg-background p-2 text-sm"
			/>
			<div className="flex gap-2">
				<Button size="sm" onClick={submit} disabled={busy}>
					{t("post")}
				</Button>
				{onDone && (
					<Button size="sm" variant="ghost" onClick={onDone}>
						{tCommon("cancel")}
					</Button>
				)}
			</div>
		</div>
	);
}
