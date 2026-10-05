/**
 * Every image on the public site is a "slot". The admin panel is generated from
 * this list, and each slot falls back to its defaults until something is uploaded.
 */
export type SlotDef = {
  id: string;
  label: string;
  page: string;
  hint: string;
  /** collection slots hold an ordered list; single slots hold one image */
  kind: "single" | "collection";
  max?: number;
  /** what the slot shows; videos can only come from a Drive folder (too large to upload through the site) */
  accept?: "image" | "video" | "media" | "svg";
  /**
   * Drive folder (inside the website folder) the slot reads from automatically.
   * Anything uploaded through the admin panel takes priority over the folder.
   */
  folder?: string;
  /** turn near-white backgrounds transparent on upload (logos) */
  knockout?: boolean;
  defaults: { src: string; alt: string }[];
};

const wall = (n: number) => `/defaults/wall-${String(n).padStart(2, "0")}.jpg`;

export const SLOTS: SlotDef[] = [
  {
    id: "brand.logo",
    label: "Logo (SVG)",
    page: "Everywhere",
    hint: "Header, cursor, hero background and footer. Use an SVG: it is recoloured burgundy/white and animated letter by letter. Drop it in the Drive folder \"Home Page 1\".",
    kind: "single",
    accept: "svg",
    folder: "Home Page 1",
    defaults: [],
  },
  {
    id: "home.wall",
    label: "Hero polaroids",
    page: "Home",
    hint: "The pinned polaroids at the top of the homepage. Portrait photos work best. 6–16 images.",
    kind: "collection",
    max: 16,
    accept: "image",
    folder: "Home Page 1",
    defaults: Array.from({ length: 12 }, (_, i) => ({ src: wall(i + 1), alt: "Mode Society talent" })),
  },
  {
    id: "home.videos",
    label: "Orbit videos",
    page: "Home & About",
    hint: "Short portrait videos (MP4) for the orbiting carousel. Add them to the Drive folder \"Home Page 2\"; photos work too.",
    kind: "collection",
    max: 12,
    accept: "media",
    folder: "Home Page 2",
    defaults: [3, 5, 7, 9, 11, 2].map((n) => ({ src: wall(n), alt: "Mode Society creator content" })),
  },
  {
    id: "home.clients",
    label: "Brands our creators have worked with",
    page: "Home, For brands, For talent",
    hint: "Brand logos that float around. White backgrounds are removed automatically on upload. Drive folder: \"Home Page 3\".",
    kind: "collection",
    max: 30,
    accept: "image",
    folder: "Home Page 3",
    knockout: true,
    defaults: [],
  },
  {
    id: "about.team",
    label: "About — Team photo",
    page: "About",
    hint: "Asha, Tiana and Patrick. Landscape or portrait. Drive folder: \"About Us 1\".",
    kind: "single",
    accept: "image",
    folder: "About Us 1",
    defaults: [],
  },
  {
    id: "brands.instagram",
    label: "For brands — Instagram grid",
    page: "For brands",
    hint: "Posts shown in the For brands hero, linking to Instagram. Drive folder: \"Instagram\".",
    kind: "collection",
    max: 9,
    accept: "image",
    folder: "Instagram",
    defaults: [1, 6, 8, 12, 4, 10].map((n) => ({ src: wall(n), alt: "Mode Society on Instagram" })),
  },
  ...(
    [
      ["service.influencer", "01 Influencer Campaigns", 7],
      ["service.ugc", "02 UGC Content", 12],
      ["service.events", "03 Event Guest Lists", 9],
      ["service.funding", "04 Funding", 6],
      ["service.ai", "05 AI Campaigns", 5],
    ] as const
  ).map(
    ([id, name, n]): SlotDef => ({
      id,
      label: `Services — ${name.slice(3)}`,
      page: "Services",
      hint: `Photos or video for this service. Drive folder: "Services/${name}".`,
      kind: "collection",
      max: 6,
      accept: "media",
      folder: `Services/${name}`,
      defaults: [{ src: wall(n), alt: name.slice(3) }],
    }),
  ),
  {
    id: "home.casting",
    label: "Game faces (optional)",
    page: "Home",
    hint: "Photos for the homepage game. Leave empty to reuse the hero polaroids.",
    kind: "collection",
    max: 6,
    accept: "image",
    defaults: [],
  },
  { id: "contact.brands", label: "For brands panel", page: "Home", hint: "Used by the Split, Tilt and Blinds styles of the \"Let's work together\" section.", kind: "single", accept: "image", defaults: [{ src: wall(3), alt: "For brands" }] },
  { id: "contact.talent", label: "For talent panel", page: "Home", hint: "Used by the Split, Tilt and Blinds styles of the \"Let's work together\" section.", kind: "single", accept: "image", defaults: [{ src: wall(2), alt: "For talent" }] },
  { id: "meta.share", label: "Social share image", page: "Link previews", hint: "Shown when the site is shared on socials/iMessage. Landscape 1200×630.", kind: "single", accept: "image", defaults: [] },
];

