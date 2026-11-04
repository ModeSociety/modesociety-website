import { elementCss, elFonts, fontById, type Side } from "@/lib/builder";
import { fontHref } from "@/lib/theme";
import type { SiteContent } from "@/lib/slots";

/** The nav's or footer's element styles from the page builder; `root` marks where they apply. */
export function ChromeStyles({ content: c, side }: { content: SiteContent; side: Side }) {
  const rules = (c.preview && c.chromeDrafts[side]) || c.chrome[side];
  if (!rules.length) return null;
  const nav = rules.filter((r) => r.root === "nav");
  const foot = rules.filter((r) => r.root === "footer");
  const href = fontHref(elFonts(rules).map(fontById));
  return (
    <>
      {href && <link rel="stylesheet" href={href} precedence="theme" />}
      <style>{elementCss("nav", nav) + elementCss("footer", foot)}</style>
    </>
  );
}

/** Marks the nav or footer so element styles and the builder's click-to-edit can find it (adds no box). */
export function ChromeRoot({ root, children }: { root: "nav" | "footer"; children: React.ReactNode }) {
  return (
    <div data-root={root} data-chrome={root} className="contents">
      {children}
    </div>
  );
}
