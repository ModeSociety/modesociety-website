import { unstable_cache } from "next/cache";
import {
  CTA_STYLES,
  CURSOR_STYLES,
  DEFAULT_SETTINGS,
  FOOTER_STYLES,
  GAME_MODES,
  HERO_MODES,
  INTRO_STYLES,
  pick,
  SLOTS,
  type SiteContent,
  type SiteImage,
  type SiteSettings,
} from "./slots";

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
    throw new Error(`Backend returned non-JSON (HTTP ${res.status}). Check the Apps Script deployment URL and access setting.`);
  }
  if (!body.ok) throw new Error(body.error || "Backend error");
  return body.data as T;
}

type RawSite = {
  settings: Record<string, string>;
  images: { slot: string; order: number; fileId: string; alt: string }[];
};

export function mediaUrl(fileId: string) {
  return `/media/${encodeURIComponent(fileId)}`;
}

function parseSettings(raw: Record<string, string> = {}): SiteSettings {
  const d = DEFAULT_SETTINGS;
  return {
    heroMode: pick(HERO_MODES, raw.heroMode, d.heroMode),
    heroAutoCycle: raw.heroAutoCycle === "true",
    introStyle: pick(INTRO_STYLES, raw.introStyle, d.introStyle),
    cursorStyle: pick(CURSOR_STYLES, raw.cursorStyle, d.cursorStyle),
    gameMode: pick(GAME_MODES, raw.gameMode, d.gameMode),
    ctaStyle: pick(CTA_STYLES, raw.ctaStyle, d.ctaStyle),
    footerStyle: pick(FOOTER_STYLES, raw.footerStyle, d.footerStyle),
  };
}

export function buildContent(raw: RawSite | null): SiteContent {
  const images: Record<string, SiteImage[]> = {};
  for (const slot of SLOTS) {
    const uploaded = (raw?.images ?? [])
      .filter((r) => r.slot === slot.id)
      .sort((a, b) => a.order - b.order)
      .map((r) => ({ src: mediaUrl(r.fileId), alt: r.alt || slot.label, fileId: r.fileId }));
    images[slot.id] = uploaded.length ? uploaded : slot.defaults;
  }
  return { settings: parseSettings(raw?.settings), images, connected: Boolean(raw) };
}

const fetchSiteCached = unstable_cache(
  async (): Promise<RawSite | null> => {
    if (!backendConfigured()) return null;
    return callBackend<RawSite>("getSite");
  },
  ["site-content-v1"],
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
