import type { Metadata } from "next";
import { Anybody, Instrument_Sans, Martian_Mono } from "next/font/google";
import TechFooter from "@/components/tech/TechFooter";
import TechNav from "@/components/tech/TechNav";
import TechShell from "@/components/tech/TechShell";
import JsonLd from "@/components/site/JsonLd";
import { techOrganizationJsonLd } from "@/lib/seo";

/* ModeSociety Tech type, loaded only on /tech pages */
const anybody = Anybody({ subsets: ["latin"], weight: "variable", axes: ["wdth"], variable: "--font-anybody", display: "swap" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });
const martianMono = Martian_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-martian-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "ModeSociety Tech | Gaming & Tech Creator Agency", template: "%s | ModeSociety Tech" },
  icons: { icon: [{ url: "/tech-icon.svg", type: "image/svg+xml" }] },
};

export default function TechLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`tech-root ${anybody.variable} ${instrumentSans.variable} ${martianMono.variable}`}>
      <JsonLd data={techOrganizationJsonLd()} />
      <TechShell>
        <TechNav />
        <main>{children}</main>
        <TechFooter />
      </TechShell>
    </div>
  );
}
