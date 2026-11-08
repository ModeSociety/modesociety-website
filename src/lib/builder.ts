/**
 * The page builder. Every page on both sites is an ordered list of blocks, saved in the Content
 * tab of the Sheet as "layout.<page>". A block is either one of the site's designed sections
 * ("feature" blocks: the polaroid hero, the flip cards, the character select…, whose wording is
 * edited as before) or a general block from the library (text, image, banner, cards…). Every
 * block has its own style: background colour or photo, text and accent colours, heading and body
 * fonts, animation, spacing and width. A page with no saved layout is built from its default,
 * which reproduces the designed page exactly.
 */
import { BLOCK_PAGES, readBlocks, type Block as LegacyBlock, type BlockPage } from "./blocks";
import { FONTS } from "./theme";
import type { SectionId } from "./copy";

export type Side = "talent" | "tech";
export type PageId = BlockPage;
export const PAGE_IDS = Object.keys(BLOCK_PAGES) as PageId[];
export const isPageId = (v: unknown): v is PageId => typeof v === "string" && v in BLOCK_PAGES;
export { BLOCK_PAGES as PAGES };

// ---------------------------------------------------------------------------
// Style
// ---------------------------------------------------------------------------

export const ANIMATIONS = [
  { id: "", label: "As designed" },
  { id: "none", label: "No animation" },
  { id: "fade", label: "Fade up" },
  { id: "slide", label: "Slide in" },
  { id: "zoom", label: "Zoom in" },
  { id: "reveal", label: "Reveal (photos wipe open)" },
  { id: "parallax", label: "Parallax (photos drift)" },
] as const;
export const SPACING = [
  { id: "", label: "As designed" },
  { id: "none", label: "None" },
  { id: "s", label: "Small" },
  { id: "m", label: "Medium" },
  { id: "l", label: "Large" },
  { id: "xl", label: "Extra large" },
] as const;
export const WIDTHS = [
  { id: "", label: "As designed" },
  { id: "narrow", label: "Narrow" },
  { id: "wide", label: "Wide" },
  { id: "full", label: "Edge to edge" },
] as const;
export const ALIGNS = [
  { id: "", label: "As designed" },
  { id: "left", label: "Left" },
  { id: "center", label: "Centred" },
] as const;
export const HIDE_ON = [
  { id: "", label: "Phones and computers" },
  { id: "mobile", label: "Computers only" },
  { id: "desktop", label: "Phones only" },
] as const;

export type Style = {
  bg: string;
  bgImage: string;
  overlay: number;
  text: string;
  accent: string;
  headingFont: string;
  bodyFont: string;
  animation: (typeof ANIMATIONS)[number]["id"];
  padTop: (typeof SPACING)[number]["id"];
  padBottom: (typeof SPACING)[number]["id"];
  width: (typeof WIDTHS)[number]["id"];
  align: (typeof ALIGNS)[number]["id"];
  hideOn: (typeof HIDE_ON)[number]["id"];
};
export const BLANK_STYLE: Style = { bg: "", bgImage: "", overlay: 0, text: "", accent: "", headingFont: "", bodyFont: "", animation: "", padTop: "", padBottom: "", width: "", align: "", hideOn: "" };

