import type React from "react"
import type { Metadata } from "next"
import { inter, merriweather } from "@/lib/fonts"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsightsWrapper } from "@/components/analytics/SpeedInsightsWrapper"
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner"
import { PostHogProvider } from "@/app/layout/components/PostHogProvider"
import { AudioPlayerProvider } from "@/app/state/AudioPlayerContext"
import { GlobalAudioPlayer } from "@/components/audio/GlobalAudioPlayer"

export const metadata: Metadata = {
  // Required for file-based OG images (opengraph-image.tsx) to resolve to
  // absolute URLs — crawlers reject relative og:image paths.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://theholybeacon.com",
  ),
  title: "The Holy Beacon — Study the Bible, deeply",
  description:
    "AI study plans, three ways through every chapter — read it, hear it narrated, or type it — plus profiles of the people behind the text and notes that stay attached to the verse.",
  icons: {
    icon: [{ url: "/favicon.ico?2", sizes: "any", type: "image/x-icon" }],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <ClerkProvider>
      <html lang={locale} suppressHydrationWarning>
        <body className={`${inter.variable} ${merriweather.variable} font-sans`}>
          <Analytics />
          <SpeedInsightsWrapper />
          <PostHogProvider>
            <NextIntlClientProvider messages={messages}>
              <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                {/*
                  The audio player lives at the ROOT because this is the only tree
                  shared by (app) and the public /bible reader — and the only one
                  Next.js preserves across client navigation. That is what lets
                  playback survive route changes and keep going with the screen off.
                */}
                <AudioPlayerProvider>
                  {children}
                  <GlobalAudioPlayer />
                  <Toaster position="top-right" richColors closeButton />
                </AudioPlayerProvider>
              </ThemeProvider>
            </NextIntlClientProvider>
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
