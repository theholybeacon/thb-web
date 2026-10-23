/**
 * Looks up public-domain images on Wikimedia Commons for a study's image steps.
 *
 *   npx tsx scripts/commons-image.ts search "Doré Deluge"
 *   npx tsx scripts/commons-image.ts info "File:Gustave Doré - The Holy Bible - Plate I, The Deluge.jpg"
 *
 * `info` prints what an image step needs: a 1280px URL to show, the file page
 * to credit, the licence and the artist. Only files whose licence is "Public
 * domain" (or a CC0 dedication) may go into a step.
 */
const API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT = "TheHolyBeaconStoryCheck/1.0 (https://theholybeacon.com)";

async function api(params: Record<string, string>) {
	const res = await fetch(`${API}?${new URLSearchParams({ format: "json", ...params })}`, {
		headers: { "User-Agent": USER_AGENT },
	});
	if (!res.ok) throw new Error(`Commons answered ${res.status}`);
	return res.json();
}

function stripHtml(html?: string): string {
	return (html ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

async function search(query: string) {
	const data = await api({ action: "query", list: "search", srsearch: query, srnamespace: "6", srlimit: "15" });
	for (const hit of data.query.search) console.log(hit.title);
}

async function info(title: string) {
	const data = await api({
		action: "query",
		titles: title,
		prop: "imageinfo",
		iiprop: "url|extmetadata",
		iiurlwidth: "1280",
	});
	const page = Object.values(data.query.pages)[0] as {
		imageinfo?: { url: string; thumburl?: string; descriptionurl: string; extmetadata: Record<string, { value: string }> }[];
	};
	const ii = page.imageinfo?.[0];
	if (!ii) throw new Error(`No such file: ${title}`);
	const meta = ii.extmetadata;
	// Commons tags thumbnails with tracking parameters; the image is the same without them.
	const url = new URL(ii.thumburl ?? ii.url);
	url.search = "";
	console.log(JSON.stringify({
		url: url.toString(),
		sourceUrl: ii.descriptionurl,
		license: stripHtml(meta.LicenseShortName?.value),
		artist: stripHtml(meta.Artist?.value),
		date: stripHtml(meta.DateTimeOriginal?.value),
		title: stripHtml(meta.ObjectName?.value),
	}, null, 2));
}

const [command, arg] = process.argv.slice(2);
(command === "search" ? search(arg) : command === "info" ? info(arg) : Promise.reject(new Error("usage: search <query> | info <File:...>")))
	.catch((e) => {
		console.error(e instanceof Error ? e.message : e);
		process.exit(1);
	});