/** Every font on offer for a block (both sides' lists, each once), keyed by id. */
export const BLOCK_FONTS = (() => {
  const seen = new Map<string, { id: string; label: string; family: string; google: string }>();
  const originals = [
    { id: "anton", label: "Anton", family: "Anton", google: "Anton" },
    { id: "instrument-serif", label: "Instrument Serif", family: "Instrument Serif", google: "Instrument+Serif:ital@0;1" },
    { id: "inter-tight", label: "Inter Tight", family: "Inter Tight", google: "Inter+Tight:wght@400;500;600" },
    { id: "anybody", label: "Anybody", family: "Anybody", google: "Anybody:wdth,wght@50..150,700..800" },
    { id: "instrument-sans", label: "Instrument Sans", family: "Instrument Sans", google: "Instrument+Sans:wght@400;600" },
    { id: "schibsted", label: "Schibsted Grotesk", family: "Schibsted Grotesk", google: "Schibsted+Grotesk:wght@400;500;700;900" },
    { id: "martian-mono", label: "Martian Mono", family: "Martian Mono", google: "Martian+Mono:wght@400;500;700" },
    { id: "press-start", label: "Press Start 2P", family: "Press Start 2P", google: "Press+Start+2P" },
  ];
  for (const f of [...originals, ...Object.values(FONTS).flat()]) if (f.id && !seen.has(f.id)) seen.set(f.id, { id: f.id, label: f.label.replace(" (original)", ""), family: f.family, google: f.google });
  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
})();
export const fontById = (id: string) => BLOCK_FONTS.find((f) => f.id === id);

// ---------------------------------------------------------------------------
// Blocks
// ---------------------------------------------------------------------------

/** A general block's own content (each type uses some of these). */
export type Item = { title: string; text: string; linkLabel: string; linkUrl: string; photo: string };
export type Props = {
  heading: string;
  text: string;
  buttonLabel: string;
  buttonUrl: string;
  button2Label: string;
  button2Url: string;
  caption: string;
  videoUrl: string;
  imageSide: "left" | "right";
  photos: string[];
  items: Item[];
  form: string;
  size: string;
  columns: string;
};
export const BLANK_PROPS: Props = { heading: "", text: "", buttonLabel: "", buttonUrl: "", button2Label: "", button2Url: "", caption: "", videoUrl: "", imageSide: "left", photos: [], items: [], form: "", size: "m", columns: "3" };

export type LayoutBlock = { id: string; type: string; hidden: boolean; style: Style; props: Props; els: ElRule[] };

// ---------------------------------------------------------------------------
// Single elements inside a block (a button, a line, a small label, a heading…)
// ---------------------------------------------------------------------------

export const EL_SIZES = [
  { id: "", label: "As designed" },
  { id: "60", label: "Much smaller" },
  { id: "80", label: "Smaller" },
  { id: "120", label: "Larger" },
  { id: "150", label: "Much larger" },
  { id: "200", label: "Twice the size" },
] as const;
export const EL_WEIGHTS = [
  { id: "", label: "As designed" },
  { id: "400", label: "Regular" },
  { id: "600", label: "Semi-bold" },
  { id: "800", label: "Bold" },
] as const;
export const EL_CASES = [
  { id: "", label: "As designed" },
  { id: "upper", label: "CAPITALS" },
  { id: "none", label: "As typed" },
] as const;
export const EL_STYLES = [
  { id: "", label: "As designed" },
  { id: "italic", label: "Italic" },
  { id: "normal", label: "Not italic" },
] as const;

export type ElStyle = {
  color: string;
  bg: string;
  border: string;
  font: string;
  size: (typeof EL_SIZES)[number]["id"];
  weight: (typeof EL_WEIGHTS)[number]["id"];
  case: (typeof EL_CASES)[number]["id"];
  italic: (typeof EL_STYLES)[number]["id"];
  hidden: boolean;
};
export const BLANK_EL: ElStyle = { color: "", bg: "", border: "", font: "", size: "", weight: "", case: "", italic: "", hidden: false };
/**
 * One element's own style. `sel` is where it sits inside its block, as a chain of
 * "tag:nth-child(n)" steps from the block's content (e.g. "section:nth-child(1)>div:nth-child(2)>a:nth-child(1)");
 * `label` is how the admin panel names it ("Button", "Small label").
 */
export type ElRule = { sel: string; label: string; style: ElStyle; /** for the nav and footer: which one */ root?: "nav" | "footer" };

