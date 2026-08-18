"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { JourneyScopeOption } from "@/app/common/completion/model/Completion";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { JourneyScopeValue } from "@/lib/journeyScope";

/** Above this many translations the pill row stops fitting and becomes a picker. */
const PILL_LIMIT = 3;

type Props = {
	options: JourneyScopeOption[];
	value: JourneyScopeValue;
	onChange?: (next: JourneyScopeValue) => void;
	/**
	 * Render each option as a link instead of a callback. The public profile has no
	 * client state to hold the choice — its zoom level IS the route.
	 */
	hrefFor?: (slug: JourneyScopeValue) => string;
	className?: string;
};

/**
 * The zoom control: all translations at once, or one at a time.
 *
 * Only translations the user has actually recorded progress in are offered —
 * the full catalogue is ~400 Bibles, and a scope with nothing in it is a dead
 * end rather than a choice. Below a handful of options this is a pill row (the
 * same shape as the notes filter); beyond that it collapses into the searchable
 * picker used elsewhere for Bibles, because a dozen pills wrap into a wall.
 */
export function JourneyScopeSwitcher({ options, value, onChange, hrefFor, className }: Props) {
	const t = useTranslations("journey");

	// One translation and nothing else is not a choice — it is the only thing they
	// have read, and the two views would show identical numbers.
	if (options.length === 0) return null;

	const selected = value ? options.find((o) => o.slug === value) : undefined;
	const label = selected ? selected.label : t("scopeAll");

	if (options.length <= PILL_LIMIT) {
		return (
			<div className={cn("flex flex-wrap items-center gap-1.5", className)}>
				<ScopePill
					active={!value}
					slug={null}
					label={t("scopeAll")}
					icon
					onChange={onChange}
					hrefFor={hrefFor}
				/>
				{options.map((o) => (
					<ScopePill
						key={o.bibleId}
						active={value === o.slug}
						slug={o.slug}
						label={o.label}
						count={o.chapters}
						onChange={onChange}
						hrefFor={hrefFor}
					/>
				))}
			</div>
		);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className={cn("h-9 justify-between gap-2", className)}>
					<span className="flex min-w-0 items-center gap-2">
						{!value && <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />}
						<span className="truncate">{label}</span>
					</span>
					<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-0" align="start">
				<Command>
					<CommandInput placeholder={t("scopeSearch")} />
					<CommandList>
						<CommandEmpty>{t("scopeEmpty")}</CommandEmpty>
						<CommandGroup>
							<ScopeItem
								slug={null}
								label={t("scopeAll")}
								active={!value}
								onChange={onChange}
								hrefFor={hrefFor}
							/>
							{options.map((o) => (
								<ScopeItem
									key={o.bibleId}
									slug={o.slug}
									label={o.label}
									count={o.chapters}
									active={value === o.slug}
									onChange={onChange}
									hrefFor={hrefFor}
								/>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

type OptionProps = {
	slug: JourneyScopeValue;
	label: string;
	active: boolean;
	count?: number;
	icon?: boolean;
	onChange?: (next: JourneyScopeValue) => void;
	hrefFor?: (slug: JourneyScopeValue) => string;
};

function ScopePill({ slug, label, active, count, icon, onChange, hrefFor }: OptionProps) {
	const className = cn(
		"h-8 gap-1.5",
		active && "bg-primary/10 text-primary hover:bg-primary/15",
	);
	const content = (
		<>
			{icon && <Globe className="h-3.5 w-3.5" />}
			<span className="max-w-[12rem] truncate">{label}</span>
			{count !== undefined && (
				<span className="text-xs text-muted-foreground">{count}</span>
			)}
		</>
	);

	if (hrefFor) {
		return (
			<Button asChild variant={active ? "secondary" : "ghost"} size="sm" className={className}>
				<Link href={hrefFor(slug)}>{content}</Link>
			</Button>
		);
	}

	return (
		<Button
			variant={active ? "secondary" : "ghost"}
			size="sm"
			className={className}
			onClick={() => onChange?.(slug)}
		>
			{content}
		</Button>
	);
}

function ScopeItem({ slug, label, active, count, onChange, hrefFor }: OptionProps) {
	const body = (
		<>
			<Check className={cn("mr-2 h-4 w-4 shrink-0", active ? "opacity-100" : "opacity-0")} />
			<span className="min-w-0 flex-1 truncate">{label}</span>
			{count !== undefined && (
				<span className="ml-2 shrink-0 text-xs text-muted-foreground">{count}</span>
			)}
		</>
	);

	// `value` is the label so the Command's own filter searches what is on screen.
	return (
		<CommandItem value={label} onSelect={() => onChange?.(slug)} className="cursor-pointer">
			{hrefFor ? (
				<Link href={hrefFor(slug)} className="flex min-w-0 flex-1 items-center">
					{body}
				</Link>
			) : (
				body
			)}
		</CommandItem>
	);
}
