import { HttpError } from "./auth";

/** Rejects cross-site requests to state-changing endpoints. */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (new URL(origin).host !== host) throw new HttpError(403, "Cross-site request blocked");
}

const hits = new Map<string, number[]>();

/** Best-effort per-instance limiter — enough to stop a form being hammered by a script. */
export function rateLimit(req: Request, bucket: string, max: number, windowMs: number) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) throw new HttpError(429, "Too many requests — please try again in a few minutes.");
  recent.push(now);
  hits.set(key, recent);
}

export const MAX_UPLOAD_BYTES = 3_000_000; // after client-side compression; keeps requests under Vercel's 4.5 MB body cap

export type UploadBody = { filename: string; mimeType: string; data: string };

export function validateUpload(body: Partial<UploadBody>, allowPdf = false): UploadBody {
  const { filename = "upload", mimeType = "", data = "" } = body;
  const okType = /^image\/(jpeg|png|webp|gif|svg\+xml)$/.test(mimeType) || (allowPdf && mimeType === "application/pdf");
  if (!okType) throw new HttpError(400, "Unsupported file type");
  if (!data || !/^[A-Za-z0-9+/=]+$/.test(data)) throw new HttpError(400, "Invalid file data");
  if ((data.length * 3) / 4 > MAX_UPLOAD_BYTES) throw new HttpError(413, "File too large");
  return { filename: String(filename).slice(0, 120), mimeType, data };
}

export function clean(v: unknown, max = 2000) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function cleanList(v: unknown, allowed: readonly string[]) {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && allowed.includes(x)) : [];
}

export function cleanIds(v: unknown, max = 10) {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && /^[\w-]{10,}$/.test(x)).slice(0, max) : [];
}
