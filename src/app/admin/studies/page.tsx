import { requireAdminPage } from "@/app/admin/requireAdminPage";
import { adminCatalogGetSS } from "@/app/common/admin/service/server/adminCatalogGetSS";
import { STEP_KINDS } from "@/app/common/studyStep/model/StepContent";

/**
 * Every plan and story in the global catalog. Read-only: the catalog is
 * written in code (src/app/common/study/model) and seeded with
 * `npm run seed:studies`, so it can be reviewed in a diff.
 */
export default async function AdminCatalogPage() {
	await requireAdminPage();
	const catalog = await adminCatalogGetSS();

	return (
		<div className="mx-auto max-w-6xl space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Catalog</h1>
				<p className="text-sm text-muted-foreground">
					The ready-made plans and stories every Premium reader can start. They are written in code and seeded with{" "}
					<code className="rounded bg-muted px-1">npm run seed:studies</code>.
				</p>
			</div>

			<div className="overflow-x-auto rounded-lg border bg-card">
				<table className="w-full text-sm">
					<thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
						<tr>
							<th className="px-4 py-3">#</th>
							<th className="px-4 py-3">Study</th>
							<th className="px-4 py-3">Kind</th>
							<th className="px-4 py-3">Language</th>
							<th className="px-4 py-3 text-right">Steps</th>
							<th className="px-4 py-3 text-right">Chapters</th>
							<th className="px-4 py-3">Made of</th>
						</tr>
					</thead>
					<tbody>
						{catalog.map((study) => (
							<tr key={study.id} className="border-b last:border-0">
								<td className="px-4 py-3 text-muted-foreground">{study.sortOrder}</td>
								<td className="px-4 py-3">
									<p className="font-medium">{study.name}</p>
									<p className="text-xs text-muted-foreground">{study.slug}</p>
								</td>
								<td className="px-4 py-3 capitalize">{study.kind}</td>
								<td className="px-4 py-3 uppercase">{study.language}</td>
								<td className="px-4 py-3 text-right">{study.steps}</td>
								<td className="px-4 py-3 text-right">{study.chapters}</td>
								<td className="px-4 py-3 text-xs text-muted-foreground">
									{STEP_KINDS.filter((kind) => study.stepKinds[kind])
										.map((kind) => `${study.stepKinds[kind]} ${kind}`)
										.join(" · ")}
								</td>
							</tr>
						))}
						{catalog.length === 0 && (
							<tr>
								<td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
									The catalog is empty. Run <code>npm run seed:studies</code>.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
