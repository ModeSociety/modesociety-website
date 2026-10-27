import { errorResponse, HttpError } from "@/lib/auth";
import { assertSameOrigin, clean, cleanList, rateLimit } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { TECH_BUDGETS, TECH_CATEGORY_OPTIONS, TECH_FORMAT_OPTIONS, TECH_TIMELINES } from "@/lib/tech";

/** ModeSociety Tech: brand enquiry ("Tech Brand Enquiries" tab). */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    rateLimit(req, "tech-brand", 5, 30 * 60_000);
    const body = await req.json();
    if (body.website_url) return Response.json({ ok: true, reference: "TB-THANKYOU" }); // honeypot
    const f = body.fields || {};
    const fields = {
      brand: clean(f.brand, 160),
      website: clean(f.website, 300),
      name: clean(f.name, 120),
      email: clean(f.email, 200),
      categories: cleanList(f.categories, TECH_CATEGORY_OPTIONS),
      formats: cleanList(f.formats, TECH_FORMAT_OPTIONS),
      about: clean(f.about, 3000),
      budget: cleanList([f.budget], TECH_BUDGETS)[0] || "",
      timeline: cleanList([f.timeline], TECH_TIMELINES)[0] || "",
    };
    if (!fields.brand || !fields.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email)) {
      throw new HttpError(400, "Brand name, your name and a valid email are required");
    }
    if (!fields.about) throw new HttpError(400, "Tell us a little about the campaign");
    const data = await callBackend<{ reference: string }>("submitTechBrand", { fields });
    return Response.json({ ok: true, reference: data.reference });
  } catch (err) {
    return errorResponse(err);
  }
}
