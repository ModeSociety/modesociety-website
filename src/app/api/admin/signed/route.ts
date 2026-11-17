import { errorResponse, HttpError, requireAdmin, requireSide } from "@/lib/auth";
import { assertSameOrigin, clean } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { getLeads, leadsChanged } from "@/lib/leads";
import { COMMISSION, CONTRACT_TYPES, signedCreators } from "@/lib/signed";
import type { Side } from "@/lib/side";

const sideOf = (v: unknown): Side => (v === "tech" ? "tech" : "talent");

/**
 * One business's signed creators with their applications: the leads' kept copy (instant), or with
 * ?fresh=1 straight from the Sheet. ?side=tech for ModeSociety Tech.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const side = sideOf(url.searchParams.get("side"));
    await requireAdmin(side);
    const data = await getLeads(url.searchParams.get("fresh") === "1");
    const items = signedCreators(side, data.signed, data.enquiries[side === "tech" ? "techCreators" : "talent"]);
    return Response.json({ ok: true, items, at: data.at }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

/**
 * Changes a signed creator's contract details, "Mode email in bio" tick or dedicated email. The
 * contract type sets its commission (Exclusive 20%, Non-exclusive 30%).
 */
export async function PATCH(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const body = await req.json();
    const reference = clean(body?.reference, 40);
    if (!reference) throw new HttpError(400, "Missing creator");
    // the admin must have the creator's business; the backend checks the creator is on that side
    const side = sideOf(body?.side);
    requireSide(session, side);
    const raw = body?.patch || {};
    const patch: Record<string, string> = {};
    if (raw.type !== undefined) {
      if (!CONTRACT_TYPES.includes(raw.type)) throw new HttpError(400, "Choose Exclusive or Non-exclusive");
      patch.contract = raw.type;
      patch.commission = COMMISSION[raw.type];
    }
    if (raw.signedAt !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.signedAt) || raw.signedAt > new Date().toISOString().slice(0, 10)) {
        throw new HttpError(400, "The signed date must be a date, and not in the future");
      }
      patch.signedAt = raw.signedAt;
    }
    if (raw.modeEmailInBio !== undefined) patch.modeEmailInBio = raw.modeEmailInBio === true ? "Yes" : "No";
    if (raw.dedicatedEmail !== undefined) {
      const email = clean(raw.dedicatedEmail, 200).toLowerCase();
      const domain = side === "tech" ? "modesocietytech.com" : "modesociety.com.au";
      if (email && !new RegExp(`^[a-z0-9._-]+@${domain.replace(/\./g, "\.")}$`).test(email)) {
        throw new HttpError(400, `The dedicated email must be a name@${domain} address`);
      }
      patch.dedicatedEmail = email;
    }
    if (!Object.keys(patch).length) throw new HttpError(400, "Nothing to change");
    await callBackend("updateSigned", { reference, side, patch, by: session.email });
    leadsChanged();
    return Response.json({ ok: true, patch });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
