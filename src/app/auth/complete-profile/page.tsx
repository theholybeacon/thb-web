"use client";

import { useEffect, useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthSidePanel } from "../components/AuthSidePanel";
import { UsernameField, UsernameStatus } from "../components/UsernameField";
import { normalizeUsername } from "@/lib/username";
import { toast } from "@/lib/toast";

/**
 * Where an OAuth sign-up lands when Clerk still needs a handle.
 *
 * Reached via `continueSignUpUrl` in /sso-callback. Without this page clerk-js
 * sends the user to Clerk's hosted Account Portal to pick a username, which is
 * a jarring hand-off to a domain that is not ours.
 */
export default function CompleteProfilePage() {
	const t = useTranslations("auth.username");
	const tSignUp = useTranslations("auth.signUp");
	const tCommon = useTranslations("common");
	const { isLoaded, signUp, setActive } = useSignUp();
	const router = useRouter();

	const [username, setUsername] = useState("");
	const [status, setStatus] = useState<UsernameStatus>("empty");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [prefilled, setPrefilled] = useState(false);

	// No sign-up in flight means the user opened this URL directly (or the
	// attempt expired) — there is nothing here to complete.
	useEffect(() => {
		if (isLoaded && !signUp?.status) router.replace("/auth/sign-up");
	}, [isLoaded, signUp?.status, router]);

	// Seed the field from whatever the provider gave us, so most people only
	// have to accept a suggestion.
	useEffect(() => {
		if (!isLoaded || !signUp || prefilled) return;
		const suggestion =
			signUp.username ||
			[signUp.firstName, signUp.lastName].filter(Boolean).join(" ") ||
			signUp.emailAddress?.split("@")[0] ||
			"";
		setUsername(normalizeUsername(suggestion));
		setPrefilled(true);
	}, [isLoaded, signUp, prefilled]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!isLoaded || !signUp) return;

		setIsLoading(true);
		setError("");

		try {
			const result = await signUp.update({ username });
			if (result.status === "complete") {
				await setActive({ session: result.createdSessionId });
				toast.success(tSignUp("title"));
				router.push("/home");
			} else {
				toast.error(tCommon("error"));
				setError(tCommon("error"));
			}
		} catch (err: unknown) {
			const clerkError = err as { errors?: Array<{ code: string; message: string }> };
			const first = clerkError.errors?.[0];
			const message = first?.code === "form_identifier_exists" ? t("taken") : (first?.message || tCommon("error"));
			toast.error(message);
			setError(message);
		} finally {
			setIsLoading(false);
		}
	};

	if (!isLoaded) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen">
			<AuthSidePanel
				title={tSignUp("beginJourney")}
				subtitle={tSignUp("beginJourneySubtitle")}
			/>

			<div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-background">
				<div className="w-full max-w-md">
					<div className="mb-8 text-center lg:text-left">
						<h2 className="text-2xl font-bold mb-2">{t("stepTitle")}</h2>
						<p className="text-muted-foreground">{t("stepSubtitle")}</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
								{error}
							</div>
						)}

						<UsernameField
							value={username}
							onChange={setUsername}
							onStatusChange={setStatus}
							disabled={isLoading}
							autoFocus
						/>

						<Button type="submit" className="w-full" disabled={isLoading || status !== "available"}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t("saving")}
								</>
							) : (
								t("continue")
							)}
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
