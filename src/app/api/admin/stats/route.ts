import { errorResponse, requireAdmin } from "@/lib/auth";
import { callBackend } from "@/lib/backend";
import type { Stats } from "@/lib/insights";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const days = Number(new URL(req.url).searchParams.get("days")) || 30;
    const stats = await callBackend<Stats>("getStats", { days: Math.min(Math.max(days, 1), 365) });
    return Response.json({ ok: true, stats });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
