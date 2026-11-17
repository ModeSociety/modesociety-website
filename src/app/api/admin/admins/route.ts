import { errorResponse, HttpError, invalidateAdminCache, ownerEmail, requireAdmin } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/api";
import { callBackend } from "@/lib/backend";

const sideOf = (v: unknown) => (v === "talent" || v === "tech" ? v : "");

async function change(req: Request, action: "addAdmin" | "removeAdmin" | "setAdminSide") {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin("both");
    const { email, side } = await req.json();
    const target = String(email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(target)) throw new HttpError(400, "Enter a valid email address");
    if (action === "removeAdmin" && target === ownerEmail()) throw new HttpError(400, "The owner account can't be removed");
    if (action === "removeAdmin" && target === session.email) throw new HttpError(400, "You can't remove yourself");
    if (action === "setAdminSide" && target === ownerEmail()) throw new HttpError(400, "The owner account always has both");
    if (action === "setAdminSide" && target === session.email) throw new HttpError(400, "You can't change your own access");
    const data = await callBackend<{ admins: string[] }>(action, { email: target, side: sideOf(side), by: session.email });
    invalidateAdminCache();
    return Response.json({ ok: true, admins: data.admins });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

export const POST = (req: Request) => change(req, "addAdmin");
export const DELETE = (req: Request) => change(req, "removeAdmin");
/** Changes which business an admin can open: { email, side: "talent" | "tech" | "" (both) }. */
export const PUT = (req: Request) => change(req, "setAdminSide");
