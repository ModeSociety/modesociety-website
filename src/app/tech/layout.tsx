import type { Metadata } from "next";
import Link from "next/link";
import { Anybody, Instrument_Sans, Martian_Mono } from "next/font/google";
import TechFooter from "@/components/tech/TechFooter";
import TechNav from "@/components/tech/TechNav";
import TechShell from "@/components/tech/TechShell";
import JsonLd from "@/components/site/JsonLd";
import PreviewBar from "@/components/site/PreviewBar";
import { ChromeRoot, ChromeStyles } from "@/components/builder/Chrome";
import { getSiteContent } from "@/lib/backend";
import { techOrganizationJsonLd } from "@/lib/seo";
import { techMode } from "@/lib/techMode";
import { techThemeCss } from "@/lib/theme";

/* ModeSociety Tech type, loaded only on /tech pages */
const anybody = Anybody({ subsets: ["latin"], weight: "variable", axes: ["wdth"], variable: "--font-anybody", display: "swap" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });
const martianMono = Martian_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-martian-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "ModeSociety Tech | Gaming & Tech Creator Agency", template: "%s | ModeSociety Tech" },
  icons: { icon: [{ url: "/tech-icon.svg", type: "image/svg+xml" }] },
};

export default async function TechLayout({ children }: { children: React.ReactNode }) {
  const { launched, preview, landing } = await techMode();
  const content = await getSiteContent();
  const { copy, settings } = content;
  const theme = techThemeCss(settings.theme);
  return (
    <div className={`tech-root ${anybody.variable} ${instrumentSans.variable} ${martianMono.variable}`}>
      {/* colours and fonts changed in the admin panel */}
      {theme.href && <link rel="stylesheet" href={theme.href} precedence="theme" />}
      {theme.css && <style>{theme.css}</style>}
      <JsonLd data={techOrganizationJsonLd()} />
      <TechShell>
        {preview && !launched && (
          <div className="fixed inset-x-0 bottom-0 z-[150] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-[#0b1438] px-4 py-2.5 text-center text-[13px] text-white">
            <span>
              <strong>Preview.</strong> Visitors only see the landing page until ModeSociety Tech is launched in the admin panel.
            </span>
            <Link href="/api/admin/preview?off&to=/tech" prefetch={false} className="underline underline-offset-4">
              Exit preview
            </Link>
          </div>
        )}
        {preview && launched && <PreviewBar />}
        <ChromeStyles content={content} side="tech" />
        <ChromeRoot root="nav">
          <TechNav landing={landing} />
        </ChromeRoot>
        <main>{children}</main>
        <ChromeRoot root="footer">
          <TechFooter landing={landing} copy={copy["tech.footer"]} cta={copy["tech.cta"]} />
        </ChromeRoot>
      </TechShell>
    </div>
  );
}
