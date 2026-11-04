import Animated from "@/components/blocks/Animated";
import { responsive } from "@/lib/img";
import { fontById, photoSrc, styled, type Side, type Style } from "@/lib/builder";

/** How dark a #rrggbb colour is (0 = black, 1 = white). */
export function lightness(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Whether a general block sits on something dark and wants light text. */
export function wantsLightText(s: Style) {
  if (s.bgImage && s.overlay >= 30) return true;
  if (s.bg === "brand") return true;
  return /^#/.test(s.bg) && lightness(s.bg) < 0.18;
}

const PAD = { none: "0px", s: "clamp(20px,3vw,32px)", m: "clamp(40px,6vw,72px)", l: "clamp(64px,9vw,120px)", xl: "clamp(96px,13vw,180px)" } as const;
const mix = (c: string, pct: number, other: string) => `color-mix(in oklab,${c} ${pct}%,${other})`;

/**
 * Draws one block with its own style: background colour or photo, text and accent colours, fonts,
 * spacing, width and animation. The colours are set as the site's own colour variables for just this
 * block, so a designed section (written for the site's burgundy or blue) follows along everywhere
 * inside it. With nothing set, the block is drawn exactly as designed.
 */
export default function Frame({
  id,
  style: s,
  side,
  dark = false,
  generic = false,
  uploadsPublic,
  children,
}: {
  id: string;
  style: Style;
  side: Side;
  /** a designed section that paints its own brand-colour background */
  dark?: boolean;
  generic?: boolean;
  uploadsPublic: boolean;
  children: React.ReactNode;
}) {
  const hide = s.hideOn === "mobile" ? "max-md:hidden" : s.hideOn === "desktop" ? "md:hidden" : "";
  // general blocks fade up unless told otherwise; designed sections keep their own animations
  const kind = s.animation || (generic ? "fade" : "none");
  // a block left as designed: no wrapper box at all (display: contents), only its id for the admin preview
  if (kind === "none" && !styled({ ...s, hideOn: "", animation: "" })) {
    return (
      <div data-block={id} data-root={id} className={`contents ${hide}`}>
        {children}
      </div>
    );
  }

  const v: Record<string, string> = {};
  const tech = side === "tech";

  // background
  let background = "";
  if (s.bg === "tint") background = tech ? "var(--t-surface-2)" : "var(--paper-2)";
  else if (s.bg === "brand") background = tech ? "linear-gradient(180deg,color-mix(in oklab,var(--t-blue) 82%,#fff),var(--t-blue-2))" : "var(--ink)";
  else if (s.bg) {
    if (dark) {
      // the section paints itself in the main colour, so that's what changes
      v["--ink"] = s.bg;
      v["--ink-deep"] = mix(s.bg, 78, "#000");
    } else {
      background = s.bg;
      v["--paper"] = s.bg;
      if (tech) v["--t-ground"] = s.bg;
    }
  }

  // a Mode Society block on something dark: the site's colours turn light inside it, so headings,
  // text, forms and buttons all read (buttons go light with the background colour as their text)
  const inner: Record<string, string> = {};
  const lightBlock = generic && !tech && wantsLightText(s);
  if (lightBlock) {
    const fg = s.text || "#ffffff";
    v["--bf-bg"] = s.bg === "brand" ? "var(--ink)" : /^#/.test(s.bg) ? s.bg : "#141010";
    Object.assign(inner, {
      color: fg,
      "--ink": fg,
      "--ink-2": mix(fg, 86, "transparent"),
      "--muted": mix(fg, 68, "transparent"),
      "--line": mix(fg, 30, "transparent"),
      "--espresso": fg,
      "--pin": fg,
      "--paper": "var(--bf-bg)",
      "--white": "var(--bf-bg)",
    });
  }

  // text
  if (s.text && !lightBlock) {
    v.color = s.text;
    if (dark || (generic && wantsLightText(s))) {
      v["--color-white"] = s.text;
    } else {
      v["--ink"] = s.text;
      v["--ink-2"] = mix(s.text, 80, "#000");
      v["--muted"] = mix(s.text, 60, "#fff");
      v["--espresso"] = s.text;
      if (tech) {
        v["--t-text"] = s.text;
        v["--t-text-2"] = mix(s.text, 72, "#fff");
        v["--t-text-3"] = mix(s.text, 58, "#fff");
      }
    }
  }

  // accent
  if (s.accent) {
    v["--red"] = s.accent;
    if (tech) {
      v["--t-blue"] = s.accent;
      v["--t-accent"] = mix(s.accent, 88, "#000");
      v["--t-blue-2"] = mix(s.accent, 80, "#000");
      v["--pin"] = s.accent;
    }
  }

  // fonts (loaded by the page, see PageRender)
  const heading = fontById(s.headingFont);
  const body = fontById(s.bodyFont);
  if (heading) {
    v["--font-anton"] = `"${heading.family}","Arial Narrow",sans-serif`;
    v["--font-anybody"] = `"${heading.family}",sans-serif`;
  }
  if (body) {
    v["--font-inter-tight"] = `"${body.family}",system-ui,sans-serif`;
    v["--font-instrument-sans"] = `"${body.family}",system-ui,sans-serif`;
    v.fontFamily = `"${body.family}",system-ui,sans-serif`;
  }

  if (s.padTop) v["--bf-pt"] = PAD[s.padTop];
  if (s.padBottom) v["--bf-pb"] = PAD[s.padBottom];
  if (background && !s.bgImage) v.background = background;
  if (s.bgImage && background) v.backgroundColor = background.startsWith("linear") ? "var(--t-blue)" : background;
  if (s.align === "center") v.textAlign = "center";

  const photo = s.bgImage ? photoSrc(s.bgImage, uploadsPublic) : "";

  return (
    <div
      data-block={id}
      className={`bf ${photo ? "relative isolate" : ""} ${hide}`}
      data-pt={s.padTop ? "" : undefined}
      data-pb={s.padBottom ? "" : undefined}
      data-w={s.width || undefined}
      data-bgimg={photo ? "" : undefined}
      data-tinted={background || photo ? "" : undefined}
      style={v as React.CSSProperties}
    >
      {photo && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img {...responsive(photo, "100vw", 2400)} alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full object-cover" />
          {s.overlay > 0 && <div aria-hidden className="absolute inset-0 -z-10 bg-black" style={{ opacity: s.overlay / 100 }} />}
        </>
      )}
      {kind === "none" ? (
        <div className="bf-in" style={inner as React.CSSProperties} data-root={id}>
          {children}
        </div>
      ) : (
        <Animated kind={kind} className="bf-in" style={inner as React.CSSProperties} rootId={id}>
          {children}
        </Animated>
      )}
    </div>
  );
}
