import { unstable_cache } from "next/cache";
import type { PressItem } from "./press";
import type { RosterMember } from "./tech";
import {
  CTA_STYLES,
  DEFAULT_SETTINGS,
  FOOTER_STYLES,
  HERO_MODES,
  INTRO_STYLES,
  pick,
  SLOTS,
  type SlotDef,
  type SiteContent,
  type SiteImage,
  type SiteSettings,
} from "./slots";
import { DEFAULT_LOGO_SVG } from "./defaultLogo";
import { sanitizeLogoSvg } from "./svg";

/** Server-only client for the Google Apps Script backend (see google-apps-script/Code.gs). */

export const SITE_TAG = "site-content";

export function backendConfigured() {
  return Boolean(process.env.APPS_SCRIPT_URL && process.env.APPS_SCRIPT_SECRET);
}

export async function callBackend<T = unknown>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!url || !secret) throw new Error("Backend not configured (APPS_SCRIPT_URL / APPS_SCRIPT_SECRET).");
  // text/plain avoids a CORS preflight and is what Apps Script expects for raw bodies.
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ secret, action, payload }),
    cache: "no-store",
    redirect: "follow",
  });
  const text = await res.text();
  let body: { ok: boolean; data?: T; error?: string };
  try {
    body = JSON.parse(text);
  } catch {
    // Google wraps "Terms of Service" in a link, so match on the page's plain text.
    if (/violation of our\s+Terms of Service/i.test(text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "))) {
      throw new Error("Google has blocked the Apps Script backend for a Terms of Service review. See README → Troubleshooting.");
    }
    throw new Error(`Backend returned non-JSON (HTTP ${res.status}). Check the Apps Script deployment URL and access setting.`);
  }
  if (!body.ok) throw new Error(body.error || "Backend error");
  return body.data as T;
}

type FolderFile = { id: string; name: string; mimeType: string; src: string };

type RawSite = {
  settings: Record<string, string>;
  images: { slot: string; order: number; fileId: string; alt: string }[];
  /** media folder path → files, e.g. "Home Page 2" → videos */
  folders?: Record<string, FolderFile[]>;
  logoSvg?: string;
  roster?: RosterMember[];
  press?: (Omit<PressItem, "photos"> & { photos: string[] })[];
};

function fromFolder(files: FolderFile[] = [], accept: SlotDef["accept"], alt: string): SiteImage[] {
  return files
    .filter((f) => {
      const video = f.mimeType.startsWith("video/");
      const svg = f.mimeType === "image/svg+xml";
      if (accept === "svg") return svg;
      if (svg) return false;
      if (accept === "video") return video;
      if (accept === "image") return !video;
      return true;
    })
    .map((f) => ({
      src: f.src || mediaUrl(f.id),
      // "03-Teddi Lab — UGC.jpg" → "Teddi Lab — UGC": the order prefix is only for sorting
      alt: f.name.replace(/\.[a-z0-9]+$/i, "").replace(/^\d{1,3}(?:\s*[-_.)]\s*|\s+)/, "").replace(/[-_]+/g, " ").trim() || alt,
      fileId: f.id,
      type: f.mimeType.startsWith("video/") ? ("video" as const) : ("image" as const),
      source: "folder" as const,
    }));
}

export function mediaUrl(fileId: string) {
  return `/media/${encodeURIComponent(fileId)}`;
}

function parseSettings(raw: Record<string, string> = {}): SiteSettings {
  const d = DEFAULT_SETTINGS;
  return {
    heroMode: pick(HERO_MODES, raw.heroMode, d.heroMode),
    heroAutoCycle: raw.heroAutoCycle === "true",
    introStyle: pick(INTRO_STYLES, raw.introStyle, d.introStyle),
    ctaStyle: pick(CTA_STYLES, raw.ctaStyle, d.ctaStyle),
    footerStyle: pick(FOOTER_STYLES, raw.footerStyle, d.footerStyle),
  };
}

export function buildContent(raw: RawSite | null): SiteContent {
  const images: Record<string, SiteImage[]> = {};
  for (const slot of SLOTS) {
    // Priority: uploaded through the admin panel → files in the slot's Drive folder → built-in defaults.
    const uploaded: SiteImage[] = (raw?.images ?? [])
      .filter((r) => r.slot === slot.id)
      .sort((a, b) => a.order - b.order)
      .map((r) => ({ src: mediaUrl(r.fileId), alt: r.alt || slot.label, fileId: r.fileId, type: "image", source: "upload" }));
    const folder = slot.folder ? fromFolder(raw?.folders?.[slot.folder], slot.accept, slot.label) : [];
    const base = folder.length ? folder : slot.defaults.map((d) => ({ type: "image" as const, ...d, source: "default" as const }));
    const list = slot.additive ? [...base, ...uploaded] : uploaded.length ? uploaded : base;
    images[slot.id] = slot.max ? list.slice(0, slot.max) : list;
  }
  return {
    settings: parseSettings(raw?.settings),
    images,
    roster: (raw?.roster ?? []).map((m) => ({ ...m, photo: m.photo ? mediaUrl(m.photo) : "" })),
    press: (raw?.press ?? []).map((a) => ({ ...a, photos: a.photos.map((fileId) => ({ fileId, src: mediaUrl(fileId) })) })),
    techStats: { views: raw?.settings?.techViews || "", campaigns: raw?.settings?.techCampaigns || "" },
    logoSvg: sanitizeLogoSvg(raw?.logoSvg || "") || sanitizeLogoSvg(DEFAULT_LOGO_SVG),
    connected: Boolean(raw),
  };
}

const fetchSiteCached = unstable_cache(
  async (): Promise<RawSite | null> => {
    if (!backendConfigured()) return null;
    return callBackend<RawSite>("getSite");
  },
  ["site-content-v3"],
  { tags: [SITE_TAG], revalidate: 600 },
);

/** Public site content. Falls back to defaults if the backend is missing or down. */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    return buildContent(await fetchSiteCached());
  } catch (err) {
    console.error("[mode-society] could not load site content:", err);
    return buildContent(null);
  }
}

/** Uncached read for the admin panel. */
export async function getSiteContentFresh(): Promise<SiteContent> {
  return buildContent(await callBackend<RawSite>("getSite"));
}
