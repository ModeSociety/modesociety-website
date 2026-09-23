import { createSession, errorResponse, HttpError, isAllowedAdmin, listAdmins, verifyGoogleCredential } from "@/lib/auth";
import { assertSameOrigin, rateLimit } from "@/lib/api";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    rateLimit(req, "login", 20, 10 * 60_000);
    const { credential } = await req.json();
    if (typeof credential !== "string") throw new HttpError(400, "Missing credential");
    const user = await verifyGoogleCredential(credential);
    await listAdmins(true);
    if (!(await isAllowedAdmin(user.email))) {
      throw new HttpError(403, `${user.email} doesn't have access to the Mode Society admin.`);
    }
    await createSession(user);
    return Response.json({ ok: true, email: user.email });
  } catch (err) {
    return errorResponse(err);
  }
}
