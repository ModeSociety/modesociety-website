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

export type LayoutBlock = { id: string; type: string; hidden: boolean; style: Style; props: Props };

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
  /** takes a section number (01, 02…) on the pages that number their sections */
  numbered?: boolean;
  /** …except on these pages */
  unnumberedOn?: PageId[];
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
  "t.intro": f("talent", "Intro film", "A landscape film with a heading", ["home.intro"], { slots: ["home.intro"], numbered: true }),
  "t.agency": f("talent", "The agency", "Heading, text and button beside the video carousel", ["home.agency"], { slots: ["home.videos"], numbered: true }),
  "t.services": f("talent", "Services cards", "The flip cards on burgundy", ["site.services", "site.quote"], { dark: true, numbered: true }),
  "t.work": f("talent", "Selected work", "Four pieces from Our work", ["home.work"], { slots: ["work.gallery"], numbered: true }),
  "t.clients": f("talent", "Brand logos slideshow", "The two rows of brand logos", ["site.clients"], { slots: ["home.clients"], numbered: true, unnumberedOn: ["talent"] }),
  "t.press": f("talent", "Featured in strip", "Publication logos and the three latest features", ["home.press"], { slots: ["press.logos"], numbered: true }),
  "t.cta": f("talent", "Let's work together", "For brands / For talent (its style is set under Animations)", ["site.cta"], { slots: ["contact.brands", "contact.talent"], numbered: true }),
  "t.numbers": f("talent", "The numbers", "The charts comparing Mode Society with an in-house marketer", ["site.numbers"], { numbered: true }),
  "t.aboutHero": f("talent", "About: page title", "About us, big", ["about.hero"]),
  "t.aboutStory": f("talent", "About: our story", "The quote, the story and team photo", ["about.story", "site.quote"], { slots: ["about.team"] }),
  "t.aboutServices": f("talent", "About: what we do", "The services as dropdowns beside the video carousel", ["about.services", "site.services"], { slots: ["home.videos"], numbered: true }),
  "t.expect": f("talent", "What you can expect", "Swipe-through cards on burgundy", ["site.expect"], { dark: true }),
  "t.brandsHero": f("talent", "For brands: page title", "Let's work together, with the Instagram grid", ["brands.hero"], { slots: ["brands.instagram"] }),
  "t.approach": f("talent", "Our approach", "The pull quote", ["brands.approach", "site.quote"]),
  "t.brandsFaq": f("talent", "Questions brands ask", "FAQ dropdowns", ["brands.faq"]),
  "t.brandsForm": f("talent", "Brand enquiry form", "Tell us about your brand + the form", ["brands.form", "site.forms"], { page: "brands" }),
  "t.talentHero": f("talent", "For talent: page title", "Thinking of signing?", ["talent.hero"]),
  "t.why": f("talent", "Why we started", "The struck-through list", ["talent.why"], { numbered: true }),
  "t.talentExpect": f("talent", "What you can expect (talent)", "Big text and the four steps", ["talent.expect"], { numbered: true }),
  "t.forYou": f("talent", "What we do for you", "The ticked list", ["talent.forYou"], { numbered: true }),
  "t.flexible": f("talent", "Flexible representation", "Three cards", ["talent.flexible"], { numbered: true }),
  "t.talentFaq": f("talent", "Questions creators ask", "FAQ dropdowns", ["talent.faq"]),
  "t.talentForm": f("talent", "Talent application form", "Want Mode to represent you? + the form", ["talent.form", "site.forms"], { page: "talent" }),
  "t.servicesHero": f("talent", "Services: page title", "Four ways we work with brands", ["services.hero"]),
  "t.servicesShowcase": f("talent", "Services, step by step", "One service at a time with the pinwheel", ["services.list"], { slots: ["services.orbit"] }),
  "t.workHero": f("talent", "Our work: page title", "Work/archive", ["work.hero"]),
  "t.workGallery": f("talent", "Our work gallery", "Every piece, with the brand list", ["work.gallery"], { slots: ["work.gallery", "home.clients"] }),
  "t.workNext": f("talent", "Want to be next?", "Closing call on burgundy", ["work.next"], { dark: true }),
  "t.pressHero": f("talent", "Featured in: page title", "Featured in, over the blurred word", ["press.hero"]),
  "t.pressList": f("talent", "Featured in: logos and features", "Publication logos and every feature (or the message while there's none)", ["press.hero"], { slots: ["press.logos"] }),
  "t.partner": f("talent", "Partner with us: title and form", "The heading and the partnership form", ["partner.hero", "site.forms"], { page: "partner" }),
  "t.contactHero": f("talent", "Contact: page title", "Get in touch, with the line under it", ["contact.hero"]),
  "t.contactCards": f("talent", "Contact: who are you?", "The three cards that open each form", ["contact.cards", "site.forms"], { page: "contact" }),
  "t.contactSocials": f("talent", "Contact: social links", "The line beside the social links", ["contact.hero"]),

  // ---- ModeSociety Tech's designed sections ----
  "x.hero": f("tech", "Arena hero", "The 3D m on the grid floor, the two doors and the ticker", ["techHome.hero"]),
  "x.intro": f("tech", "Intro film", "A landscape film with a heading", ["techHome.intro"], { slots: ["tech.intro"] }),
  "x.who": f("tech", "Who are we?", "The big text and the category cards", ["techHome.who", "tech.categories"]),
  "x.logos": f("tech", "Brand logos", "Brands our creators have worked with (shows once Tech is launched)", ["tech.logos"], { slots: ["tech.clients"] }),
  "x.talent": f("tech", "Choose your creator", "The character select (shows once Tech is launched)", ["techHome.talent"]),
  "x.run": f("tech", "What we run", "The formats bento", ["techHome.run", "tech.formats"]),
  "x.policy": f("tech", "18+ policy", "The policy band and figures", ["tech.policy"]),
  "x.landingForms": f("tech", "Enquiry forms (landing page)", "Both forms, on the landing page before launch", ["techHome.contact"], { page: "techHome" }),
  "x.faqHome": f("tech", "Questions (both)", "The first three questions for brands and for creators", ["tech.faq"]),
  "x.brandsHead": f("tech", "For brands: page title", "Why brands call us", ["techBrands.hero"]),
  "x.numbers": f("tech", "Key numbers", "Followers, views and campaigns (set under Roster)", []),
  "x.process": f("tech", "Our process", "The quest line", ["techBrands.process"]),
  "x.brandsRun": f("tech", "What we run + who we work with", "Formats and categories", ["techBrands.run", "tech.formats", "tech.categories"]),
  "x.faqBrands": f("tech", "Questions brands ask", "FAQ for brands", ["tech.faq"]),
  "x.creatorsHead": f("tech", "For creators: page title", "Get signed", ["techCreators.hero"]),
  "x.forYou": f("tech", "What we do for you", "Four cards", ["techCreators.forYou"]),
  "x.examples": f("tech", "Who we look after", "Quotes and roster cards", ["techCreators.examples"]),
  "x.join": f("tech", "Get on the roster", "Closing call", ["techCreators.join"]),
  "x.faqCreators": f("tech", "Questions creators ask", "FAQ for creators", ["tech.faq"]),
  "x.talentHead": f("tech", "Our talent: page title", "The roster, with the totals", ["techTalent.hero"]),
  "x.roster": f("tech", "The roster", "Every creator, with filters", ["techTalent.hero"]),
  "x.contactHead": f("tech", "Contact: page title", "Let's work together", ["techContact.hero"]),
  "x.contactForms": f("tech", "Contact: forms", "I'm a brand / I'm a creator", ["techContact.hero"], { page: "techContact" }),
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
  partner: [["t.partner"]],
  contact: [["t.contactHero", "hero"], ["t.contactCards"], ["t.contactSocials"]],
  techHome: [["x.hero", "hero"], ["x.intro", "intro"], ["x.who", "who"], ["x.logos"], ["x.talent", "talent"], ["x.run", "run"], ["x.policy", "policy"], ["x.landingForms"], ["x.faqHome"]],
  techBrands: [["x.brandsHead", "hero"], ["x.numbers"], ["x.intro"], ["x.process", "process"], ["x.brandsRun", "run"], ["x.faqBrands"]],
  techCreators: [["x.creatorsHead", "hero"], ["x.forYou", "forYou"], ["x.examples", "examples"], ["x.policy"], ["x.join"], ["x.faqCreators"]],
  techTalent: [["x.talentHead", "hero"], ["x.roster"]],
  techContact: [["x.contactHead"], ["x.contactForms"]],
};

