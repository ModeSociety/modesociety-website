/**
 * Colours and fonts the team can change in the admin panel (Colours & fonts). Stored in the
 * Settings tab as plain keys; an empty value means "as designed", and only what has been
 * changed is written into the page, so the original look is untouched until someone edits it.
 */

export type FontOption = { id: string; label: string; family: string; /** Google Fonts css2 `family=` value */ google: string };

const font = (id: string, label: string, family: string, google: string): FontOption => ({ id, label, family, google });

/** The first of each list is the font the site was designed with (already loaded, so it's "") */
export const FONTS = {
  display: [
    font("", "Anton (original)", "Anton", ""),
    font("bebas", "Bebas Neue", "Bebas Neue", "Bebas+Neue"),
    font("oswald", "Oswald", "Oswald", "Oswald:wght@600"),
    font("league-gothic", "League Gothic", "League Gothic", "League+Gothic"),
    font("big-shoulders", "Big Shoulders Display", "Big Shoulders Display", "Big+Shoulders+Display:wght@800"),
    font("archivo-black", "Archivo Black", "Archivo Black", "Archivo+Black"),
  ],
  serif: [
    font("", "Instrument Serif (original)", "Instrument Serif", ""),
    font("playfair", "Playfair Display", "Playfair Display", "Playfair+Display:ital@0;1"),
    font("cormorant", "Cormorant Garamond", "Cormorant Garamond", "Cormorant+Garamond:ital,wght@0,500;1,500"),
    font("dm-serif", "DM Serif Display", "DM Serif Display", "DM+Serif+Display:ital@0;1"),
    font("fraunces", "Fraunces", "Fraunces", "Fraunces:ital,wght@0,400;1,400"),
    font("libre-caslon", "Libre Caslon", "Libre Caslon Text", "Libre+Caslon+Text:ital@0;1"),
  ],
  body: [
    font("", "Inter Tight (original)", "Inter Tight", ""),
    font("inter", "Inter", "Inter", "Inter:wght@400;500;600"),
    font("dm-sans", "DM Sans", "DM Sans", "DM+Sans:wght@400;500;600"),
    font("manrope", "Manrope", "Manrope", "Manrope:wght@400;500;600"),
    font("work-sans", "Work Sans", "Work Sans", "Work+Sans:wght@400;500;600"),
    font("karla", "Karla", "Karla", "Karla:wght@400;500;600"),
  ],
  techDisplay: [
    font("", "Schibsted Grotesk (original)", "Schibsted Grotesk", ""),
    font("archivo", "Archivo", "Archivo", "Archivo:wdth,wght@62..125,700..800"),
    font("big-shoulders", "Big Shoulders Display", "Big Shoulders Display", "Big+Shoulders+Display:wght@800"),
    font("chakra", "Chakra Petch", "Chakra Petch", "Chakra+Petch:wght@700"),
    font("oxanium", "Oxanium", "Oxanium", "Oxanium:wght@800"),
    font("space-grotesk", "Space Grotesk", "Space Grotesk", "Space+Grotesk:wght@700"),
  ],
  techBody: [
    font("", "Schibsted Grotesk (original)", "Schibsted Grotesk", ""),
    font("inter", "Inter", "Inter", "Inter:wght@400;500;600"),
    font("dm-sans", "DM Sans", "DM Sans", "DM+Sans:wght@400;500;600"),
    font("manrope", "Manrope", "Manrope", "Manrope:wght@400;500;600"),
    font("space-grotesk", "Space Grotesk", "Space Grotesk", "Space+Grotesk:wght@400;500;600"),
  ],
} as const;

type FontList = keyof typeof FONTS;

export type ThemeField =
  | { key: string; side: "talent" | "tech"; kind: "colour"; label: string; hint: string; original: string }
  | { key: string; side: "talent" | "tech"; kind: "font"; label: string; hint: string; list: FontList };

export const THEME_FIELDS: ThemeField[] = [
  { key: "themeInk", side: "talent", kind: "colour", label: "Main colour", hint: "Headlines, buttons, the burgundy sections and the footer", original: "#7f090d" },
  { key: "themeAccent", side: "talent", kind: "colour", label: "Accent colour", hint: "The red marker strokes and small highlights", original: "#aa1f1f" },
  { key: "themePaper", side: "talent", kind: "colour", label: "Background", hint: "The page itself", original: "#ffffff" },
  { key: "themeFontDisplay", side: "talent", kind: "font", label: "Headline font", hint: "The big condensed capitals", list: "display" },
  { key: "themeFontSerif", side: "talent", kind: "font", label: "Accent font", hint: "The italic words in headlines and quotes", list: "serif" },
  { key: "themeFontBody", side: "talent", kind: "font", label: "Body font", hint: "Paragraphs, buttons and forms", list: "body" },
  { key: "techThemeBlue", side: "tech", kind: "colour", label: "Main colour", hint: "Royal blue: links, highlights, the menu numbers and the Campaigns glass", original: "#3e5ef0" },
  { key: "techThemeText", side: "tech", kind: "colour", label: "Text colour", hint: "Headlines and paragraphs", original: "#0d1240" },
  { key: "techThemeGround", side: "tech", kind: "colour", label: "Background", hint: "The page itself", original: "#ffffff" },
  { key: "techThemeFontDisplay", side: "tech", kind: "font", label: "Headline font", hint: "Headlines, condensed and wide", list: "techDisplay" },
  { key: "techThemeFontBody", side: "tech", kind: "font", label: "Body font", hint: "Paragraphs, buttons and forms", list: "techBody" },
];

