import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { errorResponse, requireAdmin } from "@/lib/auth";

/**
 * Preview the full ModeSociety Tech site before it's launched: /api/admin/preview?to=/tech
 * turns preview on for this browser (admins only), ?off turns it off again.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to") || "/tech";
  const target = to.startsWith("/") && !to.startsWith("//") ? to : "/tech";
  const dm = await draftMode();
  if (url.searchParams.has("off")) {
    dm.disable();
    redirect(target);
  }
  try {
    await requireAdmin();
  } catch (err) {
    return errorResponse(err);
  }
  dm.enable();
  redirect(target);
}
