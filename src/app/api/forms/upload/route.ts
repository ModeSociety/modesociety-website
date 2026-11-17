import { errorResponse } from "@/lib/auth";
import { assertSameOrigin, rateLimit, validateUpload } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { TB_BRIEF_TYPES } from "@/lib/tech-brand";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    rateLimit(req, "form-upload", 30, 30 * 60_000);
    const file = validateUpload(await req.json(), TB_BRIEF_TYPES) // PDF (media kits, briefs), PPTX and DOCX (briefs);
    const data = await callBackend<{ fileId: string }>("uploadIncoming", file);
    return Response.json({ ok: true, fileId: data.fileId });
  } catch (err) {
    return errorResponse(err);
  }
}