const SEL = /^[a-z][a-z0-9]{0,9}:nth-child\(\d{1,3}\)(>[a-z][a-z0-9]{0,9}:nth-child\(\d{1,3}\)){0,30}$/;

export function cleanEls(raw: unknown): ElRule[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: ElRule[] = [];
  for (const x of raw.slice(0, 80)) {
    const r = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
    const sel = String(r.sel ?? "");
    const root = r.root === "nav" || r.root === "footer" ? r.root : undefined;
    if (!SEL.test(sel) || seen.has(`${root}:${sel}`)) continue;
    seen.add(`${root}:${sel}`);
    const st = (r.style && typeof r.style === "object" ? r.style : {}) as Record<string, unknown>;
    const hex = (v: unknown) => (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : "");
    const style: ElStyle = {
      color: hex(st.color),
      bg: hex(st.bg),
      border: hex(st.border),
      font: fontById(String(st.font)) ? String(st.font) : "",
      size: pickEl(st.size, EL_SIZES),
      weight: pickEl(st.weight, EL_WEIGHTS),
      case: pickEl(st.case, EL_CASES),
      italic: pickEl(st.italic, EL_STYLES),
      hidden: st.hidden === true,
    };
    if (elStyled(style)) out.push({ sel, label: String(r.label ?? "").slice(0, 60), style, ...(root ? { root } : {}) });
  }
  return out;
}
const pickEl = <T extends string>(v: unknown, list: readonly { id: T }[]): T => (list.some((o) => o.id === v) ? (v as T) : list[0].id);
export const elStyled = (s: ElStyle) => (Object.keys(BLANK_EL) as (keyof ElStyle)[]).some((k) => s[k] !== BLANK_EL[k]);

/**
 * The CSS for a block's (or the nav's, or the footer's) element styles. Buttons take their colours
 * through the site's button variables, so their hover still works.
 */
export function elementCss(root: string, rules: ElRule[]) {
  if (!/^[\w-]{1,40}$/.test(root)) return "";
  const imp = (d: string[]) => d.map((x) => `${x} !important`).join(";");
  return rules
    .filter((r) => SEL.test(r.sel))
    .map((r) => {
      const s = r.style;
      const at = `[data-root="${root}"]>${r.sel}`;
      if (s.hidden) return `${at}{display:none !important}`;
      // what the words inside take on too (they carry the site's own colour and type classes)
      const all: string[] = [];
      if (s.border) all.push(`border-color:${s.border}`);
      const f = fontById(s.font);
      if (f) all.push(`font-family:"${f.family}",sans-serif`);
      if (s.weight) all.push(`font-weight:${s.weight}`);
      if (s.case) all.push(`text-transform:${s.case === "upper" ? "uppercase" : "none"}`);
      if (s.italic) all.push(`font-style:${s.italic}`);
      let css = all.length ? `${at},${at} *{${imp(all)}}` : "";
      // a button fills and colours itself from variables (so its hover still swaps them); anything else directly
      const plain = `${at}:not(.btn)`;
      if (s.color) css += `${plain},${plain} *{${imp([`color:${s.color}`, `-webkit-text-fill-color:${s.color}`])}}${at}.btn{--fg:${s.color} !important}`;
      if (s.bg) css += `${plain}{background:${s.bg} !important}${at}.btn{--bg:${s.bg} !important;border-color:${s.border || s.bg} !important}`;
      if (s.size) css += `${at}{zoom:${Number(s.size) / 100} !important}`;
      return css;
    })
    .join("");
}

/** Fonts used by element styles (for the page to load). */
export const elFonts = (rules: ElRule[]) => rules.map((r) => r.style.font).filter(Boolean);

