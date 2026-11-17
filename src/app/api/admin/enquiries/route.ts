import { errorResponse, HttpError, requireAdmin, requireSide } from "@/lib/auth";
import { assertSameOrigin, clean, cleanList } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { getLeads, leadsChanged } from "@/lib/leads";
import { ENQUIRY_KINDS, statusesFor, toEnquiries, type EnquiryKind } from "@/lib/enquiries";

/**
 * All leads (talent, brand calls, Tech brands and creators), newest first: the website's kept copy,
 * which is instant, or with ?fresh=1 straight from the Sheet (the panel asks for both, in that order).
 */
export async function GET(req: Request) {
  try {
    const session = await requireAdmin();
    const fresh = new URL(req.url).searchParams.get("fresh") === "1";
    const data = await getLeads(fresh);
    // an admin limited to one business only gets that business's leads
    const kinds = ENQUIRY_KINDS.filter((k) => session.sides.includes(k.side));
    const items = Object.fromEntries(kinds.map((k) => [k.id, toEnquiries(k.id, data.enquiries[k.id])]));
    return Response.json({ ok: true, items, at: data.at }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

/** Changes an enquiry's status; it's written straight to the Status column in the Sheet. */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const body = await req.json();
    const kind = cleanList([body?.kind], ENQUIRY_KINDS.map((k) => k.id))[0] as EnquiryKind | undefined;
    if (kind) requireSide(session, ENQUIRY_KINDS.find((k) => k.id === kind)!.side);
    const status = kind && cleanList([body?.status], statusesFor(kind))[0];
    const reference = clean(body?.reference, 40);
    if (!kind || !status || !reference) throw new HttpError(400, "Missing lead, type or status");
    await callBackend("setEnquiryStatus", { kind, reference, status });
    leadsChanged();
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

/** Deletes a declined enquiry from the Sheet (and a talent's screenshots folder, to the Drive bin). */
export async function DELETE(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const body = await req.json();
    const kind = cleanList([body?.kind], ENQUIRY_KINDS.map((k) => k.id))[0];
    const reference = clean(body?.reference, 40);
    if (!kind || !reference) throw new HttpError(400, "Missing enquiry or type");
    requireSide(session, ENQUIRY_KINDS.find((k) => k.id === kind)!.side);
    await callBackend("deleteEnquiry", { kind, reference });
    leadsChanged();
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
