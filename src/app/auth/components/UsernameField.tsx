"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AtSign, Check, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeUsername, validateUsername } from "@/lib/username";
import { usernameCheckSS } from "@/app/common/user/service/server/usernameCheckSS";

export type UsernameStatus =
	| "empty"
	| "checking"
	| "available"
	| "taken"
	| "tooShort"
	| "tooLong"
	| "invalid";

interface UsernameFieldProps {
	value: string;
	onChange: (value: string) => void;
	/** Fires on every status transition so the parent can gate its submit button. */
	onStatusChange?: (status: UsernameStatus) => void;
	disabled?: boolean;
	autoFocus?: boolean;
	id?: string;
}

const DEBOUNCE_MS = 400;

/**
 * The one place a handle is picked — sign-up, the OAuth continuation step and
 * the profile page all mount this, so the normalization and the availability
 * rules can never drift between them.
 *
 * Input is normalized as it is typed: what you see is exactly what ends up in
 * the /u/[username] URL, with no surprise rewrite on submit.
 */
export function UsernameField({
	value,
	onChange,
	onStatusChange,
	disabled,
	autoFocus,
	id = "username",
}: UsernameFieldProps) {
	const t = useTranslations("auth.username");
	const [status, setStatus] = useState<UsernameStatus>("empty");

	// Only the newest lookup may write the status — a slow early request must not
	// overwrite the verdict for what the user has since typed.
	const requestId = useRef(0);
	const onStatusChangeRef = useRef(onStatusChange);
	onStatusChangeRef.current = onStatusChange;

	useEffect(() => {
		onStatusChangeRef.current?.(status);
	}, [status]);

	useEffect(() => {
		const current = ++requestId.current;

		if (!value) {
			setStatus("empty");
			return;
		}

		const invalid = validateUsername(value);
		if (invalid) {
			setStatus(invalid);
			return;
		}

		setStatus("checking");
		const timer = setTimeout(async () => {
			try {
				const result = await usernameCheckSS(value);
				if (requestId.current !== current) return;
				setStatus(result.available ? "available" : (result.reason ?? "taken"));
			} catch {
				// A failed lookup must not block sign-up: Clerk still rejects a
				// duplicate on submit, which is the authoritative check.
				if (requestId.current === current) setStatus("available");
			}
		}, DEBOUNCE_MS);

		return () => clearTimeout(timer);
	}, [value]);

	const message =
		status === "checking" ? t("checking")
		: status === "available" ? t("available")
		: status === "empty" ? t("hint")
		: t(status);

	const tone =
		status === "available" ? "text-green-600 dark:text-green-500"
		: status === "checking" || status === "empty" ? "text-muted-foreground"
		: "text-destructive";

	return (
		<div className="space-y-2">
			<Label htmlFor={id} className="flex items-center gap-2">
				<AtSign className="h-4 w-4" />
				{t("label")}
			</Label>
			<div className="relative">
				<Input
					id={id}
					type="text"
					value={value}
					onChange={(e) => onChange(normalizeUsername(e.target.value))}
					placeholder={t("placeholder")}
					required
					disabled={disabled}
					autoFocus={autoFocus}
					autoComplete="username"
					className="pr-10"
				/>
				<span className="absolute right-3 top-1/2 -translate-y-1/2">
					{status === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
					{status === "available" && <Check className="h-4 w-4 text-green-600 dark:text-green-500" />}
					{(status === "taken" || status === "invalid" || status === "tooLong") && (
						<X className="h-4 w-4 text-destructive" />
					)}
				</span>
			</div>
			<p className={`text-xs ${tone}`}>{message}</p>
		</div>
	);
}
