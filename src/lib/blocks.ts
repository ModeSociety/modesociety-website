/**
 * The site's pages, and the blocks added the first way (before the page builder): text, images,
 * galleries, videos and quotes dropped in at one of a page's spots, saved as "blocks.<page>" in the
 * Content tab. They are read only to carry them into a page's layout (see builder.ts
 * defaultLayout); once a page's layout is published they are part of it.
 */
import type { CopySide } from "./copy";

export const BLOCK_TYPES = [
  { id: "text", label: "Text", hint: "A heading, a paragraph or two and an optional button" },
  { id: "image", label: "Image", hint: "One photo, wide or framed, with an optional caption" },
  { id: "imageText", label: "Image + text", hint: "A photo beside a heading, text and a button" },
  { id: "gallery", label: "Gallery", hint: "Two to eight photos in a row or a grid" },
  { id: "video", label: "Video", hint: "A YouTube or Vimeo video, played on the page" },
  { id: "quote", label: "Quote", hint: "A big pull quote and who said it" },
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number]["id"];

export const ANIMATIONS = [
  { id: "none", label: "No animation" },
  { id: "fade", label: "Fade up" },
  { id: "slide", label: "Slide in from the side" },
  { id: "zoom", label: "Zoom in" },
  { id: "reveal", label: "Reveal (photos wipe open)" },
  { id: "parallax", label: "Parallax (photos drift as you scroll)" },
] as const;
export type Animation = (typeof ANIMATIONS)[number]["id"];

export const TONES = [
  { id: "page", label: "Page background" },
  { id: "tint", label: "Soft tint" },
  { id: "brand", label: "Brand colour (light text)" },
] as const;
export const WIDTHS = [
  { id: "wide", label: "Full width" },
  { id: "narrow", label: "Narrow" },
] as const;

export type Block = {
  id: string;
  spot: string;
  type: BlockType;
  animation: Animation;
  tone: (typeof TONES)[number]["id"];
  width: (typeof WIDTHS)[number]["id"];
  visible: boolean;
  heading: string;
  text: string;
  buttonLabel: string;
  buttonUrl: string;
  caption: string;
  videoUrl: string;
  imageSide: "left" | "right";
  /** Drive file IDs */
  photos: string[];
};

type Page = { side: CopySide; label: string; path: string; spots: [string, string][] };

