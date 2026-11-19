import { after } from "next/server";
import { errorResponse, HttpError } from "@/lib/auth";
import { assertSameOrigin, clean, cleanIds, rateLimit } from "@/lib/api";
import { ADULT_SHARES, allProblems, APP_OPTIONS, applicationColumns, autoReply, blankApplication, GROWTH_GUIDE, TERMS_VERSION, type Application } from "@/lib/application";
import { callBackend, sendQueuedEmails, getSiteContent } from "@/lib/backend";
import { leadsChanged } from "@/lib/leads";
import { isSpam } from "@/lib/spam";
import { SITE_URL, TECH_BASE_URL } from "@/lib/seo";
import type { Side } from "@/lib/side";

/** Faster than a person can fill in nine steps: a script (SP-112's timing check). */
const MIN_MS = 15_000;

const str = (v: unknown, max = 300) => clean(v, max);
const list = (v: unknown, allowed: readonly string[]) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && allowed.includes(x)))] : []);

/** Only the application's own answers, each the right type and a sane length. */
function tidy(raw: Record<string, unknown>, side: Side): Application {
  const o = APP_OPTIONS[side];
  const b = blankApplication();
  const pick = <T extends string>(v: unknown, allowed: readonly T[]) => (allowed.includes(v as T) ? (v as T) : ("" as const));
  return {
    ...b,
    legalName: str(raw.legalName, 120),
    creatorName: str(raw.creatorName, 120),
    email: str(raw.email, 200),
    mobile: str(raw.mobile, 40),
    dob: str(raw.dob, 10),
    guardianName: str(raw.guardianName, 120),
    guardianEmail: str(raw.guardianEmail, 200),
    guardianPhone: str(raw.guardianPhone, 40),
    based: pick(raw.based, ["Australia", "International"] as const),
    country: str(raw.country, 80),
    region: str(raw.region, 80),
    uaePermit: str(raw.uaePermit, 80),
    addressType: pick(raw.addressType, ["Street address", "PO Box or parcel locker"] as const),
    address1: str(raw.address1, 200),
    address2: str(raw.address2, 200),
    suburb: str(raw.suburb, 120),
    postcode: str(raw.postcode, 20),
    photos: cleanIds(raw.photos, 6),
    profileThumb: cleanIds([raw.profileThumb], 1)[0] || "",
    mainPlatform: pick(raw.mainPlatform, o.platforms),
    mainLink: str(raw.mainLink, 300),
    mainFollowers: str(raw.mainFollowers, 20),
    avgViews: str(raw.avgViews, 20),
    others: (Array.isArray(raw.others) ? raw.others : []).slice(0, 12).map((c: Record<string, unknown>) => ({
      platform: pick(c?.platform, o.platforms),
      link: str(c?.link, 300),
      followers: str(c?.followers, 20),
    })),
    mediaKit: str(raw.mediaKit, 400),
    niches: list(raw.niches, o.niches),
    work: list(raw.work, o.work),
    games: side === "tech" ? str(raw.games, 300) : "",
    setup: side === "tech" ? list(raw.setup, o.setup) : [],
    audienceCountry: str(raw.audienceCountry, 80),
    adultShare: side === "tech" ? pick(raw.adultShare, ADULT_SHARES) : "",
    collaborations: str(raw.collaborations, 3000),
    represented: pick(raw.represented, ["Yes", "No"] as const),
    agency: str(raw.agency, 200),
    discovery: pick(raw.discovery, o.discovery),
    referrer: str(raw.referrer, 200),
    discoveryOther: str(raw.discoveryOther, 200),
    representation: pick(raw.representation, ["Exclusive (20% commission)", "Non-exclusive (30% commission)"] as const),
    agreements: list(raw.agreements, o.agreements),
    tips: raw.tips === true,
  };
}

/**
 * A creator application (also the onboarding form), for Mode Society or ModeSociety Tech. Every step
 * is checked again here with the same rules as the form, and the consent record (time, IP address,
 * terms version) and the admin tags are saved with it.
 */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    rateLimit(req, "creator", 5, 30 * 60_000);
    const body = await req.json();
    if (isSpam(body, MIN_MS)) return Response.json({ ok: true, reference: "C-THANKYOU" });
    const side: Side = body.side === "tech" ? "tech" : "talent";
    const a = tidy(body.application || {}, side);
    const { eligibility, contactEmail } = await getSiteContent();
    const problems = allProblems(a, side, eligibility[side]);
    if (problems.length) throw new HttpError(400, problems[0]);
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
    const consent = { at: new Date().toISOString(), ip, terms: TERMS_VERSION };
    const data = await callBackend<{ reference: string }>("submitCreator", { deferEmails: true,
      side,
      columns: applicationColumns(a, side, consent),
      files: { photos: a.photos, thumb: a.profileThumb, mediaKit: /^[\w-]{10,}$/.test(a.mediaKit) ? a.mediaKit : "" },
      mediaKitLink: /^https?:\/\//.test(a.mediaKit) ? a.mediaKit : "",
      name: a.creatorName || a.legalName,
      email: a.email,
      // the applicant's one auto-reply: Asha's message and the guide's link, replies to the side's address
      autoReply: { ...autoReply(side, a, (side === "tech" ? TECH_BASE_URL : SITE_URL) + GROWTH_GUIDE[side]), replyTo: contactEmail[side] },
    });
    leadsChanged();
    // the emails (the team's, with uploads attached, and the auto-reply) go out just after the reply
    after(() => sendQueuedEmails(data.reference));
    return Response.json({ ok: true, reference: data.reference });
  } catch (err) {
    return errorResponse(err);
  }
}
