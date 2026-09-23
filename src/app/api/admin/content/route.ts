import { errorResponse, requireAdmin } from "@/lib/auth";
import { getSiteContentFresh } from "@/lib/backend";

export async function GET() {
  try {
    await requireAdmin();
    return Response.json({ ok: true, content: await getSiteContentFresh() });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