type FeatureDef = {
  kind: "feature";
  side: Side;
  label: string;
  hint: string;
  /** the wording it shows (edited as before) */
  copy: SectionId[];
  /** the image slots it shows (Images & video) */
  slots?: string[];
  /** it paints its own brand-colour background (its Background option recolours that) */
  dark?: boolean;
  /** only one of it per page makes sense (forms with anchors) */
  page?: PageId;
};
type GenericDef = { kind: "generic"; label: string; hint: string; group: "Text" | "Media" | "Layout"; uses: (keyof Props)[]; photos?: number; itemFields?: (keyof Item)[]; itemName?: string };
export type BlockDef = FeatureDef | GenericDef;

const f = (side: Side, label: string, hint: string, copy: SectionId[], extra: Partial<FeatureDef> = {}): FeatureDef => ({ kind: "feature", side, label, hint, copy, ...extra });
const g = (label: string, hint: string, group: GenericDef["group"], uses: (keyof Props)[], extra: Partial<GenericDef> = {}): GenericDef => ({ kind: "generic", label, hint, group, uses, ...extra });

export const DEFS: Record<string, BlockDef> = {
  // ---- general blocks (both sites) ----
  banner: g("Banner", "A big heading over a photo or colour, with up to two buttons. Set the photo under Style → Background photo.", "Layout", ["heading", "text", "buttonLabel", "buttonUrl", "button2Label", "button2Url", "size"]),
  text: g("Text", "A heading, paragraphs and an optional button", "Text", ["heading", "text", "buttonLabel", "buttonUrl"]),
  image: g("Image", "One photo, with an optional caption", "Media", ["caption"], { photos: 1 }),
  imageText: g("Image + text", "A photo beside a heading, text and a button", "Media", ["heading", "text", "buttonLabel", "buttonUrl", "imageSide"], { photos: 1 }),
  gallery: g("Gallery", "Up to 12 photos in a grid", "Media", ["heading", "text", "caption", "columns"], { photos: 12 }),
  video: g("Video", "A YouTube or Vimeo video", "Media", ["heading", "text", "videoUrl"]),
  quote: g("Quote", "A big pull quote and who said it", "Text", ["text", "caption"]),
  cards: g("Cards", "Two to six cards in a row, each with an optional photo, text and link", "Layout", ["heading", "text", "columns"], { itemFields: ["photo", "title", "text", "linkLabel", "linkUrl"], itemName: "card" }),
  stats: g("Numbers", "Big figures with a caption under each", "Text", ["heading", "text"], { itemFields: ["title", "text"], itemName: "figure" }),
  faq: g("Questions", "Questions that open to show their answers", "Text", ["heading", "text"], { itemFields: ["title", "text"], itemName: "question" }),
  buttons: g("Buttons", "One or two buttons on their own", "Layout", ["buttonLabel", "buttonUrl", "button2Label", "button2Url"]),
  logos: g("Brand logos", "The brand logos sliding past (from Images & video)", "Media", ["heading"]),
  form: g("Enquiry form", "One of the site's forms", "Layout", ["heading", "text", "form"]),
  spacer: g("Space or line", "Empty space, or a thin line, between blocks", "Layout", ["size"]),

  // ---- Mode Society's designed sections ----
  "t.homeHero": f("talent", "Polaroid hero", "The big logo with the falling polaroids, tagline and buttons", ["home.hero"], { slots: ["home.wall"] }),
  "t.intro": f("talent", "Intro film", "A landscape film with a heading", ["home.intro"], { slots: ["home.intro"] }),
  "t.agency": f("talent", "The agency", "Heading, text and button beside the video carousel", ["home.agency"], { slots: ["home.videos"] }),
  "t.services": f("talent", "Services cards", "The flip cards on burgundy", ["site.services", "site.quote"], { dark: true }),
  "t.work": f("talent", "Selected work", "Four pieces from Our work", ["home.work"], { slots: ["work.gallery"] }),
  "t.clients": f("talent", "Brand logos slideshow", "The two rows of brand logos", ["site.clients"], { slots: ["home.clients"] }),
  "t.press": f("talent", "Featured in strip", "Publication logos and the three latest features", ["home.press"], { slots: ["press.logos"] }),
  "t.cta": f("talent", "Let's work together", "For brands / For talent (its style is set under Animations)", ["site.cta"], { slots: ["contact.brands", "contact.talent"] }),
  "t.numbers": f("talent", "The numbers", "The charts comparing Mode Society with an in-house marketer", ["site.numbers"]),
  "t.aboutHero": f("talent", "About: page title", "About us, big", ["about.hero"]),
  "t.aboutStory": f("talent", "About: our story", "The quote, the story and team photo", ["about.story", "site.quote"], { slots: ["about.team"] }),
  "t.aboutServices": f("talent", "About: what we do", "The services as dropdowns beside the video carousel", ["about.services", "site.services"], { slots: ["home.videos"] }),
  "t.expect": f("talent", "What you can expect", "Swipe-through cards on burgundy", ["site.expect"], { dark: true }),
  "t.brandsHero": f("talent", "For brands: page title", "Let's work together, with the Instagram grid", ["brands.hero"], { slots: ["brands.instagram"] }),
  "t.approach": f("talent", "Our approach", "The pull quote", ["brands.approach", "site.quote"]),
  "t.brandsFaq": f("talent", "Questions brands ask", "FAQ dropdowns", ["brands.faq"]),
  "t.brandsForm": f("talent", "Brand enquiry form", "Tell us about your brand + the form", ["brands.form", "site.forms"], { page: "brands" }),
  "t.talentHero": f("talent", "For talent: page title", "Thinking of signing?", ["talent.hero"]),
  "t.why": f("talent", "Why we started", "The struck-through list", ["talent.why"]),
  "t.talentExpect": f("talent", "What you can expect (talent)", "Big text and the four steps", ["talent.expect"]),
  "t.forYou": f("talent", "What we do for you", "The ticked list", ["talent.forYou"]),
  "t.flexible": f("talent", "Flexible representation", "Three cards", ["talent.flexible"]),
  "t.talentFaq": f("talent", "Questions creators ask", "FAQ dropdowns", ["talent.faq"]),
  "t.talentForm": f("talent", "Talent application form", "Want Mode to represent you? + the form", ["talent.form", "site.forms"], { page: "talent" }),
  "t.servicesHero": f("talent", "Services: page title", "Four ways we work with brands", ["services.hero"]),
  "t.servicesShowcase": f("talent", "Services, step by step", "One service at a time with the pinwheel", ["services.list"], { slots: ["services.orbit"] }),
  "t.workHero": f("talent", "Our work: page title", "Work/archive", ["work.hero"]),
  "t.workGallery": f("talent", "Our work gallery", "Every piece, with the brand list", ["work.gallery"], { slots: ["work.gallery", "home.clients"] }),
  "t.workNext": f("talent", "Want to be next?", "Closing call on burgundy", ["work.next"], { dark: true }),
  "t.pressHero": f("talent", "Featured in: page title", "Featured in, over the blurred word", ["press.hero"]),
  "t.pressList": f("talent", "Featured in: logos and features", "Publication logos and every feature (or the message while there's none)", ["press.hero"], { slots: ["press.logos"] }),
  "t.contactHero": f("talent", "Contact: page title", "Get in touch, with the line under it", ["contact.hero"]),
  "t.contactCards": f("talent", "Contact: who are you?", "The three cards that open each form", ["contact.cards", "site.forms"], { page: "contact" }),
  "t.contactSocials": f("talent", "Contact: social links", "The line beside the social links", ["contact.hero"]),

  // ---- ModeSociety Tech's designed sections ----
  "x.hero": f("tech", "Hero", "Not just gaming: the chips, the headline and the Player 1 / Player 2 cards", ["techSite.hero"]),
  "x.ticker": f("tech", "Ticker", "The two moving strips, lime and ink", ["techSite.ticker"]),
  "x.film": f("tech", "Welcome film", "The film under the hero, in a frosted glass frame", ["techSite.film"]),
  "x.who": f("tech", "Who we are", "The big statement and Quality over volume", ["techSite.who"]),
  "x.campaigns": f("tech", "Campaigns", "Cobalt, with the four frosted glass objects", ["techSite.campaigns"], { dark: true }),
  "x.run": f("tech", "What we run", "The bento grid on violet and magenta", ["techSite.run"], { dark: true }),
  "x.rules": f("tech", "House rules", "18+, in-house briefs and the no-go list, on black glass", ["techSite.rules"], { dark: true }),
  "x.contact": f("tech", "Get in touch", "Two ways in: the two-level form for brands and creators", ["techSite.contact"], { page: "techHome" }),
  "x.faq": f("tech", "Questions", "For brands and for creators", ["techSite.faq"]),
};

