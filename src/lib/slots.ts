import type { PressItem } from "./press";
import type { RosterMember } from "./tech";

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
  /** uploads are added after the Drive folder / built-in images instead of replacing them */
  additive?: boolean;
  /** which side of Mode Society it belongs to (default: talent) */
  side?: "talent" | "tech";
  /** not listed in the Images tab (managed elsewhere, e.g. roster photos) */
  hidden?: boolean;
  defaults: { src: string; alt: string; type?: "image" | "video" }[];
};

const pad = (n: number) => String(n).padStart(2, "0");
const asset = (dir: string, n: number, ext = "jpg") => `/assets/${dir}/${pad(n)}.${ext}`;
const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
const BRAND_FILES = [1, 2, 3, 4, "5svg", 6, 7, 8, 9, 10, 11, 12, 13] as const;
const BRAND_NAMES = ["Anua", "White Fox", "Vanguard", "Princess Polly", "EA Sports", "Shein", "Skims", "Edikted", "Teddi Lab", "Finesse", "Typebea", "Amazon", "Beginning Boutique"];

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
    defaults: range(11).map((n) => ({ src: asset("hero", n), alt: "Mode Society talent" })),
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
    defaults: range(5).map((n) => ({ src: asset("videos", n, "mp4"), alt: "Mode Society creator content", type: "video" as const })),
  },
  {
    id: "home.clients",
    label: "Brands our creators have worked with",
    page: "Home, For brands, For talent",
    hint: "Brand logos for the two-row slideshow. Logos added here join the existing ones (built-in, or the Drive folder \"Home Page 3\"); add as many as you like. White backgrounds are removed automatically.",
    kind: "collection",
    max: 80,
    accept: "image",
    folder: "Home Page 3",
    knockout: true,
    additive: true,
    defaults: BRAND_FILES.map((f, i) => ({
      src: typeof f === "number" ? asset("brands", f, "png") : asset("brands", 5, "svg"),
      alt: BRAND_NAMES[i],
    })),
  },
  {
    id: "about.team",
    label: "About — Team photo",
    page: "About",
    hint: "Asha, Tiana and Patrick. Landscape or portrait. Drive folder: \"About Us 1\".",
    kind: "single",
    accept: "image",
    folder: "About Us 1",
    defaults: [{ src: "/assets/about/team.jpg", alt: "Asha Stonehouse, Tiana Scheirs and Patrick Finnegan" }],
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
    defaults: range(9).map((n) => ({ src: asset("instagram", n), alt: "Mode Society on Instagram" })),
  },
  {
    id: "services.orbit",
    label: "Services — pinwheel",
    page: "Services",
    hint: "Photos and short portrait videos for the rotating pinwheel beside the services. Drive folder: \"Services\" (videos go there, as they're too large to upload here).",
    kind: "collection",
    max: 12,
    accept: "media",
    folder: "Services",
    defaults: [
      ...["influencer-1", "ugc-1", "events-1", "funding-1", "influencer-2", "ugc-2", "ai-1"].map((f) => ({ src: `/assets/services/${f}.jpg`, alt: "Mode Society campaign work" })),
      { src: asset("videos", 1, "mp4"), alt: "Mode Society creator content", type: "video" as const },
      { src: asset("videos", 3, "mp4"), alt: "Mode Society creator content", type: "video" as const },
    ],
  },
  {
    id: "work.gallery",
    label: "Our work — gallery",
    page: "Our work",
    hint: "Campaign photos and short portrait videos for the Our work page, in order. Drive folder: \"Our Work\" (videos go there). The file name is used as the caption, e.g. \"Teddi Lab — UGC.jpg\".",
    kind: "collection",
    max: 40,
    accept: "media",
    folder: "Our Work",
    defaults: [
      { src: "/assets/services/influencer-1.jpg", alt: "Influencer campaign" },
      { src: asset("instagram", 7), alt: "Campaign shoot" },
      { src: asset("videos", 2, "mp4"), alt: "Creator content", type: "video" as const },
      { src: "/assets/services/ugc-1.jpg", alt: "UGC content" },
      { src: "/assets/services/events-1.jpg", alt: "Event guest list" },
      { src: asset("instagram", 4), alt: "Campaign shoot" },
      { src: "/assets/services/influencer-2.jpg", alt: "Influencer campaign" },
      { src: asset("videos", 4, "mp4"), alt: "Creator content", type: "video" as const },
      { src: "/assets/services/ugc-2.jpg", alt: "UGC content" },
      { src: asset("instagram", 5), alt: "Campaign shoot" },
      { src: "/assets/services/funding-1.jpg", alt: "Funded campaign" },
      { src: asset("instagram", 1), alt: "Talent" },
    ],
  },
  {
    id: "press.logos",
    label: "Featured in — press logos",
    page: "Featured in",
    hint: "Logos of the publications Mode Society has been featured in (Vogue, Marie Claire…), shown above the features. Drive folder: \"Featured In\". White backgrounds are removed automatically. The features themselves are written in the Featured in tab.",
    kind: "collection",
    max: 40,
    accept: "image",
    folder: "Featured In",
    knockout: true,
    defaults: [],
  },
  // ---- ModeSociety Tech (/tech) ----
  {
    id: "tech.clients",
    label: "Tech — brands our creators have worked with",
    page: "Tech",
    side: "tech",
    hint: "Logos for the ModeSociety Tech home page. Until there's at least one, the section says the space is open. Drive folder: \"Tech Brands\". White backgrounds are removed automatically.",
    kind: "collection",
    max: 60,
    accept: "image",
    folder: "Tech Brands",
    knockout: true,
    additive: true,
    defaults: [],
  },
  {
    id: "tech.intro",
    label: "Tech — intro video for brands",
    page: "Tech",
    side: "tech",
    hint: "The short ModeSociety Tech introduction on the For brands page (MP4, landscape). Drop it in the Drive folder \"Tech Video\" (too large to upload here). A photo works as a placeholder.",
    kind: "single",
    accept: "media",
    folder: "Tech Video",
    defaults: [],
  },
  {
    id: "tech.roster",
    label: "Tech — roster photos",
    page: "Tech",
    side: "tech",
    hint: "Managed from the Roster tab, one photo per creator.",
    kind: "collection",
    max: 200,
    accept: "image",
    hidden: true,
    defaults: [],
  },
  {
    id: "press.photos",
    label: "Featured in — photos",
    page: "Featured in",
    hint: "Managed from the Featured in tab, with each feature.",
    kind: "collection",
    max: 400,
    accept: "image",
    hidden: true,
    defaults: [],
  },
  { id: "contact.brands", label: "For brands panel", page: "Home", hint: "Used by the Split, Tilt and Blinds styles of the \"Let's work together\" section.", kind: "single", accept: "image", defaults: [{ src: asset("instagram", 4), alt: "For brands" }] },
  { id: "contact.talent", label: "For talent panel", page: "Home", hint: "Used by the Split, Tilt and Blinds styles of the \"Let's work together\" section.", kind: "single", accept: "image", defaults: [{ src: asset("hero", 3), alt: "For talent" }] },
  { id: "meta.share", label: "Social share image", page: "Link previews", hint: "Shown when the site is shared on socials/iMessage. Landscape 1200×630.", kind: "single", accept: "image", defaults: [] },
];

