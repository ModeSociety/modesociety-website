import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import { getSiteContent } from "@/lib/backend";

export async function generateMetadata(): Promise<Metadata> {
  const { images } = await getSiteContent();
  const share = images["meta.share"]?.[0] ?? images["home.wall"]?.[0];
  return share ? { openGraph: { images: [{ url: share.src, alt: share.alt }] } } : {};
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings, images } = await getSiteContent();
  return (
    <SiteShell settings={settings}>
      <Nav logo={images["brand.logo"]?.[0]} />
      <main>{children}</main>
      <Footer />
    </SiteShell>
  );
}
