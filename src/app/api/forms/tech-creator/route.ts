import { errorResponse, HttpError } from "@/lib/auth";
import { assertSameOrigin, clean, cleanList, rateLimit } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { PLATFORMS, TECH_APPLY_AS, TECH_REGIONS } from "@/lib/tech";

const PLATFORM_LABELS = PLATFORMS.map((p) => p.label);

/** ModeSociety Tech: creator application ("Tech Creator Applications" tab). */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    rateLimit(req, "tech-creator", 5, 30 * 60_000);
    const body = await req.json();
    if (body.website_url) return Response.json({ ok: true, reference: "TC-THANKYOU" }); // honeypot
    const f = body.fields || {};
    const channels = (Array.isArray(f.channels) ? f.channels : [])
      .slice(0, 8)
      .map((c: { platform?: unknown; handle?: unknown; followers?: unknown }) => ({
        platform: cleanList([c?.platform], PLATFORM_LABELS)[0] || "",
        handle: clean(c?.handle, 120),
        followers: clean(c?.followers, 40),
      }))
      .filter((c: { platform: string; handle: string }) => c.platform && c.handle);
    const fields = {
      name: clean(f.name, 120),
      handle: clean(f.handle, 120),
      email: clean(f.email, 200),
      as: cleanList([f.as], TECH_APPLY_AS)[0] || "",
      channels,
      niche: clean(f.niche, 300),
      region: cleanList([f.region], TECH_REGIONS)[0] || "",
      adult: f.adult === true,
      notes: clean(f.notes, 2000),
    };
    if (!fields.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email) || !fields.as) {
      throw new HttpError(400, "Your name, a valid email and what you're applying as are required");
    }
    if (!channels.length) throw new HttpError(400, "Add at least one channel");
    if (!fields.adult) throw new HttpError(400, "Every creator we sign is 18 or over");
    const data = await callBackend<{ reference: string }>("submitTechCreator", { fields });
    return Response.json({ ok: true, reference: data.reference });
  } catch (err) {
    return errorResponse(err);
  }
}
