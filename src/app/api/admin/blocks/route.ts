import { errorResponse, HttpError, requireAdmin } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { refreshSite } from "@/lib/refresh";
import { BLOCK_PAGES, cleanBlock, isBlockPage, type Block } from "@/lib/blocks";

/** Saves a page's blocks, in order (the whole list replaces what was there). */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const { page, blocks } = await req.json();
    if (!isBlockPage(page)) throw new HttpError(400, "Unknown page");
    if (!Array.isArray(blocks) || blocks.length > 40) throw new HttpError(400, "A page holds up to 40 blocks");
    const items = blocks.map((b) => cleanBlock(b, page)).filter((b): b is Block => Boolean(b));
    await callBackend("setContent", { key: `blocks.${page}`, value: { items }, by: session.email });
    refreshSite(req, [BLOCK_PAGES[page].path]);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
