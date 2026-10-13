import { revalidatePath, revalidateTag } from "next/cache";
import { errorResponse, HttpError, requireAdmin } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/api";
import { callBackend, SITE_TAG } from "@/lib/backend";
import { CTA_STYLES, FOOTER_STYLES, HERO_MODES, INTRO_STYLES } from "@/lib/slots";

const ALLOWED: Record<string, string[]> = {
  heroMode: HERO_MODES.map((m) => m.id),
  heroAutoCycle: ["true", "false"],
  introStyle: INTRO_STYLES.map((m) => m.id),
  ctaStyle: CTA_STYLES.map((m) => m.id),
  footerStyle: FOOTER_STYLES.map((m) => m.id),
};

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const { values } = await req.json();
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(values || {})) {
      const s = String(v);
      if (!ALLOWED[k]?.includes(s)) throw new HttpError(400, `Invalid value for ${k}`);
      clean[k] = s;
    }
    await callBackend("setSettings", { values: clean, by: session.email });
    revalidateTag(SITE_TAG, { expire: 0 });
    revalidatePath("/", "layout");
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
