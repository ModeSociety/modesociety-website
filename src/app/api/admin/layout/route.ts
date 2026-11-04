import { errorResponse, HttpError, requireAdmin } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { refreshSite } from "@/lib/refresh";
import { cleanBlock, cleanEls, isPageId, PAGES, type LayoutBlock } from "@/lib/builder";

/**
 * A page's blocks (admin panel → Pages). Changes are saved as a draft ("layoutDraft.<page>"), which
 * only an admin's preview shows; publishing makes it the live layout ("layout.<page>").
 *   POST { page, items, chrome?, publish? }   save the draft, or publish it; chrome = the nav's and footer's
 *                                            element styles, shared by every page on the page's side
 *   DELETE { page, live? }                    throw the draft away; with live, put the page back as designed
 */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const { page, items, chrome, publish } = await req.json();
    if (!isPageId(page)) throw new HttpError(400, "Unknown page");
    if (!Array.isArray(items) || items.length > 60) throw new HttpError(400, "A page holds up to 60 blocks");
    const side = PAGES[page].side;
    const seen = new Set<string>();
    const clean = items
      .map((b) => cleanBlock(b, side))
      .filter((b): b is LayoutBlock => Boolean(b) && !seen.has(b!.id) && Boolean(seen.add(b!.id)));
    const value = { items: clean };
    const nav = Array.isArray(chrome) ? { items: cleanEls(chrome) } : null;
    if (publish) {
      await callBackend("setContent", { key: `layout.${page}`, value, by: session.email });
      await callBackend("resetContent", { key: `layoutDraft.${page}` });
      if (nav) {
        await callBackend("setContent", { key: `chrome.${side}`, value: nav, by: session.email });
        await callBackend("resetContent", { key: `chromeDraft.${side}` });
      }
      // the nav and footer are on every page of the side
      refreshSite(req, nav ? Object.values(PAGES).filter((p) => p.side === side).map((p) => p.path) : [PAGES[page].path]);
    } else {
      await callBackend("setContent", { key: `layoutDraft.${page}`, value, by: session.email });
      if (nav) await callBackend("setContent", { key: `chromeDraft.${side}`, value: nav, by: session.email });
    }
    return Response.json({ ok: true, items: clean });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

export async function DELETE(req: Request) {
  try {
    assertSameOrigin(req);
    await requireAdmin();
    const { page, live } = await req.json();
    if (!isPageId(page)) throw new HttpError(400, "Unknown page");
    await callBackend("resetContent", { key: `layoutDraft.${page}` });
    await callBackend("resetContent", { key: `chromeDraft.${PAGES[page].side}` });
    if (live) {
      await callBackend("resetContent", { key: `layout.${page}` });
      refreshSite(req, [PAGES[page].path]);
    }
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