export const SLOT_IDS = new Set(SLOTS.map((s) => s.id));

export type HeroMode = "pinboard" | "scatter" | "orbit" | "gravity";
export type IntroStyle = "curtain" | "develop" | "none";
export type CursorStyle = "logo" | "ring" | "spotlight" | "off";
export type GameMode = "memory" | "shortlist" | "shell" | "puzzle" | "darkroom" | "rotate" | "off";
export type CtaStyle = "split" | "reveal" | "tilt" | "blinds";
export type FooterStyle = "magnetic" | "swing" | "static";

export const HERO_MODES: { id: HeroMode; label: string; description: string }[] = [
  { id: "pinboard", label: "Pinboard", description: "Pinned polaroids that swing in the cursor's breeze. Drag to rearrange, double-click to unpin." },
  { id: "scatter", label: "Parallax Scatter", description: "Photos float in layered depth and drift away from the cursor like a magnet." },
  { id: "orbit", label: "Orbit", description: "A 3D carousel of polaroids. Drag to spin; click to bring one forward." },
  { id: "gravity", label: "Gravity Drop", description: "Polaroids hang pinned around the notepad. Hover the notepad and they all drop; then grab and fling them." },
];

export const INTRO_STYLES: { id: IntroStyle; label: string; description: string }[] = [
  { id: "curtain", label: "Curtain", description: "A burgundy curtain lifts to reveal the logo." },
  { id: "develop", label: "Polaroid develop", description: "Page fades in from a warm over-exposed white, like a developing photo." },
  { id: "none", label: "None", description: "No intro animation." },
];

export const CURSOR_STYLES: { id: CursorStyle; label: string; description: string }[] = [
  { id: "logo", label: "Logo", description: "The Mode Society logo follows the cursor." },
  { id: "ring", label: "Ring", description: "A soft ring that grows and labels things you can drag or flip." },
  { id: "spotlight", label: "Spotlight", description: "A warm spotlight that follows the cursor." },
  { id: "off", label: "System cursor", description: "Normal cursor." },
];

export const GAME_MODES: { id: GameMode; label: string; description: string }[] = [
  { id: "memory", label: "Casting Call", description: "Memory match: flip cards and pair up the faces against the clock." },
  { id: "shortlist", label: "The Shortlist", description: "Swipe right to cast, left to pass. Build a shortlist of three." },
  { id: "shell", label: "Eye on the Talent", description: "Follow the starred polaroid as the cards shuffle. It gets faster every level." },
  { id: "puzzle", label: "Editorial Puzzle", description: "A sliding-tile puzzle of a talent photo. Peek if you get stuck." },
  { id: "darkroom", label: "Darkroom", description: "Rub the undeveloped polaroids to develop each photo." },
  { id: "rotate", label: "Rotate", description: "A different game on each visit." },
  { id: "off", label: "Hidden", description: "No game section on the homepage." },
];

export const CTA_STYLES: { id: CtaStyle; label: string; description: string }[] = [
  { id: "split", label: "Split panels", description: "Two photo panels; the one you hover widens and turns to colour." },
  { id: "reveal", label: "Type reveal", description: "Big typographic rows; the logo follows the cursor as you hover each one." },
  { id: "tilt", label: "Tilt cards", description: "Two pinned polaroids that tilt in 3D toward the cursor, with a glare." },
  { id: "blinds", label: "Blinds", description: "Ink slats open like venetian blinds to reveal each photo." },
];

export const FOOTER_STYLES: { id: FooterStyle; label: string; description: string }[] = [
  { id: "magnetic", label: "Magnetic", description: "The giant wordmark's letters rise toward the cursor." },
  { id: "swing", label: "Swing", description: "Letters hang like pinned cards and swing as the cursor passes. Click one to spin it." },
  { id: "static", label: "Static", description: "A still wordmark." },
];

export type SiteSettings = {
  heroMode: HeroMode;
  heroAutoCycle: boolean;
  introStyle: IntroStyle;
  cursorStyle: CursorStyle;
  gameMode: GameMode;
  ctaStyle: CtaStyle;
  footerStyle: FooterStyle;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  heroMode: "gravity",
  heroAutoCycle: false,
  introStyle: "curtain",
  cursorStyle: "logo",
  gameMode: "memory",
  ctaStyle: "reveal",
  footerStyle: "magnetic",
};

/** Only accepts values from the given option list. */
export function pick<T extends string>(options: { id: T }[], value: unknown, fallback: T): T {
  return options.some((o) => o.id === value) ? (value as T) : fallback;
}

export type SiteImage = {
  src: string;
  alt: string;
  fileId?: string;
  type?: "image" | "video";
  /** where it came from: uploaded in the admin panel, a Drive media folder, or a built-in placeholder */
  source?: "upload" | "folder" | "default";
};
export type SiteContent = {
  settings: SiteSettings;
  images: Record<string, SiteImage[]>;
  /** sanitised logo SVG markup (fills set to currentColor), or "" for the text wordmark */
  logoSvg: string;
  connected: boolean;
};
