import { errorResponse, HttpError, requireAdmin, requireSide } from "@/lib/auth";
import { assertSameOrigin, validateUpload } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { SLOTS } from "@/lib/slots";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const body = await req.json();
    const def = SLOTS.find((s) => s.id === body.slot);
    if (!def) throw new HttpError(400, "Unknown image slot");
    requireSide(session, def.side ?? "talent");
    const file = validateUpload(body);
    const data = await callBackend<{ fileId: string }>("uploadImage", { ...file, slot: body.slot, by: session.email });
    return Response.json({ ok: true, fileId: data.fileId });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