export const isFeature = (type: string) => DEFS[type]?.kind === "feature";

/** Each page's designed layout, top to bottom, with the spot that old-style blocks were added at. */
const DEFAULTS: Record<PageId, [string, string?][]> = {
  home: [["t.homeHero", "hero"], ["t.intro", "intro"], ["t.agency", "agency"], ["t.services", "services"], ["t.work", "work"], ["t.clients", "clients"], ["t.press", "press"], ["t.cta", "cta"], ["t.numbers"]],
  about: [["t.aboutHero"], ["t.aboutStory", "hero"], ["t.aboutServices", "services"], ["t.numbers", "numbers"], ["t.expect"]],
  brands: [["t.brandsHero", "hero"], ["t.services", "services"], ["t.approach", "approach"], ["t.expect", "expect"], ["t.numbers", "numbers"], ["t.clients", "clients"], ["t.brandsFaq", "faq"], ["t.brandsForm"]],
  talent: [["t.talentHero", "hero"], ["t.why", "why"], ["t.talentExpect", "expect"], ["t.forYou", "forYou"], ["t.flexible", "flexible"], ["t.clients", "clients"], ["t.talentFaq", "faq"], ["t.talentForm"]],
  services: [["t.servicesHero", "hero"], ["t.servicesShowcase"]],
  work: [["t.workHero", "hero"], ["t.workGallery", "gallery"], ["t.workNext"]],
  press: [["t.pressHero", "hero"], ["t.pressList"], ["t.clients"]],
  contact: [["t.contactHero", "hero"], ["t.contactCards"], ["t.contactSocials"]],
  techHome: [["x.hero", "hero"], ["x.ticker", "intro"], ["x.film"], ["x.who", "who"], ["x.campaigns", "talent"], ["x.run", "run"], ["x.rules", "policy"], ["x.contact"], ["x.faq"]],
};


