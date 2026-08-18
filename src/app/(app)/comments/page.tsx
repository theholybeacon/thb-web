import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app";
import { PremiumGate } from "@/components/premium";
import { CommentsFeed } from "@/components/comments";

// A gated app surface, never a search result.
export const metadata: Metadata = {
	title: "Comments | The Holy Beacon",
	robots: { index: false, follow: false },
};

/**
 * Kept a server component — unlike the notes page, which is "use client" top to
 * bottom and therefore cannot export metadata. The Suspense boundary is not
 * optional: useSearchParams inside CommentsFeed de-opts the whole route to
 * client rendering without one.
 */
export default function CommentsPage() {
	return (
		<AppShell>
			<PremiumGate>
				<Suspense fallback={null}>
					<CommentsFeed />
				</Suspense>
			</PremiumGate>
		</AppShell>
	);
}
