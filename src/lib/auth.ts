import { revalidateTag, unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { callBackend } from "./backend";
import type { Side } from "./side";

export const ADMIN_COOKIE = "ms_admin";
const COOKIE = ADMIN_COOKIE;
const SESSION_HOURS = 12;
const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export function ownerEmail() {
  return (process.env.OWNER_EMAIL || "rubayathdrjb@gmail.com").trim().toLowerCase();
}

function sessionKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be set (32+ characters).");
  return new TextEncoder().encode(secret);
}

/** Verifies a "Sign in with Google" credential and returns the verified email. */
export async function verifyGoogleCredential(credential: string) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set.");
  const { payload } = await jwtVerify(credential, googleKeys, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: clientId,
  });
  if (!payload.email || payload.email_verified !== true) throw new Error("Google account email is not verified.");
  return {
    email: String(payload.email).toLowerCase(),
    name: typeof payload.name === "string" ? payload.name : "",
    picture: typeof payload.picture === "string" ? payload.picture : "",
  };
}

const ADMINS_TAG = "admins";
/** sides: an admin limited to one business (Admins tab, Side column); not listed = both */
type AdminsData = { owner?: string; admins: string[]; sides?: Record<string, string> };

/**
 * The Admins tab, kept by the website (shared by every server instance) so a signed-in admin's
 * requests don't each wait 2 seconds for Apps Script. It refreshes every 2 minutes, and at once
 * when someone is added or removed in Access (invalidateAdminCache).
 */
const readAdminsCached = unstable_cache(() => callBackend<AdminsData>("getAdmins"), ["admins-v1"], { tags: [ADMINS_TAG], revalidate: 120 });

async function readAdmins(fresh: boolean): Promise<AdminsData | null> {
  try {
    if (!fresh) return await readAdminsCached();
    const data = await callBackend<AdminsData>("getAdmins");
    revalidateTag(ADMINS_TAG, "max");
    return data;
  } catch (err) {
    // Backend unreachable: only the owner can get in, so the panel is still usable for setup.
    console.error("[mode-society] admin list unavailable:", err);
    return null;
  }
}

/**
 * Everyone allowed in besides the site owner: the Admins tab plus the backend's own
 * OWNER_EMAIL script property (so a Drive owner set there can always sign in too).
 * fresh: straight from the Sheet (signing in), not the kept copy.
 */
export async function listAdmins(fresh = false) {
  const data = await readAdmins(fresh);
  const owner = data?.owner || "";
  return [...new Set([...(owner ? [owner] : []), ...(data?.admins || [])])];
}

/** Admins limited to one business: { email: "talent" | "tech" } (everyone else sees both). */
export async function adminSides(): Promise<Record<string, string>> {
  return (await readAdmins(false))?.sides || {};
}

/** The backend's OWNER_EMAIL script property (permanent, can't be removed from the panel). */
export async function backendOwnerEmail() {
  return (await readAdmins(false))?.owner || "";
}

/** After an admin is added or removed: the next check reads the Sheet again (a removed admin loses access at once). */
export function invalidateAdminCache() {
  revalidateTag(ADMINS_TAG, { expire: 0 });
}

/** Whether this email may sign in, against a given list (or the kept one). */
export async function isAllowedAdmin(email: string, admins?: string[]) {
  const e = email.toLowerCase();
  if (e === ownerEmail()) return true;
  return (admins ?? (await listAdmins())).includes(e);
}

export type AdminSession = { email: string; name: string; picture: string };
/** A signed-in admin, with the businesses they may see: both, or Talent or Tech only. */
export type AdminUser = AdminSession & { sides: Side[] };

const BOTH: Side[] = ["talent", "tech"];

/** The sides an admin may see. The site owner and the Drive owner always have both. */
async function sidesOf(email: string): Promise<Side[]> {
  if (email === ownerEmail()) return BOTH;
  const data = await readAdmins(false);
  if (email === data?.owner) return BOTH;
  const side = data?.sides?.[email];
  return side === "talent" || side === "tech" ? [side] : BOTH;
}

export async function createSession(user: AdminSession) {
  const token = await new SignJWT({ name: user.name, picture: user.picture })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(sessionKey());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

/** Returns the signed-in admin, or null. Re-checks the allowlist so removed admins lose access immediately. */
export async function getAdminSession(): Promise<AdminUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey());
    const email = String(payload.sub || "");
    if (!email || !(await isAllowedAdmin(email))) return null;
    return { email, name: String(payload.name || ""), picture: String(payload.picture || ""), sides: await sidesOf(email) };
  } catch {
    return null;
  }
}

/**
 * The signed-in admin, or 401. With a side, also 403 unless they may see that business; with "both",
 * only an admin who sees both (managing who can sign in, so nobody widens their own access).
 */
export async function requireAdmin(need?: Side | "both") {
  const session = await getAdminSession();
  if (!session) throw new HttpError(401, "Not signed in");
  if (need) requireSide(session, need);
  return session;
}

const SIDE_NAME: Record<Side, string> = { talent: "Mode Society", tech: "ModeSociety Tech" };

/** 403 unless this admin may see that side ("both": both sides). */
export function requireSide(session: AdminUser, need: Side | "both") {
  if (need === "both" ? session.sides.length < 2 : !session.sides.includes(need)) {
    throw new HttpError(403, need === "both" ? "Only an admin of both businesses can do that" : `Your account can't open ${SIDE_NAME[need]}`);
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Public routes hide unexpected (500) errors behind a friendly message;
 * admin routes pass `expose` so the panel can show what actually went wrong.
 */
export function errorResponse(err: unknown, { expose = false } = {}) {
  const status = err instanceof HttpError ? err.status : 500;
  const raw = err instanceof Error ? err.message : "Unexpected error";
  if (status >= 500) console.error("[mode-society]", err);
  const message =
    status >= 500 && !expose
      ? "Something went wrong on our side. Please try again, or email pr@modesociety.com.au."
      : raw;
  return Response.json({ ok: false, error: message }, { status });
}
