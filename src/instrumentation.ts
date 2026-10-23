import type { Instrumentation } from "next";

/** Runs once per server instance, before it handles requests. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startServerErrorAutocapture } = await import("@/lib/server-errors");
    startServerErrorAutocapture();
  }
}

/**
 * The server's general error fallback: Next.js calls this for every error that
 * escapes a server component, route handler, server action or the middleware.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const { reportServerError, distinctIdFromCookies } = await import("@/lib/server-errors");
  const cookie = request.headers["cookie"];
  await reportServerError(error, {
    distinctId: distinctIdFromCookies(Array.isArray(cookie) ? cookie.join("; ") : cookie),
    area: "server",
    // Without the query string: it can carry tokens (password resets, redirects).
    path: request.path.split("?")[0],
    method: request.method,
    route: context.routePath,
    route_type: context.routeType,
    router_kind: context.routerKind,
    render_source: context.renderSource,
  });
};
