import { errorResponse, HttpError } from "@/lib/auth";
import { assertSameOrigin, clean, cleanList, rateLimit } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { SERVICES } from "@/lib/forms";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    rateLimit(req, "brand", 5, 30 * 60_000);
    const body = await req.json();
    if (body.website_url) return Response.json({ ok: true, reference: "B-THANKYOU" }); // honeypot
    const f = body.fields || {};
    const fields = {
      name: clean(f.name, 120),
      position: clean(f.position, 120),
      company: clean(f.company, 160),
      email: clean(f.email, 200),
      phone: clean(f.phone, 40),
      website: clean(f.website, 300),
      business: clean(f.business, 3000),
      target: clean(f.target, 2000),
      goals: clean(f.goals, 3000),
      services: cleanList(f.services, SERVICES),
      budget: clean(f.budget, 80),
      moodboard: Array.isArray(f.moodboard)
        ? f.moodboard.map((m: unknown) => clean(m, 40)).filter(Boolean).slice(0, 12)
        : [],
    };
    if (!fields.name || !fields.company || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email)) {
      throw new HttpError(400, "Name, company and a valid email are required");
    }
    const data = await callBackend<{ reference: string }>("submitBrand", { fields });
    return Response.json({ ok: true, reference: data.reference });
  } catch (err) {
    return errorResponse(err);
  }
}
