import { draftMode } from "next/headers";
import { getSiteContent } from "./backend";

/**
 * Whether /tech is the full site or just its landing page. Until the team launches it
 * (admin panel → Pages & text → ModeSociety Tech), visitors see one landing page and the
 * other /tech pages send them there. Signed-in admins can turn on a preview (Next's draft
 * mode) to see and check the full site while it's being built.
 */
export async function techMode() {
  const { settings } = await getSiteContent();
  const preview = (await draftMode()).isEnabled;
  return { launched: settings.techLaunched, preview, landing: !settings.techLaunched && !preview };
}
