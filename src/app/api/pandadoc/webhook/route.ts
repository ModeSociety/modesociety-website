import { createHmac, timingSafeEqual } from "node:crypto";
import { callBackend } from "@/lib/backend";
import { contractTypeOf, type ContractType } from "@/lib/contract";
import { ENQUIRY_KINDS, type EnquiryKind } from "@/lib/enquiries";
import { leadsChanged } from "@/lib/leads";
import { downloadSignedPdf, getDocument } from "@/lib/pandadoc";
import { GROWTH_GUIDE } from "@/lib/application";
import { welcomeEmail } from "@/lib/welcome";

/** a signed PDF and the email with the guide take a few seconds */
export const maxDuration = 60;

type Event = { event?: string; data?: { id?: string; status?: string; metadata?: Record<string, string> } };

/** PandaDoc's signature: HMAC-SHA256 of the raw body with the webhook's shared key, hex, in ?signature=. */
function signedByPandaDoc(raw: string, signature: string | null) {
  const key = process.env.PANDADOC_WEBHOOK_KEY?.trim();
  if (!key || !signature) return false;
  const want = Buffer.from(createHmac("sha256", key).update(raw, "utf8").digest("hex"));
  const got = Buffer.from(signature);
  return want.length === got.length && timingSafeEqual(want, got);
}

/**
 * PandaDoc tells the website when a contract changes status (SP-117). Only calls signed with the shared
 * key are accepted. A completed contract moves its lead to Signed and into Signed Talent, the signed
 * PDF goes to Drive, and the creator gets the welcome email (all once: a repeat changes nothing). A
 * declined contract puts the lead back in Reviewing.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!signedByPandaDoc(raw, new URL(req.url).searchParams.get("signature"))) return new Response("Invalid signature", { status: 401 });
  let events: Event[];
  try {
    const body = JSON.parse(raw);
    events = Array.isArray(body) ? body : [body];
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }
  for (const ev of events) {
    const id = ev.data?.id;
    const status = ev.data?.status;
    if (ev.event !== "document_state_changed" || !id || (status !== "document.completed" && status !== "document.declined")) continue;
    // our contracts carry the lead in their metadata; anything else in the account is ignored
    const meta = ev.data?.metadata ?? (await getDocument(id).catch(() => null))?.metadata ?? {};
    const kind = ENQUIRY_KINDS.find((k) => k.id === meta.kind && k.creator)?.id as EnquiryKind | undefined;
    if (!kind || !meta.reference) continue;
    const side = ENQUIRY_KINDS.find((k) => k.id === kind)!.side;
    try {
      if (status === "document.declined") {
        await callBackend("setLeadContract", { kind, reference: meta.reference, status: "Reviewing", columns: [["Contract State", "declined"]] });
      } else {
        const type = (contractTypeOf(meta.type ?? "") || "Non-exclusive") as ContractType;
        const pdf = (await downloadSignedPdf(id)).toString("base64");
        const details = await getDocument(id);
        const signer = details.recipients?.[0] as { first_name?: string } | undefined;
        const guideUrl = new URL(GROWTH_GUIDE[side], req.url);
        const guide = await fetch(guideUrl).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null);
        const welcome = {
          ...welcomeEmail(side, type, signer?.first_name ?? ""),
          attachments: guide ? [{ name: guideUrl.pathname.split("/").pop(), mimeType: "application/pdf", data: Buffer.from(guide).toString("base64") }] : [],
        };
        await callBackend("contractCompleted", { kind, reference: meta.reference, docId: id, type, pdf, welcome });
      }
      leadsChanged();
    } catch (err) {
      console.error(`[pandadoc webhook] ${status} ${id} (${meta.reference}):`, (err as Error).message);
      // PandaDoc retries a failed delivery, and the step is safe to repeat
      return new Response("Not processed", { status: 500 });
    }
  }
  return Response.json({ ok: true });
}

