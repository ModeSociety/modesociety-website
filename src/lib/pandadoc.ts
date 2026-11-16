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
    const detail = (body as { detail?: unknown; message?: unknown } | null)?.detail ?? (body as { message?: unknown } | null)?.message ?? text;
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
