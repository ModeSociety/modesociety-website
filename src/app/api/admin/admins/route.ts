import { errorResponse, HttpError, invalidateAdminCache, ownerEmail, requireAdmin } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/api";
import { callBackend } from "@/lib/backend";

async function change(req: Request, action: "addAdmin" | "removeAdmin") {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const { email } = await req.json();
    const target = String(email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(target)) throw new HttpError(400, "Enter a valid email address");
    if (action === "removeAdmin" && target === ownerEmail()) throw new HttpError(400, "The owner account can't be removed");
    if (action === "removeAdmin" && target === session.email) throw new HttpError(400, "You can't remove yourself");
    const data = await callBackend<{ admins: string[] }>(action, { email: target, by: session.email });
    invalidateAdminCache();
    return Response.json({ ok: true, admins: data.admins });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

export const POST = (req: Request) => change(req, "addAdmin");
export const DELETE = (req: Request) => change(req, "removeAdmin");
