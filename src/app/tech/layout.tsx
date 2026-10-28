import type { Metadata } from "next";
import Link from "next/link";
import { Anybody, Instrument_Sans, Martian_Mono } from "next/font/google";
import TechFooter from "@/components/tech/TechFooter";
import TechNav from "@/components/tech/TechNav";
import TechShell from "@/components/tech/TechShell";
import JsonLd from "@/components/site/JsonLd";
import { techOrganizationJsonLd } from "@/lib/seo";
import { techMode } from "@/lib/techMode";

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
  return (
    <div className={`tech-root ${anybody.variable} ${instrumentSans.variable} ${martianMono.variable}`}>
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
        <TechNav landing={landing} />
        <main>{children}</main>
        <TechFooter landing={landing} />
      </TechShell>
    </div>
  );
}
