import { errorResponse, HttpError } from "@/lib/auth";
import { assertSameOrigin, clean, cleanList, rateLimit } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { BUDGETS, SERVICES, TIMELINES } from "@/lib/forms";

/** "Book a call" form. */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    rateLimit(req, "brand", 5, 30 * 60_000);
    const body = await req.json();
    if (body.website_url) return Response.json({ ok: true, reference: "B-THANKYOU" }); // honeypot
    const f = body.fields || {};
    const fields = {
      brand: clean(f.brand, 160),
      website: clean(f.website, 300),
      name: clean(f.name, 120),
      email: clean(f.email, 200),
      services: cleanList(f.services, SERVICES),
      project: clean(f.project, 3000),
      budget: cleanList([f.budget], BUDGETS)[0] || "",
      timeline: cleanList([f.timeline], TIMELINES)[0] || "",
      notes: clean(f.notes, 200),
    };
    if (!fields.brand || !fields.website || !fields.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email)) {
      throw new HttpError(400, "Brand name, website or Instagram, your name and a valid email are required");
    }
    if (!fields.project || !fields.budget || !fields.timeline) throw new HttpError(400, "Tell us about the project, budget and timeline");
    const data = await callBackend<{ reference: string }>("submitBooking", { fields });
    return Response.json({ ok: true, reference: data.reference });
  } catch (err) {
    return errorResponse(err);
  }
}
