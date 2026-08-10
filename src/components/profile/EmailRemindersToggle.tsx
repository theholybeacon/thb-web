"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { userSetEmailRemindersSS } from "@/app/common/user/service/server/userSetEmailRemindersSS";
import { toast } from "@/lib/toast";

/**
 * In-app opt-out for the daily reminder emails. The other way out is the
 * unsubscribe link in every email, which needs no session.
 */
export function EmailRemindersToggle() {
	const t = useTranslations();
	const { user, reload } = useLoggedUserContext();
	const [enabled, setEnabled] = useState(true);

	useEffect(() => {
		if (user) setEnabled(user.emailRemindersEnabled ?? true);
	}, [user]);

	const mutation = useMutation({
		mutationFn: async (next: boolean) => {
			const res = await userSetEmailRemindersSS(next);
			if (!res.ok) throw new Error("failed");
			return next;
		},
		onSuccess: (next) => {
			setEnabled(next);
			reload?.();
			toast.success(t("toast.saved"));
		},
		onError: () => toast.error(t("toast.failed")),
	});

	return (
		<div className="space-y-2">
			<Label className="flex items-center gap-2">
				<Bell className="h-4 w-4" />
				{t("profile.notifications")}
			</Label>
			<div className="flex items-start gap-3 rounded-lg border p-4">
				<Checkbox
					id="emailReminders"
					checked={enabled}
					disabled={mutation.isPending}
					onCheckedChange={(checked) => mutation.mutate(checked === true)}
				/>
				<div className="space-y-1 leading-none">
					<label htmlFor="emailReminders" className="text-sm font-medium cursor-pointer">
						{t("profile.emailReminders")}
					</label>
					<p className="text-xs text-muted-foreground">{t("profile.emailRemindersHint")}</p>
				</div>
			</div>
		</div>
	);
}
