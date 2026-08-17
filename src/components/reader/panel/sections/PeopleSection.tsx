"use client";

import { useTranslations } from "next-intl";
import type { EntityLite } from "@/app/common/entity/model/Entity";
import { CharacterName } from "@/components/entity/CharacterName";

/**
 * People the mention index says appear in this chapter. Lives in the panel
 * rather than inside ReadMode so it is available in every reading mode, not
 * only Read.
 */
export function PeopleSection({ people }: { people?: EntityLite[] }) {
	const t = useTranslations("reader");

	if (!people || people.length === 0) {
		return <p className="text-sm text-muted-foreground">{t("panel.noPeople")}</p>;
	}

	return (
		<div className="flex flex-wrap gap-1.5">
			{people.map((p) => (
				<CharacterName key={p.id} slug={p.slug} variant="chip">
					{p.name}
				</CharacterName>
			))}
		</div>
	);
}
