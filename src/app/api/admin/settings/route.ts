import { errorResponse, HttpError, requireAdmin, requireSide } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { refreshSite } from "@/lib/refresh";
import { CTA_STYLES, FOOTER_STYLES, HERO_MODES, INTRO_STYLES } from "@/lib/slots";
import { THEME_FIELDS, validThemeValue } from "@/lib/theme";

/** ModeSociety Tech's key numbers: short free text like "12M", "40+" or "1,200". */
const TECH_NUMBER = /^[\w .,+%$~-]{0,24}$/;
const FREE_TEXT = new Set(["techViews", "techCampaigns"]);

const ALLOWED: Record<string, string[]> = {
  heroMode: HERO_MODES.map((m) => m.id),
  heroAutoCycle: ["true", "false"],
  techLaunched: ["true", "false"],
  introStyle: INTRO_STYLES.map((m) => m.id),
  ctaStyle: CTA_STYLES.map((m) => m.id),
  footerStyle: FOOTER_STYLES.map((m) => m.id),
};

/** Which business a setting belongs to: Tech's theme, launch switch and key numbers, or Mode Society's. */
function settingSide(key: string): "talent" | "tech" {
  const theme = THEME_FIELDS.find((f) => f.key === key);
  if (theme) return theme.side;
  return FREE_TEXT.has(key) || key === "techLaunched" ? "tech" : "talent";
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const { values } = await req.json();
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(values || {})) {
      requireSide(session, settingSide(k));
      const s = String(v);
      const ok = FREE_TEXT.has(k)
        ? TECH_NUMBER.test(s)
        : THEME_FIELDS.some((f) => f.key === k)
          ? validThemeValue(k, s)
          : ALLOWED[k]?.includes(s);
      if (!ok) throw new HttpError(400, `Invalid value for ${k}`);
      clean[k] = s;
    }
    await callBackend("setSettings", { values: clean, by: session.email });
    refreshSite(req);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
