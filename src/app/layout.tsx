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

export const metadata: Metadata = {
  title: "The Holy Beacon",
  description: "Illuminate Your Path Through the Word",
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
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
