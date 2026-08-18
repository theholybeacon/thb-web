/**
 * How a translation is named in UI that has room for exactly one line.
 *
 * Extracted from the study-create picker because the progress switcher, the
 * public profile and both OG cards all face the same problem: API.Bible lists a
 * translation once per canon, so four rows can share a name and version and
 * differ only in `description`. Without the canon suffix a user with progress in
 * two of them sees two identical options and cannot tell which is which.
 */

/** The minimum a label needs. Accepts a full `Bible` row or a projection of one. */
export type BibleLabelParts = {
	name: string;
	version?: string | null;
	description?: string | null;
};

/**
 * The canon a translation is scoped to ("Protestant", "Catholic", ...), when the
 * description happens to be one.
 *
 * `description` is free text: it is sometimes a full sentence and sometimes the
 * useless string "Bible", so only short, meaningful values survive.
 */
export function canonLabel(description?: string | null): string | null {
	const d = description?.trim();
	if (!d || d.length > 24 || d.toLowerCase() === "bible") return null;
	return d;
}

/**
 * A single-line name, e.g. "King James Version · Protestant".
 *
 * Prefers the full name over the version code: the switcher is read at a glance
 * by someone choosing where to zoom, not by someone who already knows the
 * abbreviations.
 */
export function bibleLabel(bible: BibleLabelParts): string {
	const canon = canonLabel(bible.description);
	return canon ? `${bible.name} · ${canon}` : bible.name;
}

/** The compact form for tight spots (pills, OG cards): the version code when there is one. */
export function bibleLabelShort(bible: BibleLabelParts): string {
	const base = bible.version?.trim() || bible.name;
	const canon = canonLabel(bible.description);
	return canon ? `${base} · ${canon}` : base;
}
