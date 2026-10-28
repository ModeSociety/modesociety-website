import { revalidatePath, revalidateTag } from "next/cache";
import { errorResponse, HttpError, requireAdmin } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/api";
import { callBackend, SITE_TAG } from "@/lib/backend";
import { isSectionId, mergeSection } from "@/lib/copy";

function refresh() {
  revalidateTag(SITE_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

/** Saves one section's wording. Only the section's own fields are kept, trimmed to a sane length. */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const { id, value } = await req.json();
    if (!isSectionId(id)) throw new HttpError(400, "Unknown section");
    const clamp = (v: unknown): unknown =>
      typeof v === "string" ? v.replace(/\r\n?/g, "\n").slice(0, 6000) : Array.isArray(v) ? v.map(clamp) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clamp(x)])) : v;
    const clean = mergeSection(id, clamp(value));
    await callBackend("setContent", { key: id, value: clean, by: session.email });
    refresh();
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

/** Puts a section back to the original wording. */
export async function DELETE(req: Request) {
  try {
    assertSameOrigin(req);
    await requireAdmin();
    const { id } = await req.json();
    if (!isSectionId(id)) throw new HttpError(400, "Unknown section");
    await callBackend("resetContent", { key: id });
    refresh();
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
