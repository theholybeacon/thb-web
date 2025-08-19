import type React from "react"
import type { Metadata } from "next"
import { roboto, oswald } from "@/lib/fonts"
import { ThemeProvider } from "@/components/theme/theme-provider"
import "./globals.css"
import ClientProvider from "./layout/components/ClientProviders"

export const metadata: Metadata = {
  title: "The Holy Beacon",
  description: "Illuminate Your Path Through the Word",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} ${oswald.variable} font-sans`}>
        <ClientProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </ClientProvider>
      </body>
    </html>
  )
}


