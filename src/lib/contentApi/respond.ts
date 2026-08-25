import { NextResponse } from "next/server";

/**
 * The one response shape for the whole /api/content/v1 namespace.
 *
 * The rest of the app has no shared response helper — error bodies drift
 * between machine codes ("PREMIUM_REQUIRED") and prose ("Gift not found"). This
 * namespace is consumed by an automated pipeline rather than by a person, so it
 * commits to machine codes everywhere and never returns prose as `error`.
 */

/** Bumped only on a breaking change to a response shape. */
export const CONTENT_API_VERSION = "1.0.0";

/** Scripture and character data are effectively immutable; cache them hard. */
export const DEFAULT_CACHE_SECONDS = 3600;

export type ContentApiError = {
	error: string;
	message?: string;
	[key: string]: unknown;
};

export function ok<T extends object>(
	data: T,
	opts: { cacheSeconds?: number; headers?: Record<string, string> } = {},
): NextResponse {
	const seconds = opts.cacheSeconds ?? DEFAULT_CACHE_SECONDS;
	return NextResponse.json(
		{ apiVersion: CONTENT_API_VERSION, ...data },
		{
			status: 200,
			headers: {
				"Cache-Control": `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 24}`,
				...opts.headers,
			},
		},
	);
}

export function fail(
	code: string,
	status: number,
	extra: Omit<ContentApiError, "error"> = {},
	headers: Record<string, string> = {},
): NextResponse {
	return NextResponse.json(
		{ apiVersion: CONTENT_API_VERSION, error: code, ...extra },
		{ status, headers: { "Cache-Control": "no-store", ...headers } },
	);
}
