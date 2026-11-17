import { errorResponse, requireAdmin, requireSide } from "@/lib/auth";
import { callBackend } from "@/lib/backend";
import type { Stats } from "@/lib/insights";

export async function GET(req: Request) {
  try {
    const session = await requireAdmin();
    const q = new URL(req.url).searchParams;
    const days = Number(q.get("days")) || 30;
    const asked = q.get("side") === "tech" || q.get("side") === "talent" ? (q.get("side") as "tech" | "talent") : null;
    if (asked) requireSide(session, asked);
    // no side asked: both for an admin of both, otherwise their own
    const side = asked ?? (session.sides.length > 1 ? "all" : session.sides[0]);
    const stats = await callBackend<Stats>("getStats", { days: Math.min(Math.max(days, 1), 365), side });
    return Response.json({ ok: true, stats });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
