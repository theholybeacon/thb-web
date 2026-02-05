"use client";

import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function PremiumBadge({ className, size = "sm" }: PremiumBadgeProps) {
	const sizeClasses = {
		sm: "text-xs px-1.5 py-0.5",
		md: "text-sm px-2 py-1",
		lg: "text-base px-3 py-1.5",
	};

	const iconSizes = {
		sm: "h-3 w-3",
		md: "h-4 w-4",
		lg: "h-5 w-5",
	};

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 font-medium rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white",
				sizeClasses[size],
				className
			)}
		>
			<Crown className={iconSizes[size]} />
			Premium
		</span>
	);
}
