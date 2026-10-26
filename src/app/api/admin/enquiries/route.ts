import { errorResponse, HttpError, requireAdmin } from "@/lib/auth";
import { assertSameOrigin, clean, cleanList } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { ENQUIRY_KINDS, ENQUIRY_STATUSES, toEnquiries, type EnquiryKind, type SheetTable } from "@/lib/enquiries";

/** All form submissions (talent, brand calls, partnerships), newest first. */
export async function GET() {
  try {
    await requireAdmin();
    const data = await callBackend<{ enquiries: Partial<Record<EnquiryKind, SheetTable>> }>("listEnquiries");
    const items = Object.fromEntries(ENQUIRY_KINDS.map((k) => [k.id, toEnquiries(k.id, data.enquiries[k.id])]));
    return Response.json({ ok: true, items });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

/** Changes an enquiry's status; it's written straight to the Status column in the Sheet. */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await requireAdmin();
    const body = await req.json();
    const kind = cleanList([body?.kind], ENQUIRY_KINDS.map((k) => k.id))[0];
    const status = cleanList([body?.status], ENQUIRY_STATUSES)[0];
    const reference = clean(body?.reference, 40);
    if (!kind || !status || !reference) throw new HttpError(400, "Missing enquiry, type or status");
    await callBackend("setEnquiryStatus", { kind, reference, status });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
