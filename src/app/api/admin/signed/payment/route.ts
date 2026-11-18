import { errorResponse, HttpError, requireAdmin } from "@/lib/auth";
import { assertSameOrigin, clean } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { getLeads } from "@/lib/leads";
import { pandadoc, PandaDocError } from "@/lib/pandadoc";
import { paymentView, type PandaDocField } from "@/lib/payment";
import { signedCreators } from "@/lib/signed";
import type { Side } from "@/lib/side";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** The creator's signed contract's fields, straight from PandaDoc (nothing is kept). */
async function view(side: Side, reference: string, reveal: boolean) {
  const data = await getLeads(true);
  const s = signedCreators(side, data.signed, data.enquiries[side === "tech" ? "techCreators" : "talent"]).find((x) => x.contract.reference === reference);
  if (!s) throw new HttpError(404, "That creator is not in Signed Talent");
  if (!s.contract.pandadocId) return null; // signed before contracts went through the website
  const doc = await pandadoc<{ fields: PandaDocField[] }>(`/documents/${s.contract.pandadocId}/details`);
  const region = s.application?.creator?.region ?? "";
  return paymentView(doc.fields, region, reveal);
}

/**
 * A signed creator's payment details (SP-122), read from their signed contract in PandaDoc: GET gives
 * them masked; POST (Reveal) logs who asked and when, then gives them in full for that view only.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const side: Side = url.searchParams.get("side") === "tech" ? "tech" : "talent";
    await requireAdmin(side);
    const reference = clean(url.searchParams.get("reference"), 40);
    return Response.json({ ok: true, payment: await view(side, reference, false) }, { headers: NO_STORE });
  } catch (err) {
    if (err instanceof PandaDocError) return Response.json({ ok: false, error: err.message }, { status: 502, headers: NO_STORE });
    return errorResponse(err, { expose: true });
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const body = await req.json();
    const side: Side = body?.side === "tech" ? "tech" : "talent";
    const session = await requireAdmin(side);
    const reference = clean(body?.reference, 40);
    if (!reference) throw new HttpError(400, "Missing creator");
    // logged before anything is shown
    await callBackend("logPaymentReveal", { side, reference, by: session.email });
    console.info(`[payment] ${session.email} revealed ${reference}'s payment details`);
    return Response.json({ ok: true, payment: await view(side, reference, true) }, { headers: NO_STORE });
  } catch (err) {
    if (err instanceof PandaDocError) return Response.json({ ok: false, error: err.message }, { status: 502, headers: NO_STORE });
    return errorResponse(err, { expose: true });
  }
}
