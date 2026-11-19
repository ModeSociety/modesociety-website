import { after } from "next/server";
import { unstable_cache } from "next/cache";
import { errorResponse, HttpError, requireAdmin, requireSide, type AdminUser } from "@/lib/auth";
import { assertSameOrigin, clean, cleanList } from "@/lib/api";
import { callBackend, getSiteContent } from "@/lib/backend";
import { CONTRACT_ROLE, CONTRACT_TYPES, contractFields, paymentPart, templateName, type ContractType } from "@/lib/contract";
import { ENQUIRY_KINDS, toEnquiries, type Enquiry, type EnquiryKind } from "@/lib/enquiries";
import { getLeads, leadsChanged } from "@/lib/leads";
import { contractFolder, createDocumentFromPdf, deleteDocument, documentLink, pandadoc, PandaDocError, remindSigner, sendDocument, voidDocument, waitForDraft } from "@/lib/pandadoc";

/** NSW creators get the NSW Fair Trading sheet before a contract (the lead's tag says so; SP-115). */
const needsNswSheet = (e: Enquiry) => (e.creator?.tags ?? []).some((t) => t.startsWith("NSW"));
const businessName = (side: "talent" | "tech") => (side === "tech" ? "Mode Society Tech" : "Mode Society");

/** sending runs after the reply (up to a minute for PandaDoc), so the function may keep running that long */
export const maxDuration = 60;

/**
 * A contract's PDF from its Google Doc. It's the same for every creator (their details go into
 * PandaDoc's fields), so the site keeps each of the 8 (4 contracts × Part A or B) for 10 minutes:
 * Asha's edits to a template reach the next contract within 10 minutes.
 */
const contractPdf = unstable_cache(
  (template: string, part: string) => callBackend<{ name: string; data: string }>("buildContract", { template, part }),
  ["contract-pdf-v2"],
  { revalidate: 600 },
);

/** contracts being sent by this server right now (a second click doesn't send a second contract) */
const sending = new Set<string>();

/**
 * The lead, from the website's kept copy of the Sheet (instant). Its contract columns are checked
 * there too; the backend writes the result, so a stale copy can't send a second contract.
 */
async function findLead(kind: EnquiryKind, reference: string, fresh = false) {
  const data = await getLeads(fresh);
  const lead = toEnquiries(kind, data.enquiries[kind]).find((e) => e.reference === reference);
  if (!lead) throw new HttpError(404, "That lead is no longer in the Sheet");
  return lead;
}

const field = (e: Enquiry, label: string) => e.fields.find((f) => f.label === label)?.value ?? "";
const oneLine = (v: string) => v.replace(/\s*\n\s*/g, ", ");

/** What has to be true before a contract goes out (checked before the reply). */
function checkSend(e: Enquiry) {
  const k = e.contract;
  if (e.status === "Signed") throw new HttpError(409, "This creator has already signed");
  if (k?.state === "sent") throw new HttpError(409, "A contract is already out for signing: void it first to send a new one");
  if (sending.has(e.reference)) throw new HttpError(409, "This contract is already being sent");
  if (needsNswSheet(e) && !k?.nswSheetSent) throw new HttpError(409, "Send the NSW Information for Performers sheet first, and tick that it's sent");
  if (!e.email) throw new HttpError(400, "This lead has no email address");
}

/** A prepared (unsent) contract's name in PandaDoc: the template and the creator. */
const draftName = (template: string, legal: string) => `${template}: ${legal}`;

/**
 * Makes the contract in PandaDoc and waits until it can be sent (PandaDoc takes about 5 seconds to
 * process it). It's marked prepared, so Send finds it and only has to send it.
 */
