import { errorResponse, HttpError, requireAdmin } from "@/lib/auth";
import { assertSameOrigin, validateUpload } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { SLOT_IDS } from "@/lib/slots";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const body = await req.json();
    if (!SLOT_IDS.has(body.slot)) throw new HttpError(400, "Unknown image slot");
    const file = validateUpload(body);
    const data = await callBackend<{ fileId: string }>("uploadImage", { ...file, slot: body.slot, by: session.email });
    return Response.json({ ok: true, fileId: data.fileId });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
