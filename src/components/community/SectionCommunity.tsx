"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquarePlus, Users } from "lucide-react";
import { UpgradeModal } from "@/components/premium/UpgradeModal";
import type { RefLinkMap } from "@/components/entity/CitationLinks";
import type { ContributionFull, ContributionSection } from "@/app/common/community/model/Community";
import { CommunityContext } from "./CommunityContext";
import { ContributionItem } from "./ContributionItem";
import { AddContributionForm } from "./AddContributionForm";

/**
 * Collapsible community strip for one (entity, section): lists contributions and
 * an "Add note" affordance. Reading is open to all; writing/voting are premium
 * (non-premium actions open the upgrade modal).
 */
export function SectionCommunity({
	entityId,
	section,
	contributions,
	linkMap,
	isPremium,
	defaultOpen = false,
}: {
	entityId: string;
	section: ContributionSection;
	contributions: ContributionFull[];
	linkMap: RefLinkMap;
	isPremium: boolean;
	defaultOpen?: boolean;
}) {
	const router = useRouter();
	const [open, setOpen] = useState(defaultOpen);
	const [adding, setAdding] = useState(false);
	const [upgradeOpen, setUpgradeOpen] = useState(false);

	const requirePremium = () => {
		if (isPremium) return true;
		setUpgradeOpen(true);
		return false;
	};

	const count = contributions.length;

	return (
		<CommunityContext.Provider value={{ isPremium, requirePremium, onChanged: () => router.refresh() }}>
			<div className="mt-2 border-t pt-2">
				<div className="flex items-center justify-between">
					<button
						className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
						onClick={() => setOpen((v) => !v)}
					>
						<Users className="h-3.5 w-3.5" /> Community{count > 0 ? ` (${count})` : ""}
					</button>
					<button
						className="text-xs text-primary hover:underline inline-flex items-center gap-1"
						onClick={() => {
							if (requirePremium()) {
								setOpen(true);
								setAdding(true);
							}
						}}
					>
						<MessageSquarePlus className="h-3.5 w-3.5" /> Add note
					</button>
				</div>

				{open && (
					<div className="mt-2">
						{adding && (
							<AddContributionForm
								target={{ kind: "entity", entityId, section }}
								onDone={() => setAdding(false)}
							/>
						)}
						{count === 0 && !adding && <p className="text-xs text-muted-foreground py-1">No community notes yet.</p>}
						{contributions.map((c) => (
							<ContributionItem key={c.id} contribution={c} linkMap={linkMap} />
						))}
					</div>
				)}
			</div>
			{upgradeOpen && <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />}
		</CommunityContext.Provider>
	);
}
