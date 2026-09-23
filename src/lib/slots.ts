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
  min?: number;
  max?: number;
  defaults: { src: string; alt: string }[];
};

const wall = (n: number) => `/defaults/wall-${String(n).padStart(2, "0")}.jpg`;

export const SLOTS: SlotDef[] = [
  {
    id: "home.wall",
    label: "The Wall — hero polaroids",
    page: "Home",
    hint: "The interactive pinboard at the top of the homepage. Portrait photos work best. 6–16 images.",
    kind: "collection",
    min: 6,
    max: 16,
    defaults: Array.from({ length: 12 }, (_, i) => ({ src: wall(i + 1), alt: "Mode Society talent" })),
  },
  {
    id: "home.casting",
    label: "Casting Call — memory game faces",
    page: "Home",
    hint: "Used in the flip-card matching game. Exactly 6 images; leave empty to reuse The Wall.",
    kind: "collection",
    min: 0,
    max: 6,
    defaults: [],
  },
  {
    id: "brand.logo",
    label: "Logo (optional)",
    page: "Everywhere",
    hint: "Transparent PNG or SVG-style mark. If empty, the typographic wordmark is used.",
    kind: "single",
    defaults: [],
  },
  { id: "service.ugc", label: "Service — UGC content", page: "Home", hint: "Portrait, 4:5.", kind: "single", defaults: [{ src: wall(7), alt: "UGC content" }] },
  { id: "service.models", label: "Service — Models", page: "Home", hint: "Portrait, 4:5.", kind: "single", defaults: [{ src: wall(12), alt: "Models" }] },
  { id: "service.gifting", label: "Service — Influencer gifting", page: "Home", hint: "Portrait, 4:5.", kind: "single", defaults: [{ src: wall(9), alt: "Influencer gifting" }] },
  { id: "service.campaign", label: "Service — Full-scale campaigns", page: "Home", hint: "Portrait, 4:5.", kind: "single", defaults: [{ src: wall(6), alt: "Full-scale campaigns" }] },
  { id: "service.events", label: "Service — Events", page: "Home", hint: "Portrait, 4:5.", kind: "single", defaults: [{ src: wall(10), alt: "Event talent" }] },
  {
    id: "home.clients",
    label: "Client / brand logos",
    page: "Home",
    hint: "Logos for the scrolling brand strip. Transparent PNGs on a light background look best.",
    kind: "collection",
    min: 0,
    max: 20,
    defaults: [],
  },
  { id: "about.founder", label: "About — Founder portrait", page: "About", hint: "Portrait of Asha, 3:4.", kind: "single", defaults: [{ src: wall(1), alt: "Asha Stonehouse, founder" }] },
  {
    id: "about.gallery",
    label: "About — Gallery strip",
    page: "About",
    hint: "Horizontal-scrolling gallery. 3–10 images.",
    kind: "collection",
    min: 0,
    max: 10,
    defaults: [2, 3, 5, 8, 11].map((n) => ({ src: wall(n), alt: "Mode Society" })),
  },
  { id: "talent.hero", label: "Apply as talent — side image", page: "Apply", hint: "Portrait, 3:4.", kind: "single", defaults: [{ src: wall(5), alt: "Apply to Mode Society" }] },
  { id: "brands.hero", label: "Work with us — side image", page: "Work with us", hint: "Portrait, 3:4.", kind: "single", defaults: [{ src: wall(11), alt: "Work with Mode Society" }] },
  { id: "contact.brands", label: "Contact — For brands card", page: "Contact", hint: "Portrait, 3:4.", kind: "single", defaults: [{ src: wall(3), alt: "For brands" }] },
  { id: "contact.talent", label: "Contact — For talent card", page: "Contact", hint: "Portrait, 3:4.", kind: "single", defaults: [{ src: wall(2), alt: "For talent" }] },
  { id: "meta.share", label: "Social share image", page: "Link previews", hint: "Shown when the site is shared on socials/iMessage. Landscape 1200×630.", kind: "single", defaults: [] },
];

export const SLOT_IDS = new Set(SLOTS.map((s) => s.id));

export type HeroMode = "pinboard" | "scatter" | "orbit" | "gravity";
export type IntroStyle = "curtain" | "develop" | "none";
export type CursorStyle = "ring" | "spotlight" | "off";
export type GameMode = "memory" | "shortlist" | "shell" | "puzzle" | "darkroom" | "rotate" | "off";
export type CtaStyle = "split" | "reveal" | "tilt" | "blinds";
export type FooterStyle = "magnetic" | "swing" | "static";

export const HERO_MODES: { id: HeroMode; label: string; description: string }[] = [
  { id: "pinboard", label: "Pinboard", description: "Pinned polaroids that swing in the cursor's breeze. Drag to rearrange, double-click to unpin." },
  { id: "scatter", label: "Parallax Scatter", description: "Photos float in layered depth and drift away from the cursor like a magnet." },
  { id: "orbit", label: "Orbit", description: "A 3D carousel of polaroids. Drag to spin; click to bring one forward." },
  { id: "gravity", label: "Gravity Drop", description: "Polaroids tumble from above and pile up. Grab and fling them around." },
];

export const INTRO_STYLES: { id: IntroStyle; label: string; description: string }[] = [
  { id: "curtain", label: "Curtain", description: "Black curtain lifts to reveal the wordmark." },
  { id: "develop", label: "Polaroid develop", description: "Page fades in from a warm over-exposed white, like a developing photo." },
  { id: "none", label: "None", description: "No intro animation." },
];

export const CURSOR_STYLES: { id: CursorStyle; label: string; description: string }[] = [
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
  { id: "reveal", label: "Type reveal", description: "Big typographic rows; a photo follows the cursor as you hover each one." },
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
  heroMode: "pinboard",
  heroAutoCycle: false,
  introStyle: "curtain",
  cursorStyle: "ring",
  gameMode: "memory",
  ctaStyle: "split",
  footerStyle: "magnetic",
};

/** Only accepts values from the given option list. */
export function pick<T extends string>(options: { id: T }[], value: unknown, fallback: T): T {
  return options.some((o) => o.id === value) ? (value as T) : fallback;
}

export type SiteImage = { src: string; alt: string; fileId?: string };
export type SiteContent = {
  settings: SiteSettings;
  images: Record<string, SiteImage[]>;
  connected: boolean;
};
