import type { Metadata, Viewport } from "next";
import { Anton, IBM_Plex_Mono, Instrument_Serif, Inter_Tight } from "next/font/google";
import { PAGES, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

/* Editorial type: condensed Anton headlines, Instrument Serif italic accents, Plex Mono metadata. */
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const plexMono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-plex-mono", display: "swap" });
const instrument = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: PAGES.home.title, template: `%s | ${SITE_NAME}` },
  description: PAGES.home.description,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Talent agency",
  keywords: [
    "talent agency Melbourne",
    "influencer agency Melbourne",
    "influencer marketing agency Australia",
    "UGC creators Australia",
    "UGC agency",
    "creator agency",
    "model agency Melbourne",
    "influencer talent management",
    "event guest list",
    "influencer seeding",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/brand/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
  },
  formatDetection: { telephone: false, email: false, address: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  // Search Console's HTML-tag check, if ever used instead of the DNS record
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = { themeColor: "#ffffff", colorScheme: "light" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${anton.variable} ${instrument.variable} ${interTight.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
