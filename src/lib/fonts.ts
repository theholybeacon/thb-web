import { Inter, Merriweather } from "next/font/google"

// Inter - highly legible sans-serif for body text
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

// Merriweather - elegant serif for headings (fits spiritual/religious theme)
export const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-merriweather",
  display: "swap",
})
