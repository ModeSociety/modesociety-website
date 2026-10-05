import { errorResponse, HttpError } from "@/lib/auth";
import { assertSameOrigin, clean, cleanList, rateLimit } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { PARTNERSHIPS } from "@/lib/forms";

/** Brand partnerships (B2B) form. */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    rateLimit(req, "partner", 5, 30 * 60_000);
    const body = await req.json();
    if (body.website_url) return Response.json({ ok: true, reference: "P-THANKYOU" }); // honeypot
    const f = body.fields || {};
    const fields = {
      business: clean(f.business, 160),
      type: clean(f.type, 160),
      website: clean(f.website, 300),
      name: clean(f.name, 120),
      email: clean(f.email, 200),
      partnership: cleanList(f.partnership, PARTNERSHIPS),
      idea: clean(f.idea, 3000),
    };
    if (!fields.business || !fields.type || !fields.website || !fields.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email)) {
      throw new HttpError(400, "Business name, type, website or Instagram, your name and a valid email are required");
    }
    if (!fields.partnership.length || !fields.idea) throw new HttpError(400, "Pick a partnership type and tell us your idea");
    const data = await callBackend<{ reference: string }>("submitPartner", { fields });
    return Response.json({ ok: true, reference: data.reference });
  } catch (err) {
    return errorResponse(err);
  }
}
