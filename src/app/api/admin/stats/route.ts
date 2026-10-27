import { errorResponse, requireAdmin } from "@/lib/auth";
import { callBackend } from "@/lib/backend";
import type { Stats } from "@/lib/insights";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const q = new URL(req.url).searchParams;
    const days = Number(q.get("days")) || 30;
    const side = q.get("side") === "tech" || q.get("side") === "talent" ? q.get("side") : "all";
    const stats = await callBackend<Stats>("getStats", { days: Math.min(Math.max(days, 1), 365), side });
    return Response.json({ ok: true, stats });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
