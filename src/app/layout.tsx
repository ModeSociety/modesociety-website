import type { Metadata, Viewport } from "next";
import { Anton, IBM_Plex_Mono, Instrument_Serif, Inter_Tight } from "next/font/google";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.modesociety.com.au"),
  title: { default: "Mode Society — Boutique talent & creator agency", template: "%s — Mode Society" },
  description:
    "Mode Society is an Australian boutique talent agency representing models, influencers, UGC creators and streamers worldwide for brand campaigns and events across beauty, wellness, fashion and technology.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${anton.variable} ${instrument.variable} ${interTight.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
