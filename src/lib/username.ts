/**
 * Username rules for the public /u/[username] handle.
 *
 * The handle is the whole public identity of a profile URL, so it is normalized
 * to the same URL-safe alphabet as every other slug in the app (toUrlSlug) rather
 * than trusting whatever was typed. Clerk stores the same value and owns
 * uniqueness; our `user` table mirrors it.
 */

import { toUrlSlug } from "./slug";

/** Clerk's default minimum username length. Going below it fails server-side. */
export const USERNAME_MIN = 4;
export const USERNAME_MAX = 30;

/**
 * Turns arbitrary input into the exact handle that will appear in the URL.
 *
 * Blank input returns "" rather than toUrlSlug's "untitled" placeholder — an
 * empty field must read as "nothing chosen yet", not as a suggested name.
 */
export function normalizeUsername(input: string): string {
	if (!input || !input.trim()) return "";

	const slug = toUrlSlug(input);
	if (slug === "untitled") return "";

	return slug.slice(0, USERNAME_MAX).replace(/-+$/, "");
}

export type UsernameError = "tooShort" | "tooLong" | "invalid";

/**
 * Validates an already-normalized handle. Returns null when it is usable.
 * Uniqueness is checked separately (usernameCheckSS + Clerk).
 */
export function validateUsername(username: string): UsernameError | null {
	if (username.length < USERNAME_MIN) return "tooShort";
	if (username.length > USERNAME_MAX) return "tooLong";
	if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(username)) return "invalid";
	return null;
}
