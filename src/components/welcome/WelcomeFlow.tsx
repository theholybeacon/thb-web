"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { toast } from "@/lib/toast";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { userSetReaderStartSS } from "@/app/common/user/service/server/userSetReaderStartSS";
import {
	DEPTH,
	FAMILIARITY,
	INTERESTS,
	NOTE_MAX,
	TIME,
	parseReaderStart,
	type Depth,
	type Familiarity,
	type Interest,
	type StudyTime,
} from "@/app/common/user/model/ReaderStart";

gsap.registerPlugin(useGSAP);

type Step = "intro" | "familiarity" | "depth" | "interests" | "time" | "preparing";
const QUESTIONS: Step[] = ["familiarity", "depth", "interests", "time"];

/** A single-choice answer moves on by itself, after a beat to see it chosen. */
const ADVANCE_MS = 380;

/**
 * The first thing a new reader sees (/welcome): four questions about where
 * they are with the Bible, then their first study, recommended by the study
 * builder from the answers. Each step animates in with GSAP; a beacon of light
 * behind the questions grows as they answer.
 *
 * `?again=1` opens it with their earlier answers, to change them.
 */
export function WelcomeFlow() {
	const t = useTranslations("welcome");
	const router = useRouter();
	const again = useSearchParams().get("again") === "1";
	const { user, reload } = useLoggedUserContext();

	const [step, setStep] = useState<Step>(again ? "familiarity" : "intro");
	const [familiarity, setFamiliarity] = useState<Familiarity | null>(null);
	const [depth, setDepth] = useState<Depth | null>(null);
	const [interests, setInterests] = useState<Interest[]>([]);
	const [note, setNote] = useState("");
	const [time, setTime] = useState<StudyTime | null>(null);
	const [saving, setSaving] = useState(false);

	const root = useRef<HTMLDivElement>(null);
	const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const prefilled = useRef(false);

	// Answering again: start from what they said last time.
	useEffect(() => {
		if (prefilled.current || !again || !user) return;
		prefilled.current = true;
		const earlier = parseReaderStart(user.readerStart);
		if (!earlier) return;
		setFamiliarity(earlier.familiarity);
		setDepth(earlier.depth);
		setInterests(earlier.interests);
		setNote(earlier.note);
		setTime(earlier.time);
	}, [again, user]);

	useEffect(() => () => {
		if (advanceTimer.current) clearTimeout(advanceTimer.current);
	}, []);

	// Already through it (another device, a stale cache sent them here): home, unless they came to change their answers.
	const through = Boolean(user?.onboardedAt) && !again && !saving;
	useEffect(() => {
		if (through) router.replace("/home");
	}, [through, router]);

	const firstName = user?.name?.split(" ")[0];
	const progress = step === "intro" ? 0 : step === "preparing" ? 1 : (QUESTIONS.indexOf(step) + 1) / (QUESTIONS.length + 1);

	// The beacon breathes and its rays turn, always; reduced motion keeps it still.
	useGSAP(() => {
		const mm = gsap.matchMedia();
		mm.add("(prefers-reduced-motion: no-preference)", () => {
			gsap.to("[data-beacon-rays]", { rotate: 360, duration: 90, repeat: -1, ease: "none" });
			gsap.to("[data-beacon-core]", { scale: 1.08, duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
		});
		return () => mm.revert();
	}, { scope: root });

	// Every step comes in the same way: its parts rise in, one after another.
	useGSAP(() => {
		const mm = gsap.matchMedia();
		mm.add("(prefers-reduced-motion: no-preference)", () => {
			gsap.fromTo(
				"[data-step] [data-rise]",
				{ y: 28, opacity: 0, filter: "blur(6px)" },
				{ y: 0, opacity: 1, filter: "blur(0px)", duration: 0.7, stagger: 0.07, ease: "power3.out" },
			);
		});
		gsap.to("[data-beacon]", { scale: 0.75 + progress * 0.55, opacity: 0.45 + progress * 0.55, duration: 1.2, ease: "power2.out" });
		gsap.to("[data-progress]", { scaleX: progress, duration: 0.8, ease: "power2.out" });
		return () => mm.revert();
	}, { scope: root, dependencies: [step], revertOnUpdate: false });

	function goTo(next: Step) {
		if (advanceTimer.current) clearTimeout(advanceTimer.current);
		setStep(next);
	}

	function choose<T>(set: (v: T) => void, value: T, next: Step) {
		set(value);
		if (advanceTimer.current) clearTimeout(advanceTimer.current);
		advanceTimer.current = setTimeout(() => setStep(next), ADVANCE_MS);
	}

	function toggleInterest(interest: Interest) {
		setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
	}

	function back() {
		const at = QUESTIONS.indexOf(step);
		goTo(at <= 0 ? "intro" : QUESTIONS[at - 1]);
	}

	async function finish(chosenTime: StudyTime) {
		setTime(chosenTime);
		if (!familiarity || !depth) return;
		goTo("preparing");
		setSaving(true);
		const answers = { familiarity, depth, interests, note, time: chosenTime };
		try {
			const { ok } = await userSetReaderStartSS(answers);
			if (!ok) throw new Error("not saved");
			track("onboarding_completed", { familiarity, depth, time: chosenTime, interests: interests.length, note: note.trim().length > 0, again });
			await reload();
			// Long enough to see the beacon light up; the builder opens with their first study already proposed.
			await new Promise((r) => setTimeout(r, 900));
			router.replace("/study/create");
		} catch {
			setSaving(false);
			toast.error(t("saveFailed"));
			goTo("time");
		}
	}

	async function skip() {
		setSaving(true);
		try {
			await userSetReaderStartSS(null);
			track("onboarding_skipped", { at: step });
			await reload();
		} finally {
			router.replace("/home");
		}
	}

	return (
		<div ref={root} className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-background">
			{/* The beacon: a soft core of light with slow rays, growing as they answer. */}
			<div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
				<div data-beacon className="relative h-[900px] w-[900px] scale-75 opacity-40">
					<div
						data-beacon-rays
						className="absolute inset-0 rounded-full opacity-60"
						style={{
							background:
								"repeating-conic-gradient(from 0deg, hsl(var(--primary) / 0.10) 0deg 6deg, transparent 6deg 30deg)",
							maskImage: "radial-gradient(circle, black 0%, transparent 65%)",
							WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 65%)",
						}}
					/>
					<div data-beacon-core className="absolute inset-[30%] rounded-full bg-primary/20 blur-3xl" />
					<div className="absolute inset-[42%] rounded-full bg-highlight/20 blur-2xl" />
				</div>
			</div>

			{/* Progress and the way out */}
			<header className="relative z-10 flex items-center justify-between gap-4 px-5 pt-5 md:px-8">
				<div className="w-24">
					{QUESTIONS.includes(step) && (
						<button type="button" onClick={back} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
							<ArrowLeft className="h-4 w-4" />
							{t("back")}
						</button>
					)}
				</div>
				<div className="h-1 max-w-xs flex-1 overflow-hidden rounded-full bg-muted">
					<div data-progress className="h-full origin-left scale-x-0 rounded-full bg-primary" />
				</div>
				<div className="w-24 text-right">
					{step !== "preparing" && (
						<button type="button" onClick={skip} disabled={saving} className="text-sm text-muted-foreground hover:text-foreground">
							{t("skip")}
						</button>
					)}
				</div>
			</header>

			<main className="relative z-10 flex flex-1 items-center justify-center px-5 py-10 md:px-8">
				<div key={step} data-step={step} className="w-full max-w-2xl" data-testid={`welcome-${step}`}>
					{step === "intro" && (
						<div className="space-y-6 text-center">
							<p data-rise className="text-sm font-medium uppercase tracking-[0.2em] text-primary">The Holy Beacon</p>
							<h1 data-rise className="text-4xl font-bold tracking-tight md:text-6xl">
								{firstName ? t("intro.title", { name: firstName }) : t("intro.titleNoName")}
							</h1>
							<p data-rise className="mx-auto max-w-lg text-lg text-muted-foreground">{t("intro.body")}</p>
							<div data-rise>
								<Button size="lg" className="glow-sm" onClick={() => goTo("familiarity")}>
									{t("intro.begin")}
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</div>
							<p data-rise className="text-xs text-muted-foreground">{t("intro.time")}</p>
						</div>
					)}

					{step === "familiarity" && (
						<Question title={t("familiarity.title")} hint={t("familiarity.hint")}>
							<div className="grid gap-3 sm:grid-cols-2">
								{FAMILIARITY.map((value) => (
									<Choice
										key={value}
										label={t(`familiarity.options.${value}.label`)}
										description={t(`familiarity.options.${value}.description`)}
										selected={familiarity === value}
										onSelect={() => choose(setFamiliarity, value, "depth")}
									/>
								))}
							</div>
						</Question>
					)}

					{step === "depth" && (
						<Question title={t("depth.title")} hint={t("depth.hint")}>
							<div className="grid gap-3 sm:grid-cols-3">
								{DEPTH.map((value) => (
									<Choice
										key={value}
										label={t(`depth.options.${value}.label`)}
										description={t(`depth.options.${value}.description`)}
										selected={depth === value}
										onSelect={() => choose(setDepth, value, "interests")}
									/>
								))}
							</div>
						</Question>
					)}

					{step === "interests" && (
						<Question title={t("interests.title")} hint={t("interests.hint")}>
							<div className="flex flex-wrap justify-center gap-2" role="group" aria-label={t("interests.title")}>
								{INTERESTS.map((value) => {
									const on = interests.includes(value);
									return (
										<button
											key={value}
											type="button"
											data-rise
											aria-pressed={on}
											onClick={() => toggleInterest(value)}
											className={cn(
												"inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-all duration-200",
												on ? "border-primary bg-primary/15 text-foreground shadow-sm" : "bg-card/70 backdrop-blur hover:border-primary/50",
											)}
										>
											{on && <Check className="h-3.5 w-3.5 text-primary" />}
											{t(`interests.options.${value}`)}
										</button>
									);
								})}
							</div>
							<div data-rise className="space-y-2">
								<label htmlFor="welcome-note" className="text-sm font-medium">{t("interests.noteLabel")}</label>
								<textarea
									id="welcome-note"
									value={note}
									maxLength={NOTE_MAX}
									onChange={(e) => setNote(e.target.value)}
									rows={3}
									placeholder={t("interests.notePlaceholder")}
									className="w-full resize-none rounded-xl border bg-card/80 px-4 py-3 text-base backdrop-blur focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
								/>
							</div>
							<div data-rise className="flex justify-center">
								<Button size="lg" onClick={() => goTo("time")} disabled={interests.length === 0 && !note.trim()}>
									{t("continue")}
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</div>
						</Question>
					)}

					{step === "time" && (
						<Question title={t("time.title")} hint={t("time.hint")}>
							<div className="grid gap-3 sm:grid-cols-3">
								{TIME.map((value) => (
									<Choice
										key={value}
										label={t(`time.options.${value}.label`)}
										description={t(`time.options.${value}.description`)}
										selected={time === value}
										onSelect={() => void finish(value)}
									/>
								))}
							</div>
						</Question>
					)}

					{step === "preparing" && (
						<div className="space-y-5 text-center" role="status">
							<div data-rise className="flex justify-center">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
							<h1 data-rise className="text-3xl font-bold tracking-tight md:text-4xl">{t("preparing.title")}</h1>
							<p data-rise className="mx-auto max-w-md text-muted-foreground">{t("preparing.body")}</p>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

function Question({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
	return (
		<div className="space-y-8">
			<div className="space-y-3 text-center">
				<h1 data-rise className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>
				<p data-rise className="text-muted-foreground md:text-lg">{hint}</p>
			</div>
			{children}
		</div>
	);
}

function Choice({ label, description, selected, onSelect }: { label: string; description: string; selected: boolean; onSelect: () => void }) {
	const ref = useRef<HTMLButtonElement>(null);
	const { contextSafe } = useGSAP({ scope: ref });
	const pulse = contextSafe(() => {
		gsap.fromTo(ref.current, { scale: 0.97 }, { scale: 1, duration: 0.45, ease: "back.out(3)" });
	});
	return (
		<button
			ref={ref}
			type="button"
			data-rise
			aria-pressed={selected}
			onClick={() => {
				pulse();
				onSelect();
			}}
			className={cn(
				"group flex flex-col items-start gap-1 rounded-2xl border p-5 text-left transition-colors duration-200",
				selected ? "border-primary bg-primary/10 shadow-lg" : "bg-card/70 backdrop-blur hover:border-primary/50 hover:bg-card",
			)}
		>
			<span className="flex w-full items-center justify-between gap-2 font-semibold">
				{label}
				<span className={cn("flex h-5 w-5 items-center justify-center rounded-full border transition-colors", selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30")}>
					{selected && <Check className="h-3 w-3" />}
				</span>
			</span>
			<span className="text-sm text-muted-foreground">{description}</span>
		</button>
	);
}
