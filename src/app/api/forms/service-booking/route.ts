import { after } from "next/server";
import { errorResponse, HttpError } from "@/lib/auth";
import { assertSameOrigin, clean, rateLimit } from "@/lib/api";
import { callBackend, sendQueuedEmails, getSiteContent } from "@/lib/backend";
import { blankBooking, bookingProblems, findTier, type Booking } from "@/lib/booking";
import { leadsChanged } from "@/lib/leads";
import { isSpam } from "@/lib/spam";

/** Faster than a person can fill in the short form: a script. */
const MIN_MS = 5_000;

/**
 * A Book now booking (SP-127). The service and tier must be on that site's Services page now, and the
 * price is taken from there, not from the browser.
 */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    rateLimit(req, "service-booking", 5, 30 * 60_000);
    const body = await req.json();
    if (isSpam(body, MIN_MS)) return Response.json({ ok: true, reference: "S-THANKYOU" });
    const side = body.side === "tech" ? "tech" : "talent";
    const raw = body.booking || {};
    const b: Booking = {
      ...blankBooking(),
      service: clean(raw.service, 120),
      tier: clean(raw.tier, 120),
      name: clean(raw.name, 120),
      email: clean(raw.email, 200).toLowerCase(),
      as: clean(raw.as, 20),
      link: clean(raw.link, 300),
      goals: clean(raw.goals, 2000),
    };
    const problems = bookingProblems(b);
    if (problems.length) throw new HttpError(400, problems[0]);
    const { copy } = await getSiteContent();
    const found = findTier(copy[side === "tech" ? "techSite.services" : "services.priced"].items, b.service, b.tier);
    if (!found) throw new HttpError(400, "That service or tier is no longer offered. Please refresh the page and choose again.");
    const data = await callBackend<{ reference: string }>("submitServiceBooking", { deferEmails: true, side, booking: { ...b, ...found } });
    leadsChanged();
    // the emails (the team's, with uploads attached, and the auto-reply) go out just after the reply
    after(() => sendQueuedEmails(data.reference));
    return Response.json({ ok: true, reference: data.reference });
  } catch (err) {
    return errorResponse(err);
  }
}
