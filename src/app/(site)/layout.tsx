import SiteShell from "@/components/site/SiteShell";
import JsonLd from "@/components/site/JsonLd";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import { getSiteContent } from "@/lib/backend";
import { organizationJsonLd } from "@/lib/seo";
import { talentThemeCss } from "@/lib/theme";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings, logoSvg, copy } = await getSiteContent();
  const theme = talentThemeCss(settings.theme);
  return (
    <SiteShell settings={settings} logoSvg={logoSvg}>
      {/* colours and fonts changed in the admin panel */}
      {theme.href && <link rel="stylesheet" href={theme.href} precedence="theme" />}
      {theme.css && <style>{theme.css}</style>}
      <JsonLd data={organizationJsonLd()} />
      <Nav />
      <main>{children}</main>
      <Footer style={settings.footerStyle} copy={copy["site.footer"]} />
    </SiteShell>
  );
}