/** Old "Blocks on this page" blocks, as general blocks. */
function fromLegacy(b: LegacyBlock): LayoutBlock {
  return {
    id: b.id,
    type: b.type,
    hidden: !b.visible,
    style: {
      ...BLANK_STYLE,
      animation: b.animation,
      width: b.width === "narrow" ? "narrow" : "",
      bg: "",
      // the old Background option: soft tint or brand colour
      ...(b.tone === "tint" ? { bg: "tint" } : b.tone === "brand" ? { bg: "brand" } : {}),
    },
    props: { ...BLANK_PROPS, heading: b.heading, text: b.text, buttonLabel: b.buttonLabel, buttonUrl: b.buttonUrl, caption: b.caption, videoUrl: b.videoUrl, imageSide: b.imageSide, photos: b.photos },
    els: [],
  };
}

/** The designed page, plus any blocks added the old way at their spots. */
export function defaultLayout(page: PageId, content: Record<string, unknown> = {}): LayoutBlock[] {
  const legacy = readBlocks(content)[page];
  const out: LayoutBlock[] = [];
  for (const [type, spot] of DEFAULTS[page]) {
    out.push({ id: `d-${type.replace(/\W/g, "")}`, type, hidden: false, style: { ...BLANK_STYLE }, props: { ...BLANK_PROPS }, els: [] });
    if (spot) for (const b of legacy.filter((x) => x.spot === spot)) out.push(fromLegacy(b));
  }
  for (const b of legacy.filter((x) => x.spot === "end" || !DEFAULTS[page].some(([, s]) => s === x.spot))) out.push(fromLegacy(b));
  return out;
}

