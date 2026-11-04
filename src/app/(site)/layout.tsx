import SiteShell from "@/components/site/SiteShell";
import JsonLd from "@/components/site/JsonLd";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import PreviewBar from "@/components/site/PreviewBar";
import { ChromeRoot, ChromeStyles } from "@/components/builder/Chrome";
import { getSiteContent } from "@/lib/backend";
import { organizationJsonLd } from "@/lib/seo";
import { talentThemeCss } from "@/lib/theme";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  const { settings, logoSvg, copy, preview } = content;
  const theme = talentThemeCss(settings.theme);
  return (
    <SiteShell settings={settings} logoSvg={logoSvg}>
      {/* colours and fonts changed in the admin panel */}
      {theme.href && <link rel="stylesheet" href={theme.href} precedence="theme" />}
      {theme.css && <style>{theme.css}</style>}
      <JsonLd data={organizationJsonLd()} />
      <ChromeStyles content={content} side="talent" />
      <ChromeRoot root="nav">
        <Nav words={copy["site.nav"]} />
      </ChromeRoot>
      <main>{children}</main>
      <ChromeRoot root="footer">
        <Footer style={settings.footerStyle} copy={copy["site.footer"]} nav={copy["site.nav"]} />
      </ChromeRoot>
      {preview && <PreviewBar />}
    </SiteShell>
  );
}
