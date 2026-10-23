"use client";

import { useTranslations } from "next-intl";
import { Feather, Layers } from "lucide-react";
import { HOLY_BEACON_CREATOR, isStudyKind } from "@/app/common/study/model/StudyKind";
import type { StudyCreator } from "@/app/common/study/model/Study";

/**
 * "Story · By The Holy Beacon": what a study is and who designed it. The
 * creator is not whoever is running it: an adopted plan is the reader's copy,
 * but The Holy Beacon still designed it.
 */
export function StudyByline({
	kind,
	creatorId,
	creator,
	currentUserId,
}: {
	kind: string;
	creatorId: string | null;
	creator?: StudyCreator;
	currentUserId?: string | null;
}) {
	const t = useTranslations("study");
	const studyKind = isStudyKind(kind) ? kind : "plan";
	const by = creatorId === null
		? t("by", { name: HOLY_BEACON_CREATOR })
		: creatorId === currentUserId
		? t("byYou")
		: t("by", { name: creator?.name ?? "" });

	return (
		<span className="inline-flex flex-wrap items-center gap-2 text-xs" data-testid="study-byline">
			<span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary">
				{studyKind === "story" ? <Feather className="h-3 w-3" /> : <Layers className="h-3 w-3" />}
				{t(`kind.${studyKind}`)}
			</span>
			<span className="text-muted-foreground">{by}</span>
		</span>
	);
}