async function createDraft(kind: EnquiryKind, e: Enquiry, side: "talent" | "tech", type: ContractType) {
  const legal = field(e, "Full Name") || e.title;
  const [first, ...rest] = legal.trim().split(/\s+/);
  const part = paymentPart(field(e, "Based"), field(e, "Country"));
  const template = templateName(side, type);
  const pdf = await contractPdf(template, part);
  const platform = field(e, "Main Platform");
  const prefill = {
    legalName: legal,
    creatorName: field(e, "Creator Name"),
    dob: field(e, "Date of Birth"),
    mobile: field(e, "Mobile"),
    email: e.email,
    country: field(e, "Country"),
    region: field(e, "State / Region") || field(e, "Region"),
    postal: oneLine(field(e, "Postal Address")),
    mainChannel: [platform, field(e, "Main Channel")].filter(Boolean).join(": "),
    otherChannels: oneLine(field(e, "Other Platforms")),
    guardian: oneLine(field(e, "Guardian")),
    signName: legal,
  };
  const doc = await createDocumentFromPdf(Buffer.from(pdf.data, "base64"), pdf.name, {
    name: draftName(template, legal),
    recipients: [{ email: e.email, first_name: first || legal, last_name: rest.join(" ") || "-", role: CONTRACT_ROLE }],
    fields: contractFields(part, prefill),
    metadata: { reference: e.reference, kind, side, type, prepared: "yes" },
    tags: [side === "tech" ? "modesociety-tech" : "mode-society", "talent-agreement"],
    folder_uuid: await contractFolder(businessName(side)),
  });
  try {
    await waitForDraft(doc.id);
  } catch (err) {
    await deleteDocument(doc.id).catch(() => {});
    throw err;
  }
  return doc.id;
}

/** This lead's prepared contracts in PandaDoc that haven't been sent. */
async function preparedDrafts(reference: string) {
  const list = await pandadoc<{ results: { id: string; name: string; status: string }[] }>(`/documents?metadata_reference=${encodeURIComponent(reference)}&count=20`);
  return list.results.filter((d) => d.status === "document.draft");
}

/** Sends a ready contract and records it on the lead (status Contract sent, the document and its link). */
async function deliver(session: AdminUser, kind: EnquiryKind, e: Enquiry, side: "talent" | "tech", type: ContractType, docId: string) {
  const legal = field(e, "Full Name") || e.title;
  const first = legal.trim().split(/\s+/)[0];
  const { contactEmail } = await getSiteContent();
  await sendDocument(
    docId,
    `Your ${businessName(side)} ${type.toLowerCase()} talent agreement`,
    `Hi ${first || "there"}, here is your ${type.toLowerCase()} agreement with ${businessName(side)}. Please check your details in Schedule 1, add your payment details in Schedule 2, and sign. Questions? Email ${contactEmail[side]}.`,
  );
  await callBackend("setLeadContract", {
    kind,
    reference: e.reference,
    status: "Contract sent",
    columns: [
      ["Contract Type", type],
      ["Contract Doc ID", docId],
      ["Contract Link", documentLink(docId)],
      ["Contract Sent At", new Date().toISOString()],
      ["Contract State", "sent"],
      ["Contract Reminded At", ""],
    ],
  });
  console.info(`[contracts] ${session.email} sent the ${type} contract ${docId} to ${e.reference}`);
}