// ---------------------------------------------------------------------------
// Cleaning what comes back from the admin panel or the Sheet
// ---------------------------------------------------------------------------

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n?/g, "\n").slice(0, max) : "");
const HEX = /^#[0-9a-f]{6}$/i;
const colour = (v: unknown) => (typeof v === "string" && (HEX.test(v) || v === "tint" || v === "brand") ? v : "");
const pick = <T extends string>(v: unknown, list: readonly { id: T }[]): T => (list.some((o) => o.id === v) ? (v as T) : list[0].id);
const URL_OK = /^(https?:\/\/|\/|#|mailto:|tel:)/i;
const url = (v: unknown) => {
  const s = str(v, 500).trim();
  return URL_OK.test(s) ? s : "";
};
const fileId = (v: unknown) => (typeof v === "string" && /^[\w-]{10,}$/.test(v) ? v : "");

export function cleanStyle(raw: unknown): Style {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    bg: colour(r.bg),
    bgImage: fileId(r.bgImage),
    overlay: Math.max(0, Math.min(90, Math.round(Number(r.overlay) || 0))),
    text: typeof r.text === "string" && HEX.test(r.text) ? r.text : "",
    accent: typeof r.accent === "string" && HEX.test(r.accent) ? r.accent : "",
    headingFont: fontById(String(r.headingFont)) ? String(r.headingFont) : "",
    bodyFont: fontById(String(r.bodyFont)) ? String(r.bodyFont) : "",
    animation: pick(r.animation, ANIMATIONS),
    padTop: pick(r.padTop, SPACING),
    padBottom: pick(r.padBottom, SPACING),
    width: pick(r.width, WIDTHS),
    align: pick(r.align, ALIGNS),
    hideOn: pick(r.hideOn, HIDE_ON),
  };
}

export const FORMS = [
  { id: "brands", label: "Brand enquiry (Mode Society)", side: "talent" },
  { id: "talent", label: "Talent application (Mode Society)", side: "talent" },
] as const;

export function cleanProps(raw: unknown): Props {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const items = Array.isArray(r.items) ? r.items : [];
  return {
    heading: str(r.heading, 300),
    text: str(r.text, 8000),
    buttonLabel: str(r.buttonLabel, 60),
    buttonUrl: url(r.buttonUrl),
    button2Label: str(r.button2Label, 60),
    button2Url: url(r.button2Url),
    caption: str(r.caption, 300),
    videoUrl: str(r.videoUrl, 500).trim(),
    imageSide: r.imageSide === "right" ? "right" : "left",
    photos: Array.isArray(r.photos) ? r.photos.map(fileId).filter(Boolean).slice(0, 12) : [],
    items: items.slice(0, 24).map((x) => {
      const i = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
      return { title: str(i.title, 300), text: str(i.text, 3000), linkLabel: str(i.linkLabel, 60), linkUrl: url(i.linkUrl), photo: fileId(i.photo) };
    }),
    form: FORMS.some((o) => o.id === r.form) ? String(r.form) : "",
    size: ["s", "m", "l", "xl", "line"].includes(String(r.size)) ? String(r.size) : "m",
    columns: ["1", "2", "3", "4"].includes(String(r.columns)) ? String(r.columns) : "3",
  };
}

