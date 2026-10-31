import localFont from "next/font/local"

// Self-hosted (latin, from Fontsource) rather than next/font/google: the build
// then never fetches from Google Fonts, whose Merriweather URLs stopped ending
// in a file extension and broke next/font's loader.

// Inter - highly legible sans-serif for body text
export const inter = localFont({
  src: [
    { path: "../fonts/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/inter-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
})

// Merriweather - elegant serif for headings (fits spiritual/religious theme)
export const merriweather = localFont({
  src: [
    { path: "../fonts/merriweather-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/merriweather-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../fonts/merriweather-latin-900-normal.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-merriweather",
  display: "swap",
  adjustFontFallback: "Times New Roman",
})
