import { errorResponse, HttpError } from "@/lib/auth";
import { assertSameOrigin, clean, cleanIds, cleanList, rateLimit } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { NICHES, PLATFORMS, ROLES, SIGNED } from "@/lib/forms";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    rateLimit(req, "talent", 5, 30 * 60_000);
    const body = await req.json();
    if (body.website_url) return Response.json({ ok: true, reference: "T-THANKYOU" }); // honeypot
    const f = body.fields || {};
    const channels = (Array.isArray(f.channels) ? f.channels : [])
      .map((c: Record<string, unknown>) => ({
        platform: cleanList([c?.platform], PLATFORMS)[0] || "",
        handle: clean(c?.handle, 200),
        followers: clean(c?.followers, 20),
        files: cleanIds(c?.files, 4),
      }))
      .filter((c: { platform: string; handle: string }) => c.platform && c.handle)
      .slice(0, PLATFORMS.length);
    const fields = {
      name: clean(f.name, 120),
      email: clean(f.email, 200),
      roles: cleanList(f.roles, ROLES),
      channels,
      niches: cleanList(f.niches, NICHES),
      wants: clean(f.wants, 3000),
      signed: cleanList([f.signed], SIGNED)[0] || "",
      consent: f.consent === true,
    };
    if (!fields.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email)) throw new HttpError(400, "Name and a valid email are required");
    if (!fields.roles.length || !fields.niches.length) throw new HttpError(400, "Tell us what you do and your niche");
    if (!channels.length || channels.some((c: { followers: string; files: string[] }) => !c.followers || !c.files.length)) {
      throw new HttpError(400, "Add at least one channel with its follower count and an engagement screenshot");
    }
    if (!fields.consent) throw new HttpError(400, "Please confirm you're 18 or over, or have a parent or guardian's consent");
    const data = await callBackend<{ reference: string }>("submitTalent", { fields });
    return Response.json({ ok: true, reference: data.reference });
  } catch (err) {
    return errorResponse(err);
  }
}
