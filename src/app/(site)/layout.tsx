import SiteShell from "@/components/site/SiteShell";
import JsonLd from "@/components/site/JsonLd";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import { getSiteContent } from "@/lib/backend";
import { organizationJsonLd } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings, logoSvg } = await getSiteContent();
  return (
    <SiteShell settings={settings} logoSvg={logoSvg}>
      <JsonLd data={organizationJsonLd()} />
      <Nav />
      <main>{children}</main>
      <Footer style={settings.footerStyle} />
    </SiteShell>
  );
}
