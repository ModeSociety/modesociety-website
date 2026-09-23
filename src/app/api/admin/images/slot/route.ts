import { revalidatePath, revalidateTag } from "next/cache";
import { errorResponse, HttpError, requireAdmin } from "@/lib/auth";
import { assertSameOrigin, clean } from "@/lib/api";
import { callBackend, SITE_TAG } from "@/lib/backend";
import { SLOTS } from "@/lib/slots";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const { slot, items } = await req.json();
    const def = SLOTS.find((s) => s.id === slot);
    if (!def) throw new HttpError(400, "Unknown image slot");
    const list = (Array.isArray(items) ? items : [])
      .filter((i) => typeof i?.fileId === "string" && /^[\w-]{10,}$/.test(i.fileId))
      .map((i) => ({ fileId: i.fileId as string, alt: clean(i.alt, 200) }));
    const max = def.kind === "single" ? 1 : (def.max ?? 50);
    if (list.length > max) throw new HttpError(400, `${def.label} holds at most ${max} image(s)`);
    await callBackend("setSlot", { slot, items: list, by: session.email });
    revalidateTag(SITE_TAG, { expire: 0 });
    revalidatePath("/", "layout");
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