export const SLOT_IDS = new Set(SLOTS.map((s) => s.id));

export type HeroMode = "pinboard" | "scatter" | "orbit" | "gravity";
export type IntroStyle = "curtain" | "develop" | "none";
export type CtaStyle = "split" | "reveal" | "tilt" | "blinds";
export type FooterStyle = "magnetic" | "swing" | "static";

export const HERO_MODES: { id: HeroMode; label: string; description: string }[] = [
  { id: "pinboard", label: "Pinboard", description: "Pinned polaroids that swing in the cursor's breeze. Drag to rearrange, double-click to unpin." },
  { id: "scatter", label: "Parallax Scatter", description: "Photos float in layered depth and drift away from the cursor like a magnet." },
  { id: "orbit", label: "Orbit", description: "A 3D carousel of polaroids. Drag to spin; click to bring one forward." },
  { id: "gravity", label: "Gravity Drop", description: "Polaroids tumble from above and pile up. Grab and fling them around." },
];

export const INTRO_STYLES: { id: IntroStyle; label: string; description: string }[] = [
  { id: "curtain", label: "Curtain", description: "A burgundy curtain lifts to reveal the logo." },
  { id: "develop", label: "Polaroid develop", description: "Page fades in from a warm over-exposed white, like a developing photo." },
  { id: "none", label: "None", description: "No intro animation." },
];

export const CTA_STYLES: { id: CtaStyle; label: string; description: string }[] = [
  { id: "split", label: "Split panels", description: "Two photo panels; the one you hover widens and turns to colour." },
  { id: "reveal", label: "Type reveal", description: "Big typographic rows that slide across as you hover each one." },
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
  ctaStyle: CtaStyle;
  footerStyle: FooterStyle;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  heroMode: "gravity",
  heroAutoCycle: false,
  introStyle: "curtain",
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
  /** ModeSociety Tech: visible roster members, in display order */
  roster: RosterMember[];
  /** Featured in: visible features, in display order */
  press: PressItem[];
  /** ModeSociety Tech key numbers set in the admin panel ("" = not set) */
  techStats: { views: string; campaigns: string };
  /** sanitised logo SVG markup (fills set to currentColor), or "" for the text wordmark */
  logoSvg: string;
  connected: boolean;
};
