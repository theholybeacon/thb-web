"use client";

import { cn } from "@/lib/utils";

/**
 * A circular percentage dial.
 *
 * Hand-rolled SVG rather than a charting dependency — the project has no
 * charting library and every existing "chart" here is built from primitives, so
 * pulling one in for a single arc would be a poor trade.
 */
export function ProgressRing({
	percent,
	size = 132,
	strokeWidth = 10,
	children,
	className,
}: {
	percent: number;
	size?: number;
	strokeWidth?: number;
	children?: React.ReactNode;
	className?: string;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const clamped = Math.max(0, Math.min(100, percent));
	// A non-zero reading should always show a visible arc, so the very first
	// chapter (0.1%) does not render as an empty ring.
	const shown = clamped > 0 ? Math.max(clamped, 0.8) : 0;
	const offset = circumference - (shown / 100) * circumference;

	return (
		<div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
			<svg width={size} height={size} className="-rotate-90" aria-hidden="true">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					strokeWidth={strokeWidth}
					className="stroke-muted"
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					className="stroke-primary transition-[stroke-dashoffset] duration-700"
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
		</div>
	);
}