/** One block from storage, made safe; null when its type isn't known on this side. */
export function cleanBlock(raw: unknown, side: Side): LayoutBlock | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const type = String(r.type ?? "");
  const def = DEFS[type];
  if (!def || (def.kind === "feature" && def.side !== side)) return null;
  const id = /^[\w-]{3,32}$/.test(String(r.id ?? "")) ? String(r.id) : "";
  if (!id) return null;
  return { id, type, hidden: r.hidden === true, style: cleanStyle(r.style), props: cleanProps(r.props), els: cleanEls(r.els) };
}

/** A page's saved layout ("layout.home"), or its unpublished draft ("layoutDraft.home"); null when there's none. */
export function savedLayout(page: PageId, content: Record<string, unknown> = {}, draft = false): LayoutBlock[] | null {
  const kept = savedLayoutRaw(page, content, draft);
  if (!kept || page !== "techHome" || kept.some((b) => DEFS[b.type]?.kind === "feature")) return kept;
  // saved before the Tech redesign (6 Nov 2026): its sections no longer exist, so the new design is
  // drawn with any blocks the team added kept after it
  return [...defaultLayout(page, content), ...kept];
}

function savedLayoutRaw(page: PageId, content: Record<string, unknown>, draft: boolean): LayoutBlock[] | null {
  const raw = content[`${draft ? "layoutDraft" : "layout"}.${page}`] as { items?: unknown } | undefined;
  if (!raw || !Array.isArray(raw.items)) return null;
  const side = BLOCK_PAGES[page].side;
  const seen = new Set<string>();
  return raw.items
    .map((b) => cleanBlock(b, side))
    .filter((b): b is LayoutBlock => Boolean(b) && !seen.has(b!.id) && Boolean(seen.add(b!.id)))
    .slice(0, 60);
}

/** Block types that can be added on a page: the library, and the designed sections of its side. */
export function addable(page: PageId) {
  const side = BLOCK_PAGES[page].side;
  return Object.entries(DEFS).filter(([, d]) => d.kind === "generic" || (d.side === side && (!d.page || d.page === page)));
}

/** The nav's and footer's element styles for a side ("chrome.talent"), or its draft ("chromeDraft.talent"). */
export function readChrome(side: Side, content: Record<string, unknown> = {}, draft = false): ElRule[] | null {
  const raw = content[`${draft ? "chromeDraft" : "chrome"}.${side}`] as { items?: unknown } | undefined;
  return raw && Array.isArray(raw.items) ? cleanEls(raw.items) : null;
}

/** Every page's live layout and any unpublished drafts. */
export function readLayouts(content: Record<string, unknown> = {}) {
  const layouts = {} as Record<PageId, LayoutBlock[]>;
  const drafts: Partial<Record<PageId, LayoutBlock[]>> = {};
  const saved: PageId[] = [];
  for (const page of PAGE_IDS) {
    const live = savedLayout(page, content);
    if (live) saved.push(page);
    layouts[page] = live ?? defaultLayout(page, content);
    const draft = savedLayout(page, content, true);
    if (draft) drafts[page] = draft;
  }
  const sides: Side[] = ["talent", "tech"];
  const chrome = Object.fromEntries(sides.map((sd) => [sd, readChrome(sd, content) ?? []])) as Record<Side, ElRule[]>;
  const chromeDrafts = Object.fromEntries(sides.flatMap((sd) => (readChrome(sd, content, true) ? [[sd, readChrome(sd, content, true)!]] : []))) as Partial<Record<Side, ElRule[]>>;
  return { layouts, drafts, saved, chrome, chromeDrafts };
}

/** The Drive photo's address: straight from Google once uploads are link-viewable, otherwise through the site. */
export const photoSrc = (fileId: string, uploadsPublic: boolean) =>
  uploadsPublic ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w2400` : `/media/${encodeURIComponent(fileId)}`;

/** Whether a style has anything set (an untouched block is drawn exactly as designed). */
export const styled = (s: Style) => (Object.keys(BLANK_STYLE) as (keyof Style)[]).some((k) => s[k] !== BLANK_STYLE[k]);