export type Theme = Record<string, string>;

export const HEX = /^#[0-9a-f]{6}$/i;

/** Whether a value can be stored for this key ("" = back to the original). */
export function validThemeValue(key: string, value: string): boolean {
  const f = THEME_FIELDS.find((x) => x.key === key);
  if (!f) return false;
  if (value === "") return true;
  return f.kind === "colour" ? HEX.test(value) : FONTS[f.list].some((o) => o.id === value);
}

/** The saved settings → the theme keys that hold a valid, non-original value. */
export function parseTheme(raw: Record<string, string> = {}): Theme {
  const out: Theme = {};
  for (const f of THEME_FIELDS) {
    const v = String(raw[f.key] ?? "").trim();
    if (v && validThemeValue(f.key, v) && !(f.kind === "colour" && v.toLowerCase() === f.original)) out[f.key] = v;
  }
  return out;
}

export function fontOf(list: FontList, id: string | undefined) {
  return FONTS[list].find((o) => o.id === id && o.id !== "");
}

/** Google Fonts stylesheet for the chosen fonts, or "" when every font is the original. */
export function fontHref(families: (FontOption | undefined)[]) {
  const q = families.filter((f): f is FontOption => Boolean(f?.google)).map((f) => `family=${f.google}`);
  return q.length ? `https://fonts.googleapis.com/css2?${q.join("&")}&display=swap` : "";
}

/** CSS for the talent site's changed colours and fonts (applied on top of globals.css). */
export function talentThemeCss(t: Theme) {
  const v: string[] = [];
  const ink = t.themeInk;
  if (ink) {
    v.push(`--ink:${ink}`, `--pin:${ink}`, `--ink-2:color-mix(in oklab,${ink} 78%,#000)`, `--ink-deep:color-mix(in oklab,${ink} 62%,#000)`);
    v.push(`--muted:color-mix(in oklab,${ink} 55%,#fff)`, `--line:color-mix(in oklab,${ink} 20%,#fff)`, `--chart-mode:color-mix(in oklab,${ink} 85%,#fff)`);
  }
  if (t.themeAccent) v.push(`--red:${t.themeAccent}`);
  if (t.themePaper) v.push(`--paper:${t.themePaper}`, `--paper-2:color-mix(in oklab,${t.themePaper} 94%,${ink || "#7f090d"})`);
  const d = fontOf("display", t.themeFontDisplay);
  const s = fontOf("serif", t.themeFontSerif);
  const b = fontOf("body", t.themeFontBody);
  if (d) v.push(`--font-anton:"${d.family}","Arial Narrow",sans-serif`);
  if (s) v.push(`--font-instrument:"${s.family}",serif`);
  if (b) v.push(`--font-inter-tight:"${b.family}",system-ui,sans-serif`);
  // :root:root outranks the font variables next/font puts on <html>
  return { css: v.length ? `:root:root{${v.join(";")}}` : "", href: fontHref([d, s, b]) };
}

/** CSS for ModeSociety Tech's changed colours and fonts. */
export function techThemeCss(t: Theme) {
  const v: string[] = [];
  const blue = t.techThemeBlue;
  if (blue) v.push(`--t-blue:${blue}`, `--t-accent:color-mix(in oklab,${blue} 88%,#000)`, `--t-blue-2:color-mix(in oklab,${blue} 80%,#000)`);
  if (t.techThemeText) {
    const c = t.techThemeText;
    v.push(`--t-text:${c}`, `--t-text-2:color-mix(in oklab,${c} 72%,#fff)`, `--t-text-3:color-mix(in oklab,${c} 58%,#fff)`);
  }
  if (t.techThemeGround) v.push(`--t-ground:${t.techThemeGround}`);
  const d = fontOf("techDisplay", t.techThemeFontDisplay);
  const b = fontOf("techBody", t.techThemeFontBody);
  if (d) v.push(`--font-anybody:"${d.family}",sans-serif`);
  if (b) v.push(`--font-instrument-sans:"${b.family}",system-ui,sans-serif`);
  const rules = v.length ? [`.tech-root.tech-root{${v.join(";")}}`] : [];
  if (t.techThemeGround) rules.push(`html:has(.tech-root),html:has(.tech-root) body{background:${t.techThemeGround}}`);
  return { css: rules.join(""), href: fontHref([d, b]) };
}
