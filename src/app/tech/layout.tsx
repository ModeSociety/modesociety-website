import type { Metadata } from "next";
import localFont from "next/font/local";
import { ChromeRoot, ChromeStyles } from "@/components/builder/Chrome";
import JsonLd from "@/components/site/JsonLd";
import PreviewBar from "@/components/site/PreviewBar";
import { Footer } from "@/components/tx/Sections";
import TxNav from "@/components/tx/TxNav";
import TxShell from "@/components/tx/TxShell";
import { getSiteContent } from "@/lib/backend";
import { PAGES, TECH_BASE_URL, TECH_HOME_URL, TECH_NAME, techOrganizationJsonLd } from "@/lib/seo";
import { techThemeCss } from "@/lib/theme";
import "./tx.css";

/*
 * ModeSociety Tech type (Asha's v3.5 design), loaded only on /tech. The files are kept here (Google
 * Fonts' Latin files, Open Font License) rather than fetched from Google at build time: on 18 Nov 2026
 * Vercel's build got a Martian Mono stylesheet Next couldn't read and every deploy failed.
 * Martian Mono and Schibsted Grotesk are variable fonts: one file covers every weight.
 */
const schibsted = localFont({ src: "./fonts/schibsted-grotesk.woff2", weight: "400 900", variable: "--font-schibsted", display: "swap" });
const martianMono = localFont({ src: "./fonts/martian-mono.woff2", weight: "100 800", variable: "--font-martian-mono", display: "swap" });
const pressStart = localFont({ src: "./fonts/press-start-2p.woff2", weight: "400", variable: "--font-press-start", display: "swap" });

/** ModeSociety Tech is its own business: its own name, address and keywords, none of Mode Society's. */
export const metadata: Metadata = {
  metadataBase: new URL(TECH_BASE_URL),
  title: { default: PAGES.techHome.title, template: `%s | ${TECH_NAME}` },
  description: PAGES.techHome.description,
  applicationName: TECH_NAME,
  authors: [{ name: TECH_NAME, url: TECH_HOME_URL }],
  creator: TECH_NAME,
  publisher: TECH_NAME,
  category: "Gaming and tech creator agency",
  keywords: [
    "gaming creator agency",
    "gaming influencer agency Australia",
    "streamer management agency",
    "Twitch streamer agency",
    "esports talent agency",
    "gaming influencer marketing",
    "tech influencer agency",
    "telco influencer campaigns",
    "game launch influencer campaign",
  ],
  // ModeSociety Tech's own icons (the browser tab, Google's results and home-screen shortcuts)
  icons: {
    icon: [
      { url: "/tech-icon.svg", type: "image/svg+xml" },
      { url: "/tech/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/tech/apple-icon.png", sizes: "180x180" }],
  },
};

/** ModeSociety Tech: one page at /tech, in Asha's v3.5 design (see src/app/tech/tx.css). */
export default async function TechLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  const { copy, settings, preview } = content;
  const theme = techThemeCss(settings.theme);
  return (
    <div className={`tech-root tx ${schibsted.variable} ${martianMono.variable} ${pressStart.variable}`}>
      {/* colours and fonts changed in the admin panel */}
      {theme.href && <link rel="stylesheet" href={theme.href} precedence="theme" />}
      {theme.css && <style>{theme.css}</style>}
      <JsonLd
        data={techOrganizationJsonLd({
          email: content.contactEmail.tech,
          socials: (["x", "discord", "instagram", "tiktok", "linkedin", "facebook", "google"] as const).map((k) => copy["techSite.footer"][k]),
        })}
      />
      <ChromeStyles content={content} side="tech" />
      <TxShell words={copy["techSite.nav"]}>
        {preview && <PreviewBar />}
        <ChromeRoot root="nav">
          <TxNav words={copy["techSite.nav"]} />
        </ChromeRoot>
        <main id="top">{children}</main>
        <ChromeRoot root="footer">
          <Footer copy={copy["techSite.footer"]} nav={copy["techSite.nav"]} />
        </ChromeRoot>
      </TxShell>
    </div>
  );
}
