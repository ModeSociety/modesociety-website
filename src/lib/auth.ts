import { cookies } from "next/headers";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { callBackend } from "./backend";

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

let adminCache: { at: number; list: string[]; backendOwner: string } | null = null;

/**
 * Everyone allowed in besides the site owner: the Admins tab plus the backend's own
 * OWNER_EMAIL script property (so a Drive owner set there can always sign in too).
 */
export async function listAdmins(force = false) {
  if (!force && adminCache && Date.now() - adminCache.at < 30_000) return adminCache.list;
  let list: string[] = [];
  let backendOwner = "";
  try {
    const data = await callBackend<{ owner?: string; admins: string[] }>("getAdmins");
    backendOwner = data.owner || "";
    list = [...new Set([...(backendOwner ? [backendOwner] : []), ...data.admins])];
  } catch (err) {
    // Backend unreachable: only the owner can get in, so the panel is still usable for setup.
    console.error("[mode-society] admin list unavailable:", err);
  }
  adminCache = { at: Date.now(), list, backendOwner };
  return list;
}

/** The backend's OWNER_EMAIL script property (permanent, can't be removed from the panel). */
export async function backendOwnerEmail() {
  await listAdmins();
  return adminCache?.backendOwner || "";
}

export function invalidateAdminCache() {
  adminCache = null;
}

export async function isAllowedAdmin(email: string) {
  const e = email.toLowerCase();
  if (e === ownerEmail()) return true;
  return (await listAdmins()).includes(e);
}

export type AdminSession = { email: string; name: string; picture: string };

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
export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey());
    const email = String(payload.sub || "");
    if (!email || !(await isAllowedAdmin(email))) return null;
    return { email, name: String(payload.name || ""), picture: String(payload.picture || "") };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new HttpError(401, "Not signed in");
  return session;
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
