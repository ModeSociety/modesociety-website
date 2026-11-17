import { errorResponse, HttpError } from "@/lib/auth";
import { assertSameOrigin, clean, cleanIds, cleanList, rateLimit } from "@/lib/api";
import { callBackend, getSiteContent } from "@/lib/backend";
import { leadsChanged } from "@/lib/leads";
import {
  blankTechBrand, brandProblems, campaignProblems, TB_BUDGETS, TB_CREATORS, TB_GOALS, TB_HEARD, TB_INDUSTRIES, TB_MARKETS,
  TB_PLATFORMS, TB_TYPES, techBrandAutoReply, techBrandColumns, type TechBrand,
} from "@/lib/tech-brand";

/** Faster than a person can fill in both levels: a script. */
const MIN_MS = 8_000;

const pick = (v: unknown, allowed: readonly string[]) => cleanList([v], allowed)[0] || "";

/** Only the form's own answers, each the right type and a sane length. */
function tidy(raw: Record<string, unknown>): TechBrand {
  return {
    ...blankTechBrand(),
    company: clean(raw.company, 160),
    contact: clean(raw.contact, 120),
    role: clean(raw.role, 120),
    email: clean(raw.email, 200),
    phone: clean(raw.phone, 40),
    website: clean(raw.website, 300),
    industry: pick(raw.industry, TB_INDUSTRIES),
    market: pick(raw.market, TB_MARKETS),
    goals: cleanList(raw.goals, TB_GOALS),
    types: cleanList(raw.types, TB_TYPES),
    platforms: cleanList(raw.platforms, TB_PLATFORMS),
    creators: cleanList(raw.creators, TB_CREATORS),
    audience: clean(raw.audience, 1000),
    budget: pick(raw.budget, TB_BUDGETS),
    start: clean(raw.start, 10),
    details: clean(raw.details, 3000),
    brief: clean(raw.brief, 400),
    heard: pick(raw.heard, TB_HEARD),
    heardOther: clean(raw.heardOther, 200),
    consent: raw.consent === true,
  };
}

/**
 * ModeSociety Tech: a brand enquiry ("Tech Brand Enquiries" tab), checked again with the form's rules.
 * The brief is an uploaded file (moved into Drive by the backend) or a link.
 */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    rateLimit(req, "tech-brand", 5, 30 * 60_000);
    const body = await req.json();
    // spam trap: a filled-in hidden field, or a form sent faster than a person can type
    if (body.website_url || !(Number(body.elapsed) >= MIN_MS)) return Response.json({ ok: true, reference: "TB-THANKYOU" });
    const b = tidy(body.enquiry || {});
    const problems = [...brandProblems(b), ...campaignProblems(b)];
    if (problems.length) throw new HttpError(400, problems[0]);
    const { contactEmail } = await getSiteContent();
    const uploaded = cleanIds([b.brief], 1)[0] || "";
    const data = await callBackend<{ reference: string }>("submitTechBrand", {
      columns: techBrandColumns(b),
      brief: uploaded,
      briefLink: uploaded ? "" : b.brief,
      company: b.company,
      email: b.email,
      autoReply: { ...techBrandAutoReply(b), replyTo: contactEmail.tech },
    });
    leadsChanged();
    return Response.json({ ok: true, reference: data.reference });
  } catch (err) {
    return errorResponse(err);
  }
}
