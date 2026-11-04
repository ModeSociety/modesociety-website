import { DEFS, fontById, PAGES, type PageId } from "@/lib/builder";
import { fontHref } from "@/lib/theme";
import type { SiteContent } from "@/lib/slots";
import Frame, { wantsLightText } from "./Frame";
import Generic from "./Generic";
import { TALENT } from "./talent";
import { TECH } from "./tech";
import type { Ctx } from "./types";

const FEATURES = { ...TALENT, ...TECH };

/**
 * One page, drawn from its blocks (admin panel → Pages): the page as designed until the team changes
 * it. An admin previewing sees the unpublished draft. Each designed section is drawn as it was.
 */
export default function PageRender({
  page,
  content: c,
  query = {},
  landing = false,
}: {
  page: PageId;
  content: SiteContent;
  query?: Ctx["q"];
  landing?: boolean;
}) {
  const side = PAGES[page].side;
  const layout = (c.preview && c.layoutDrafts[page]) || c.layouts[page];
  const ctx: Ctx = { c, page, q: query, landing, has: () => false };

  // what's showing: switched on, known on this side, and with something to show
  const shown = layout.filter((b) => {
    if (b.hidden) return false;
    const def = DEFS[b.type];
    if (!def) return false;
    if (def.kind === "generic") return true;
    const f = FEATURES[b.type];
    return Boolean(f) && def.side === side && (f.shows ? f.shows(ctx) : true);
  });
  const types = new Set(shown.map((b) => b.type));
  ctx.has = (type) => types.has(type);

  const fonts = new Set<string>();
  for (const b of shown) for (const id of [b.style.headingFont, b.style.bodyFont]) if (id) fonts.add(id);
  const href = fontHref([...fonts].map(fontById));

  return (
    <>
      {/* fonts chosen for single blocks */}
      {href && <link rel="stylesheet" href={href} precedence="theme" />}
      {shown.map((b) => {
        const def = DEFS[b.type];
        if (def.kind === "generic") {
          return (
            <Frame key={b.id} id={b.id} style={b.style} side={side} generic uploadsPublic={c.uploadsPublic}>
              <Generic b={b} side={side} light={wantsLightText(b.style)} c={c} />
            </Frame>
          );
        }
        return (
          <Frame key={b.id} id={b.id} style={b.style} side={side} dark={def.dark} uploadsPublic={c.uploadsPublic}>
            {FEATURES[b.type].render(ctx)}
          </Frame>
        );
      })}
    </>
  );
}
