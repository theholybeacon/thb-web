"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Flag } from "lucide-react";
import { toast } from "@/lib/toast";
import { track } from "@/lib/analytics";
import { entityContentFlagSS } from "@/app/common/entity/service/server/entityContentFlagSS";

/** Lets a signed-in user report a generated section as inaccurate. */
export function FlagButton({ entityContentId, section }: { entityContentId: string; section: string }) {
	const t = useTranslations("people");
	const [busy, setBusy] = useState(false);
	const [done, setDone] = useState(false);

	const onClick = async () => {
		if (busy || done) return;
		setBusy(true);
		try {
			const res = await entityContentFlagSS(entityContentId, section);
			if (res.ok) {
				setDone(true);
				track("person_content_flagged", { section });
				toast.success(t("reported"));
			} else {
				toast.error(t("signInToReport"));
			}
		} finally {
			setBusy(false);
		}
	};

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={busy || done}
			title={t("reportInaccuracy")}
			className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary disabled:opacity-50"
		>
			<Flag className="h-3 w-3" />
			{done ? t("reportedLabel") : t("report")}
		</button>
	);
}
