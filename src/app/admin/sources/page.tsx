import { requireAdminPage } from "@/app/admin/requireAdminPage";
import { ExternalLink, Trash2 } from "lucide-react";
import { mediaSourceDeleteSS, mediaSourceListSS } from "@/app/common/mediaSource/service/server/mediaSourceSS";
import { Button } from "@/components/ui/button";
import { MediaSourceForm } from "../components/MediaSourceForm";

const KIND_LABEL: Record<string, string> = {
	youtube_channel: "YouTube channel",
	image_archive: "Image archive",
	website: "Website",
};

/**
 * The places studies may take images and videos from. Whoever writes the
 * catalog's stories works from this list: a video step only uses a channel
 * listed here, and an image step only a public-domain source listed here.
 */
export default async function AdminSourcesPage() {
	await requireAdminPage();
	const sources = await mediaSourceListSS();

	return (
		<div className="mx-auto max-w-5xl space-y-8">
			<div>
				<h1 className="text-2xl font-bold">Media sources</h1>
				<p className="text-sm text-muted-foreground">
					The approved YouTube channels, image archives and websites the catalog&apos;s stories draw their videos and images from.
				</p>
			</div>

			<section className="rounded-lg border bg-card p-6">
				<h2 className="mb-4 text-lg font-semibold">Add a source</h2>
				<MediaSourceForm />
			</section>

			<section className="rounded-lg border bg-card">
				<h2 className="border-b px-6 py-4 text-lg font-semibold">Approved sources ({sources.length})</h2>
				{sources.length === 0 ? (
					<p className="px-6 py-8 text-center text-sm text-muted-foreground">No sources yet. Add the first one above.</p>
				) : (
					<ul className="divide-y" aria-label="Approved sources">
						{sources.map((source) => (
							<li key={source.id} className="flex items-start gap-4 px-6 py-4">
								<div className="min-w-0 flex-1">
									<p className="font-medium">{source.name}</p>
									<p className="text-xs text-muted-foreground">{KIND_LABEL[source.kind] ?? source.kind}</p>
									<a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 break-all text-sm text-primary hover:underline">
										{source.url}
										<ExternalLink className="h-3 w-3 flex-shrink-0" />
									</a>
									{source.notes && <p className="mt-1 text-sm text-muted-foreground">{source.notes}</p>}
								</div>
								<form action={mediaSourceDeleteSS}>
									<input type="hidden" name="id" value={source.id} />
									<Button type="submit" variant="ghost" size="icon" aria-label={`Remove ${source.name}`}>
										<Trash2 className="h-4 w-4" />
									</Button>
								</form>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
