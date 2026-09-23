import { errorResponse, HttpError } from "@/lib/auth";
import { assertSameOrigin, clean, cleanIds, cleanList, rateLimit } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { HEARD, NICHES } from "@/lib/forms";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    rateLimit(req, "talent", 5, 30 * 60_000);
    const body = await req.json();
    if (body.website_url) return Response.json({ ok: true, reference: "T-THANKYOU" }); // honeypot
    const f = body.fields || {};
    const fields = {
      name: clean(f.name, 120),
      email: clean(f.email, 200),
      phone: clean(f.phone, 40),
      why: clean(f.why, 3000),
      niches: cleanList(f.niches, NICHES),
      instagram: clean(f.instagram, 300),
      tiktok: clean(f.tiktok, 300),
      portfolio: clean(f.portfolio, 300),
      heard: cleanList([f.heard], HEARD)[0] || "",
    };
    if (!fields.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email)) {
      throw new HttpError(400, "Name and a valid email are required");
    }
    const data = await callBackend<{ reference: string }>("submitTalent", {
      fields,
      workFiles: cleanIds(body.workFiles),
      analyticsFiles: cleanIds(body.analyticsFiles),
    });
    return Response.json({ ok: true, reference: data.reference });
  } catch (err) {
    return errorResponse(err);
  }
}
