/**
 * PandaDoc, for creator contracts. Server only: the API key never reaches the browser (no NEXT_PUBLIC_
 * name, and only route handlers import this file). The live site uses PANDADOC_API_KEY; development
 * and preview deployments use PANDADOC_STAGING_API_KEY when it is set, so tests never send a live
 * contract.
 */
const API = "https://api.pandadoc.com/public/v1";

export type PandaDocMode = "live" | "staging";

function credentials(): { key: string; mode: PandaDocMode } | null {
  if (typeof window !== "undefined") throw new Error("PandaDoc is server only");
  const live = process.env.PANDADOC_API_KEY?.trim();
  const staging = process.env.PANDADOC_STAGING_API_KEY?.trim();
  const onLiveSite = process.env.VERCEL_ENV === "production";
  if (!onLiveSite && staging) return { key: staging, mode: "staging" };
  return live ? { key: live, mode: "live" } : null;
}

export const pandadocConfigured = () => credentials() !== null;

export class PandaDocError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** One PandaDoc API call. Errors carry PandaDoc's own message, never the key. */
export async function pandadoc<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const c = credentials();
  if (!c) throw new PandaDocError("PandaDoc isn't connected: set PANDADOC_API_KEY (see README → PandaDoc).", 503);
  const res = await fetch(API + path, {
    ...init,
    headers: { Authorization: `API-Key ${c.key}`, Accept: "application/json", ...(init.headers || {}) },
    signal: init.signal ?? AbortSignal.timeout(30_000),
    cache: "no-store",
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const b = (body ?? {}) as { detail?: unknown; message?: unknown; info_message?: unknown };
    const detail = b.detail ?? b.message ?? b.info_message ?? text;
    throw new PandaDocError(`PandaDoc ${res.status}: ${String(typeof detail === "string" ? detail : JSON.stringify(detail)).slice(0, 300)}`, res.status);
  }
  return body as T;
}

/** Who the key belongs to: the check that PandaDoc is connected (logged on the server). */
export async function pandadocStatus() {
  const c = credentials();
  if (!c) return { connected: false as const, mode: null, error: "No PandaDoc key set" };
  try {
    const me = await pandadoc<{ email: string; role?: string; workspace_name?: string }>("/members/current");
    console.info(`[pandadoc] connected (${c.mode}) as ${me.email}, workspace "${me.workspace_name ?? "?"}"`);
    return { connected: true as const, mode: c.mode, email: me.email, workspace: me.workspace_name ?? "" };
  } catch (err) {
    console.error(`[pandadoc] check failed (${c.mode}):`, (err as Error).message);
    return { connected: false as const, mode: c.mode, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Contracts (SP-32, SP-114, SP-116)
// ---------------------------------------------------------------------------

export type PandaDocDocument = {
  id: string;
  name: string;
  status: string;
  date_created?: string;
  recipients?: { id: string; email: string; has_completed?: boolean }[];
  metadata?: Record<string, string>;
};

/** The app link an admin opens a document with. */
export const documentLink = (id: string) => `https://app.pandadoc.com/a/#/documents/${id}`;

const folderIds = new Map<string, string>();
/** Each business's own PandaDoc folder ("Mode Society" / "ModeSociety Tech"), made on first use (SP-114). */
export async function contractFolder(name: string): Promise<string> {
  const kept = folderIds.get(name);
  if (kept) return kept;
  const list = await pandadoc<{ results: { uuid: string; name: string }[] }>("/documents/folders?count=100");
  let uuid = list.results.find((f) => f.name === name)?.uuid;
  if (!uuid) {
    const made = await pandadoc<{ uuid: string }>("/documents/folders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    uuid = made.uuid;
  }
  folderIds.set(name, uuid);
  return uuid;
}

/** Uploads a PDF with field tags as a new document (PandaDoc then processes it into a draft). */
export async function createDocumentFromPdf(pdf: Buffer, filename: string, data: Record<string, unknown>) {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(pdf)], { type: "application/pdf" }), filename);
  form.append("data", JSON.stringify({ parse_form_fields: false, ...data }));
  return pandadoc<PandaDocDocument>("/documents", { method: "POST", body: form });
}

export const getDocument = (id: string) => pandadoc<PandaDocDocument>(`/documents/${id}/details`);

/** Waits until an uploaded document is a draft (ready to send): usually a few seconds. */
export async function waitForDraft(id: string, timeoutMs = 45_000) {
  const until = Date.now() + timeoutMs;
  for (;;) {
    const d = await pandadoc<PandaDocDocument>(`/documents/${id}`);
    if (d.status === "document.draft") return d;
    if (d.status === "document.error") throw new PandaDocError("PandaDoc couldn't process the contract PDF", 502);
    if (Date.now() > until) throw new PandaDocError("PandaDoc is still processing the contract: try again in a minute", 504);
    await new Promise((r) => setTimeout(r, 1500));
  }
}

export const sendDocument = (id: string, subject: string, message: string) =>
  pandadoc<PandaDocDocument>(`/documents/${id}/send`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, message, silent: false }) });

/** One reminder email to the document's signer (PandaDoc allows one a day per recipient). */
export async function remindSigner(id: string, subject: string, message: string) {
  const d = await getDocument(id);
  const r = d.recipients?.find((x) => !x.has_completed) ?? d.recipients?.[0];
  if (!r) throw new PandaDocError("The contract has no signer to remind", 409);
  return pandadoc(`/documents/${id}/send-reminder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reminders: [{ recipient_id: r.id, delivery_methods: { email: true, sms: false }, email_customization: { subject, message } }] }),
  });
}

/**
 * Cancels an unsigned contract so it can't be signed: marked voided (no email to the creator); if the
 * account can't change statuses by hand, the document is deleted instead.
 */
export async function voidDocument(id: string): Promise<"voided" | "deleted"> {
  try {
    await pandadoc(`/documents/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: 11, notify_recipients: false }) });
    return "voided";
  } catch (err) {
    if (!(err instanceof PandaDocError) || err.status >= 500) throw err;
    await pandadoc(`/documents/${id}`, { method: "DELETE" });
    return "deleted";
  }
}

export const deleteDocument = (id: string) => pandadoc(`/documents/${id}`, { method: "DELETE" });
