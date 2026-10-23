import { requireAdminPage } from "@/app/admin/requireAdminPage";
import Link from "next/link";
import { adminCatalogGetSS } from "@/app/common/admin/service/server/adminCatalogGetSS";
import { mediaSourceListSS } from "@/app/common/mediaSource/service/server/mediaSourceSS";
import { STEP_KINDS } from "@/app/common/studyStep/model/StepContent";

/** At a glance: what the catalog holds and which media sources are approved. */
export default async function AdminOverviewPage() {
	await requireAdminPage();
	const [catalog, sources] = await Promise.all([adminCatalogGetSS(), mediaSourceListSS()]);

	const plans = catalog.filter((s) => s.kind === "plan").length;
	const stories = catalog.filter((s) => s.kind === "story").length;
	const stepKinds = STEP_KINDS.map((kind) => ({
		kind,
		count: catalog.reduce((total, s) => total + (s.stepKinds[kind] ?? 0), 0),
	}));

	return (
		<div className="mx-auto max-w-5xl space-y-8">
			<div>
				<h1 className="text-2xl font-bold">Overview</h1>
				<p className="text-sm text-muted-foreground">The Holy Beacon&apos;s catalog and the sources its studies draw on.</p>
			</div>

			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<Stat label="Plans in the catalog" value={plans} href="/admin/studies" />
				<Stat label="Stories in the catalog" value={stories} href="/admin/studies" />
				<Stat label="Steps in the catalog" value={catalog.reduce((t, s) => t + s.steps, 0)} href="/admin/studies" />
				<Stat label="Media sources" value={sources.length} href="/admin/sources" />
			</div>

			<section className="rounded-lg border bg-card p-6">
				<h2 className="mb-4 text-lg font-semibold">Steps by kind</h2>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
					{stepKinds.map(({ kind, count }) => (
						<div key={kind} className="rounded-md border bg-background px-3 py-2">
							<p className="text-lg font-semibold">{count}</p>
							<p className="text-xs capitalize text-muted-foreground">{kind}</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
	return (
		<Link href={href} className="rounded-lg border bg-card p-5 transition-colors hover:border-primary/50">
			<p className="text-3xl font-bold">{value}</p>
			<p className="mt-1 text-sm text-muted-foreground">{label}</p>
		</Link>
	);
}
