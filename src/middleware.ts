import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth/login(.*)',
  '/auth/sign-up(.*)',
  // The OAuth handle step. Clerk has no session yet at this point, so leaving
  // it protected would bounce a half-finished sign-up back to the login page.
  '/auth/complete-profile(.*)',
  '/auth/forgot-password(.*)',
  '/sso-callback(.*)',
  '/api/webhooks(.*)',
  '/api/stripe/prices',
  // Both carry their own auth and must work without a Clerk session: the cron
  // is invoked by Vercel with a CRON_SECRET bearer token, and unsubscribe links
  // are opened straight from a mail client. Clerk answers 404 (not 401) for
  // unauthenticated API requests, so leaving these protected silently breaks them.
  '/api/cron(.*)',
  '/api/email(.*)',
  // Read-only content API for our own tooling. Carries its own API-key auth
  // (src/lib/contentApi/auth.ts) and must bypass Clerk for the same reason as
  // the two above — Clerk answers 404 to unauthenticated API requests, which
  // would look like a routing bug rather than an auth failure.
  '/api/content(.*)',
  '/bible(.*)',
  // Shared journey pages. These are opened by people who are not signed in (that
  // is the point of sharing), and Clerk answers 404 rather than 401 to anonymous
  // requests — so leaving this protected would silently break every shared link.
  // The service itself still returns null unless the owner opted in.
  '/u/(.*)',
  // Crawler-facing metadata files. The matcher below does not exclude .txt/.xml,
  // so without these Clerk answers 404 to anonymous crawlers and the whole SEO
  // discovery surface (robots + every generateSitemaps() shard) silently breaks.
  '/robots.txt',
  '/sitemap.xml',
  '/sitemap/(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