/** Records a failed send on the lead (its status doesn't change, and it can be sent again). */
async function recordFailure(kind: EnquiryKind, reference: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[contracts] sending ${reference} failed:`, message);
  await callBackend("setLeadContract", { kind, reference, columns: [["Contract State", `failed: ${message.slice(0, 300)}`]] }).catch(() => {});
}

/**
 * A creator lead's contract (SP-32, SP-115, SP-116): send it through PandaDoc (filled from the
 * application, Asha's signature already on it), tick the NSW sheet, remind the creator once, or void it.
 * When PandaDoc fails, the panel gets its message and the lead stays as it was.
 */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const body = await req.json();
    const kind = cleanList([body?.kind], ENQUIRY_KINDS.filter((k) => k.creator).map((k) => k.id))[0] as EnquiryKind | undefined;
    const reference = clean(body?.reference, 40);
    if (!kind || !reference) throw new HttpError(400, "Missing lead");
    const side = ENQUIRY_KINDS.find((k) => k.id === kind)!.side;
    requireSide(session, side);
    const action = String(body?.action || "");
    // sending is quick to ask for: the checks run now, the PandaDoc work after the reply
    let e = await findLead(kind, reference, action !== "send");
    if (action === "prepare" || action === "send") {
      const type = cleanList([body?.type], CONTRACT_TYPES)[0] as ContractType | undefined;
      if (!type) throw new HttpError(400, "Choose Exclusive or Non-exclusive");
      try {
        checkSend(e);
      } catch {
        // nothing to prepare for a lead that can't be sent a contract (yet)
        if (action === "prepare") return Response.json({ ok: true, prepared: false });
        // the kept copy can be a few seconds behind (an NSW tick just saved): check the Sheet itself
        e = await findLead(kind, reference, true);
        checkSend(e);
      }
      const lead = e;
      const template = templateName(side, type);
      if (action === "prepare") {
        // the Send dialog is open: get this contract ready in PandaDoc meanwhile (replacing any other
        // prepared one for this lead), so Send only has to send it
        after(async () => {
          try {
            const old = await preparedDrafts(reference);
            const name = draftName(template, field(lead, "Full Name") || lead.title);
            if (old.some((d) => d.name.endsWith(name))) return; // (the sandbox adds "[DEV] " in front)
            await Promise.all(old.map((d) => deleteDocument(d.id).catch(() => {})));
            await createDraft(kind, lead, side, type);
          } catch (err) {
            console.error(`[contracts] preparing ${reference} failed:`, (err as Error).message);
          }
        });
        return Response.json({ ok: true, prepared: true });
      }
      sending.add(reference);
      // the prepared contract, when it's ready: send it now (a couple of seconds) and say so
      const ready = (await preparedDrafts(reference).catch(() => [])).find((d) => d.name.endsWith(draftName(template, field(lead, "Full Name") || lead.title)));
      if (ready) {
        try {
          await deliver(session, kind, lead, side, type, ready.id);
          return Response.json({ ok: true, sent: true });
        } catch (err) {
          await recordFailure(kind, reference, err);
          throw err;
        } finally {
          sending.delete(reference);
          leadsChanged();
        }
      }
      // not prepared yet: make it and send it after the reply
      after(async () => {
        try {
          await deliver(session, kind, lead, side, type, await createDraft(kind, lead, side, type));
        } catch (err) {
          await recordFailure(kind, reference, err);
        } finally {
          sending.delete(reference);
          leadsChanged();
        }
      });
      return Response.json({ ok: true, queued: true });
    } else if (action === "nswSheet") {
      await callBackend("setLeadContract", { kind, reference, columns: [["NSW Sheet Sent", `${session.email} · ${new Date().toISOString()}`]] });
    } else if (action === "remind" || action === "void") {
      const k = e.contract;
      if (k?.state !== "sent" || !k.docId) throw new HttpError(409, "There's no unsigned contract on this lead");
      if (action === "remind") {
        await remindSigner(k.docId, `Reminder: your ${businessName(side)} agreement`, "A quick reminder to check and sign your agreement when you have a moment. Thank you!");
        await callBackend("setLeadContract", { kind, reference, columns: [["Contract Reminded At", new Date().toISOString()]] });
      } else {
        const how = await voidDocument(k.docId);
        await callBackend("setLeadContract", { kind, reference, status: "Reviewing", columns: [["Contract State", how === "voided" ? "voided" : "voided (deleted in PandaDoc)"]] });
      }
    } else {
      throw new HttpError(400, "Unknown action");
    }
    leadsChanged();
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof PandaDocError) return Response.json({ ok: false, error: err.message }, { status: err.status >= 500 ? 502 : 400 });
    return errorResponse(err, { expose: true });
  }
}
