import { createSession, ownerEmail } from "@/lib/auth";

/**
 * Local-only shortcut so the admin UI can be tried without Google sign-in.
 * Works only with `npm run dev` AND ADMIN_DEV_BYPASS=true in .env.local.
 */
export async function POST() {
  if (process.env.NODE_ENV !== "development" || process.env.ADMIN_DEV_BYPASS !== "true") {
    return new Response("Not found", { status: 404 });
  }
  await createSession({ email: ownerEmail(), name: "Local dev", picture: "" });
  return Response.json({ ok: true });
}