/** Pages whose designed sections are numbered (01, 02…). */
export const NUMBERED_PAGES: PageId[] = ["home", "about", "talent"];

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
  };
}

/** The designed page, plus any blocks added the old way at their spots. */
export function defaultLayout(page: PageId, content: Record<string, unknown> = {}): LayoutBlock[] {
  const legacy = readBlocks(content)[page];
  const out: LayoutBlock[] = [];
  for (const [type, spot] of DEFAULTS[page]) {
    out.push({ id: `d-${type.replace(/\W/g, "")}`, type, hidden: false, style: { ...BLANK_STYLE }, props: { ...BLANK_PROPS } });
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
  { id: "partner", label: "Partnership enquiry (Mode Society)", side: "talent" },
  { id: "tech", label: "Brand enquiry / creator application (Tech)", side: "tech" },
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
  return { id, type, hidden: r.hidden === true, style: cleanStyle(r.style), props: cleanProps(r.props) };
}

/** A page's saved layout ("layout.home"), or its unpublished draft ("layoutDraft.home"); null when there's none. */
export function savedLayout(page: PageId, content: Record<string, unknown> = {}, draft = false): LayoutBlock[] | null {
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

/** Whether a designed section takes a number on this page. */
export function takesNumber(type: string, page: PageId) {
  const def = DEFS[type];
  return def?.kind === "feature" && Boolean(def.numbered) && NUMBERED_PAGES.includes(page) && !def.unnumberedOn?.includes(page);
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
  return { layouts, drafts, saved };
}

/** The Drive photo's address: straight from Google once uploads are link-viewable, otherwise through the site. */
export const photoSrc = (fileId: string, uploadsPublic: boolean) =>
  uploadsPublic ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w2400` : `/media/${encodeURIComponent(fileId)}`;

/** Whether a style has anything set (an untouched block is drawn exactly as designed). */
export const styled = (s: Style) => (Object.keys(BLANK_STYLE) as (keyof Style)[]).some((k) => s[k] !== BLANK_STYLE[k]);
