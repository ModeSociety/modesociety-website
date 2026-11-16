import { errorResponse, requireAdmin } from "@/lib/auth";
import { pandadocStatus } from "@/lib/pandadoc";

/** Whether PandaDoc is connected, which key (live or staging) and which account: admins only. */
export async function GET() {
  try {
    await requireAdmin();
    return Response.json({ ok: true, pandadoc: await pandadocStatus() }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
