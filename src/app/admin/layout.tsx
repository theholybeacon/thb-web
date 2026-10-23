import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Library, LayoutDashboard, Shield, Clapperboard } from "lucide-react";
import { requireAdminPage } from "./requireAdminPage";

export const metadata: Metadata = {
	title: "Admin · The Holy Beacon",
	robots: { index: false, follow: false },
};

// Every request re-checks who is asking; nothing here may be cached.
export const dynamic = "force-dynamic";

const NAV = [
	{ href: "/admin", label: "Overview", icon: LayoutDashboard },
	{ href: "/admin/studies", label: "Catalog", icon: Library },
	{ href: "/admin/sources", label: "Media sources", icon: Clapperboard },
];

/**
 * The admin panel: its own layout, not the reader's app shell. Only accounts
 * with user.isAdmin, which is set by hand in the database, get past this; to
 * everyone else /admin does not exist.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	await requireAdminPage();

	return (
		<div className="flex min-h-screen bg-muted/30">
			<aside className="hidden w-60 flex-shrink-0 flex-col border-r bg-card md:flex">
				<div className="flex items-center gap-2 border-b px-5 py-4">
					<Shield className="h-5 w-5 text-primary" />
					<div>
						<p className="text-sm font-semibold leading-tight">The Holy Beacon</p>
						<p className="text-xs text-muted-foreground">Admin</p>
					</div>
				</div>
				<nav className="flex-1 space-y-1 p-3" aria-label="Admin">
					{NAV.map(({ href, label, icon: Icon }) => (
						<Link
							key={href}
							href={href}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
						>
							<Icon className="h-4 w-4" />
							{label}
						</Link>
					))}
				</nav>
				<Link href="/home" className="flex items-center gap-2 border-t px-5 py-3 text-sm text-muted-foreground hover:text-foreground">
					<ArrowLeft className="h-4 w-4" />
					Back to the app
				</Link>
			</aside>
			<div className="flex min-w-0 flex-1 flex-col">
				<header className="flex items-center gap-3 border-b bg-card px-4 py-3 md:hidden">
					<Shield className="h-5 w-5 text-primary" />
					<nav className="flex gap-3 text-sm" aria-label="Admin">
						{NAV.map(({ href, label }) => (
							<Link key={href} href={href} className="text-muted-foreground hover:text-foreground">{label}</Link>
						))}
					</nav>
				</header>
				<main className="flex-1 p-6 lg:p-10">{children}</main>
			</div>
		</div>
	);
}