/** Each page and the spots blocks can go in, top to bottom. */
export const BLOCK_PAGES = {
  home: { side: "talent", label: "Home", path: "/", spots: [["hero", "Under the hero"], ["intro", "After the intro film"], ["agency", "After The agency"], ["services", "After the services"], ["work", "After Selected work"], ["clients", "After the brand logos"], ["press", "After Featured in"], ["cta", "After Let's work together"], ["end", "At the end of the page"]] },
  about: { side: "talent", label: "About us", path: "/about", spots: [["hero", "After Our story"], ["services", "After What we do"], ["numbers", "After The numbers"], ["end", "At the end of the page"]] },
  brands: { side: "talent", label: "For brands", path: "/work-with-us", spots: [["hero", "Under the page title"], ["services", "After the services"], ["approach", "After Our approach"], ["expect", "After What you can expect"], ["numbers", "After The numbers"], ["clients", "After the brand logos"], ["faq", "After the questions"], ["end", "At the end of the page"]] },
  talent: { side: "talent", label: "For talent", path: "/apply-to-be-a-creator", spots: [["hero", "Under the page title"], ["why", "After Why we started"], ["expect", "After What you can expect"], ["forYou", "After What we do for you"], ["flexible", "After Flexible representation"], ["clients", "After the brand logos"], ["faq", "After the questions"], ["end", "At the end of the page"]] },
  services: { side: "talent", label: "Services", path: "/services", spots: [["hero", "Under the page title"], ["end", "At the end of the page"]] },
  work: { side: "talent", label: "Our work", path: "/our-work", spots: [["hero", "Under the page title"], ["gallery", "After the gallery"], ["end", "At the end of the page"]] },
  press: { side: "talent", label: "Featured in", path: "/featured-in", spots: [["hero", "Under the page title"], ["end", "At the end of the page"]] },
  partner: { side: "talent", label: "Partner with us", path: "/partner-with-us", spots: [["end", "At the end of the page"]] },
  contact: { side: "talent", label: "Contact us", path: "/get-in-touch", spots: [["hero", "Under the page title"], ["end", "At the end of the page"]] },
  techHome: { side: "tech", label: "Home", path: "/tech", spots: [["hero", "Under the hero"], ["intro", "After the intro film"], ["who", "After Who are we?"], ["talent", "After Choose your creator"], ["run", "After What we run"], ["policy", "After the 18+ policy"], ["end", "At the end of the page"]] },
  techBrands: { side: "tech", label: "For brands", path: "/tech/brands", spots: [["hero", "Under the page title"], ["process", "After Our process"], ["run", "After What we run"], ["end", "At the end of the page"]] },
  techCreators: { side: "tech", label: "For creators", path: "/tech/creators", spots: [["hero", "Under the page title"], ["forYou", "After What we do for you"], ["examples", "After Who we look after"], ["end", "At the end of the page"]] },
  techTalent: { side: "tech", label: "Our talent", path: "/tech/talent", spots: [["hero", "Under the page title"], ["end", "At the end of the page"]] },
  techContact: { side: "tech", label: "Contact", path: "/tech/contact", spots: [["end", "At the end of the page"]] },
} satisfies Record<string, Page>;
export type BlockPage = keyof typeof BLOCK_PAGES;
export const BLOCK_PAGE_IDS = Object.keys(BLOCK_PAGES) as BlockPage[];
export const isBlockPage = (v: unknown): v is BlockPage => typeof v === "string" && v in BLOCK_PAGES;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n?/g, "\n").slice(0, max) : "");
const oneOf = <T extends string>(v: unknown, list: readonly { id: T }[], fallback: T): T => (list.some((o) => o.id === v) ? (v as T) : fallback);
const URL_OK = /^(https?:\/\/|\/|#|mailto:)/i;

/** One saved block, made safe: unknown values fall back, text is trimmed to size. */
export function cleanBlock(raw: unknown, page: BlockPage): Block | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const spots = BLOCK_PAGES[page].spots.map((s) => s[0]);
  const id = /^[\w-]{4,24}$/.test(String(r.id ?? "")) ? String(r.id) : "";
  if (!id) return null;
  const url = str(r.buttonUrl, 500).trim();
  return {
    id,
    spot: spots.includes(String(r.spot)) ? String(r.spot) : "end",
    type: oneOf(r.type, BLOCK_TYPES, "text"),
    animation: oneOf(r.animation, ANIMATIONS, "fade"),
    tone: oneOf(r.tone, TONES, "page"),
    width: oneOf(r.width, WIDTHS, "wide"),
    visible: r.visible !== false,
    heading: str(r.heading, 300),
    text: str(r.text, 6000),
    buttonLabel: str(r.buttonLabel, 60),
    buttonUrl: URL_OK.test(url) ? url : "",
    caption: str(r.caption, 300),
    videoUrl: str(r.videoUrl, 500).trim(),
    imageSide: r.imageSide === "right" ? "right" : "left",
    photos: Array.isArray(r.photos) ? r.photos.filter((x): x is string => typeof x === "string" && /^[\w-]{10,}$/.test(x)).slice(0, 8) : [],
  };
}

/** Every page's blocks from the saved content ("blocks.home" → [...]). */
export function readBlocks(content: Record<string, unknown> = {}): Record<BlockPage, Block[]> {
  return Object.fromEntries(
    BLOCK_PAGE_IDS.map((page) => {
      const raw = content[`blocks.${page}`];
      const list = Array.isArray(raw) ? raw : Array.isArray((raw as { items?: unknown })?.items) ? (raw as { items: unknown[] }).items : [];
      return [page, list.map((b) => cleanBlock(b, page)).filter((b): b is Block => Boolean(b)).slice(0, 40)];
    }),
  ) as Record<BlockPage, Block[]>;
}
