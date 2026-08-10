/**
 * Which Bible translations we may legally synthesize into audio.
 *
 * The Hebrew/Greek originals are public domain, but a *translation* is its own
 * copyrighted creative work. API.Bible's terms prohibit AI text-to-speech on
 * copyrighted content and prohibit downloadable text-to-audio recordings, so
 * scripture narration is restricted to translations that are public domain or
 * carry an explicit open license.
 *
 * Audited against the live catalogue (404 Bibles, `npx tsx scripts/list-bibles.ts`).
 * The good news: this project's API.Bible key exposes only the open catalogue —
 * there is no NIV/ESV/NLT/NASB/NKJV/CSB in English, and no RVR1960/NVI/NTV in
 * Spanish. (RVR1960 is the classic trap: it is copyrighted by Sociedades Bíblicas
 * Unidas. Only Reina-Valera *1909* — `RVR09` here — is public domain.)
 *
 * UNKNOWN VERSIONS DEFAULT TO FALSE. That degrades gracefully rather than
 * dangerously: Listen Mode still narrates our own content (step title + AI
 * explanation), it just won't read the scripture text aloud. Never add a version
 * here without confirming its licence.
 */

export type BibleLicenseKind = "public-domain" | "open-license";

interface LicensedBible {
	/** Matched case-insensitively against `bible.version`. */
	version: string;
	label: string;
	kind: BibleLicenseKind;
}

const LICENSED: LicensedBible[] = [
	// --- English: public domain -------------------------------------------------
	{ version: "KJV", label: "King James Version (1611)", kind: "public-domain" },
	{ version: "KJVCPB", label: "Cambridge Paragraph Bible of the KJV", kind: "public-domain" },
	{ version: "ASV", label: "American Standard Version (1901)", kind: "public-domain" },
	{ version: "ASVBT", label: "American Standard Version (Byzantine Text)", kind: "public-domain" },
	{ version: "GNV", label: "Geneva Bible", kind: "public-domain" },
	{ version: "DRA", label: "Douay-Rheims American (1899)", kind: "public-domain" },
	{ version: "RV", label: "Revised Version (1885)", kind: "public-domain" },
	{ version: "Brenton", label: "Brenton English Septuagint", kind: "public-domain" },
	{ version: "LXXup", label: "Brenton English Septuagint (Updated Spelling)", kind: "public-domain" },
	{ version: "OJPS", label: "JPS TaNaKH (1917)", kind: "public-domain" },
	{ version: "OKE", label: "Targum Onkelos Etheridge", kind: "public-domain" },

	// --- English: explicitly released to the public / open-licensed -------------
	{ version: "WEB", label: "World English Bible", kind: "public-domain" },
	{ version: "WEBBE", label: "World English Bible British Edition", kind: "public-domain" },
	{ version: "WEBU", label: "World English Bible Updated", kind: "public-domain" },
	{ version: "WEBUS", label: "World English Bible, American Edition", kind: "public-domain" },
	{ version: "WMB", label: "World Messianic Bible", kind: "public-domain" },
	{ version: "WMBBE", label: "World Messianic Bible British Edition", kind: "public-domain" },
	{ version: "BSB", label: "Berean Standard Bible", kind: "public-domain" },
	{ version: "FBV", label: "Free Bible Version", kind: "open-license" },
	{ version: "LSV", label: "Literal Standard Version", kind: "open-license" },
	{ version: "T4T", label: "Translation for Translators", kind: "open-license" },

	// --- Spanish ----------------------------------------------------------------
	// RVR09 = Reina Valera 1909. Public domain. NOT RVR1960 (copyrighted, UBS).
	{ version: "RVR09", label: "Reina Valera 1909", kind: "public-domain" },
	{ version: "VBL", label: "Versión Biblia Libre", kind: "open-license" },
	{ version: "BES", label: "Biblia en Español Sencillo", kind: "open-license" },
	{ version: "PdDpt", label: "Palabra de Dios para ti", kind: "open-license" },

	// --- Portuguese -------------------------------------------------------------
	{ version: "BLT", label: "Bíblia Livre Para Todos", kind: "open-license" },
	{ version: "TfTP", label: "Translation for Translators (pt-BR)", kind: "open-license" },

	// --- French / German / Italian ----------------------------------------------
	{ version: "JND", label: "Bible J.N. Darby", kind: "public-domain" },
	{ version: "L1912", label: "Luther Bible 1912", kind: "public-domain" },
	{ version: "ELO", label: "Unrevised Elberfelder Bible", kind: "public-domain" },
	{ version: "ELBBK", label: "Elberfelder Translation", kind: "public-domain" },
	{ version: "DB1885", label: "Diodati Bible 1885", kind: "public-domain" },
];

/**
 * Deliberately excluded despite being in the catalogue — recorded so nobody
 * "helpfully" adds them later without checking.
 *
 * - TOJB2011 (The Orthodox Jewish Bible): copyright Artists for Israel Int'l.
 * - Biblica® Open titles (ONBV, OCCB, OAPD, ...): open-licensed for *text*, but the
 *   terms do not clearly grant audio-derivative rights. Confirm with Biblica first.
 */
const KNOWN_EXCLUDED = new Set(["TOJB2011", "ONBV", "OCCB", "OAPD", "KEHM", "BCV", "OSCA", "OCCL"]);

const LICENSED_BY_VERSION = new Map(LICENSED.map((b) => [b.version.toLowerCase(), b]));

/** True when this translation's text may be synthesized into cached audio. */
export function isAudioLicensedBible(bible: { version?: string | null }): boolean {
	const version = bible.version?.trim().toLowerCase();
	if (!version) return false;
	return LICENSED_BY_VERSION.has(version);
}

/** The licence record for a translation, or null if it isn't cleared for audio. */
export function audioLicenseFor(bible: { version?: string | null }): LicensedBible | null {
	const version = bible.version?.trim().toLowerCase();
	if (!version) return null;
	return LICENSED_BY_VERSION.get(version) ?? null;
}

export { KNOWN_EXCLUDED };
