import { PostHog } from "posthog-node";

/**
 * Server-side PostHog client for authoritative events fired from webhooks and
 * route handlers (e.g. subscription activation).
 *
 * Returns null when PostHog is not configured, so callers no-op safely in local
 * dev. In serverless handlers, `await client.shutdown()` after capturing so the
 * event flushes before the function exits.
 */
export function getPostHogServer(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  return new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
}

/**
 * Sends one server-side product event and flushes it before the function
 * exits. For events only the server knows about for sure (Stripe webhooks).
 * Never throws: analytics must not fail the request.
 */
export async function trackServerEvent(
	distinctId: string,
	event: string,
	properties: Record<string, unknown> = {},
): Promise<void> {
	const posthog = getPostHogServer();
	if (!posthog) return;
	try {
		posthog.capture({
			distinctId,
			event,
			properties: { environment: process.env.VERCEL_ENV || process.env.NODE_ENV, ...properties },
		});
		await posthog.shutdown();
	} catch (error) {
		console.error("Failed to send PostHog event:", error);
	}
}
