import { errorResponse, HttpError, requireAdmin } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { cleanEmails, EMAIL_FIELDS, readEmails, settingKey, type EmailRole } from "@/lib/emails";
import type { Side } from "@/lib/side";

/** Where each side's form emails go (the saved addresses over the defaults). */
export async function GET() {
  try {
    await requireAdmin();
    const { settings } = await callBackend<{ settings: Record<string, string> }>("getSettings");
    return Response.json({ ok: true, emails: readEmails(settings) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

/** Saves one side's addresses: { side, values: { creators, brands, replyTo } }. */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const body = await req.json();
    const side = body?.side === "tech" ? "tech" : body?.side === "talent" ? "talent" : null;
    if (!side) throw new HttpError(400, "Which side?");
    const values: Record<string, string> = {};
    for (const f of EMAIL_FIELDS) {
      const r = cleanEmails(side as Side, f.role as EmailRole, String(body?.values?.[f.role] ?? ""));
      if ("error" in r) throw new HttpError(400, r.error);
      values[settingKey(side as Side, f.role)] = r.value;
    }
    await callBackend("setSettings", { values, by: session.email });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
