import type { NextRequest, NextResponse } from "next/server";
import { logger } from "@/app/utils/logger";
import { API_KEY_HEADER, authenticate } from "./auth";
import { checkRateLimit } from "./rateLimit";
import { ReferenceParseError } from "./reference";
import { fail } from "./respond";

/**
 * The single entry gate for every Content API route: authenticate, throttle,
 * run, and turn thrown errors into machine-readable codes.
 *
 * READ-ONLY BY CONSTRUCTION. Routes in this namespace export nothing but `GET`
 * — there is no wrapper for POST/PUT/PATCH/DELETE here, and a test asserts no
 * such handler is exported anywhere under src/app/api/content. Next.js answers
 * 405 to any other method automatically.
 *
 * ONE CAVEAT, stated rather than hidden: /verses reads through the reader's own
 * hydrating path, so a chapter nobody has opened yet is fetched from api.bible
 * and cached into `verse`/`chapter` on the way past. That is a content
 * cache-fill — it writes no user state and no product state, and produces the
 * same rows a reader visiting the page would. It is bounded by
 * hydrationBudget.ts. Every other endpoint is a pure read.
 */

const log = logger.child({ module: "api/content" });

/** Thrown by handlers to select a status without constructing a response. */
export class ContentApiFailure extends Error {
	constructor(
		readonly code: string,
		readonly status: number,
		readonly extra: Record<string, unknown> = {},
	) {
		super(code);
		this.name = "ContentApiFailure";
	}
}

export const notFound = (code = "NOT_FOUND", extra: Record<string, unknown> = {}) =>
	new ContentApiFailure(code, 404, extra);

export const badRequest = (code = "INVALID_REQUEST", extra: Record<string, unknown> = {}) =>
	new ContentApiFailure(code, 400, extra);

export type ContentApiHandler<P> = (
	request: NextRequest,
	ctx: { params: P },
) => Promise<NextResponse>;

/**
 * The gate itself. Split into two exported wrappers below because Next.js 15
 * type-checks a route's second argument exactly: a dynamic route must declare
 * `{ params: Promise<...> }` and a static one must declare nothing at all. One
 * wrapper with an optional context satisfies neither.
 */
async function runGuarded<P>(
	request: NextRequest,
	params: P,
	handler: ContentApiHandler<P>,
): Promise<NextResponse> {
	if (!authenticate(request)) {
		// Deliberately says nothing about whether a key is configured at all.
		return fail("UNAUTHORIZED", 401, {
			message: `Provide a valid ${API_KEY_HEADER} header.`,
		});
	}

	const limit = checkRateLimit();
	if (!limit.allowed) {
		// Retry-After as a real header, not just in the body: that is what HTTP
		// clients and job schedulers actually back off on.
		return fail(
			"RATE_LIMITED",
			429,
			{
				message: `Limit is ${limit.limit} requests/minute.`,
				retryAfterSeconds: limit.retryAfterSeconds,
			},
			{ "Retry-After": String(limit.retryAfterSeconds) },
		);
	}

	try {
		return await handler(request, { params });
	} catch (err) {
		if (err instanceof ReferenceParseError) {
			return fail(err.code, 400, { message: err.message });
		}
		if (err instanceof ContentApiFailure) {
			return fail(err.code, err.status, err.extra);
		}
		const message = err instanceof Error ? err.message : String(err);
		log.error({ err: message, path: request.nextUrl?.pathname }, "content API request failed");
		return fail("INTERNAL_ERROR", 500);
	}
}

/** Wraps a route with no dynamic segments, e.g. /meta. */
export function withContentApi(
	handler: ContentApiHandler<Record<string, never>>,
): (request: NextRequest) => Promise<NextResponse> {
	return (request) => runGuarded(request, {} as Record<string, never>, handler);
}

/** Wraps a route with dynamic segments, e.g. /verses/[reference]. */
export function withContentApiParams<P extends Record<string, string>>(
	handler: ContentApiHandler<P>,
): (request: NextRequest, ctx: { params: Promise<P> }) => Promise<NextResponse> {
	return async (request, ctx) => runGuarded(request, await ctx.params, handler);
}
