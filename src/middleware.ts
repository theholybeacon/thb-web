import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth/login(.*)',
  '/auth/sign-up(.*)',
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
