import type { Metadata, Viewport } from "next";
import { Boldonse, Instrument_Serif, Inter_Tight } from "next/font/google";
import "./globals.css";

const boldonse = Boldonse({ weight: "400", subsets: ["latin"], variable: "--font-boldonse", display: "swap" });
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

export const viewport: Viewport = { themeColor: "#f3efe7" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${boldonse.variable} ${instrument.variable} ${interTight.variable}`}>
      <body>{children}</body>
    </html>
  );
}
