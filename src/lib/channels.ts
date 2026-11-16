/**
 * Creators' channels as the forms store them ("Instagram: @name · 12K", one per line), turned into
 * links to their profiles. People type a handle (@name or name), a full link, or a link without
 * https://, so all of those are accepted.
 */

export type Channel = { platform: string; handle: string; followers: string; url: string | null };

/** Profile address for a handle, per platform (lower-case platform name → address). */
const PROFILE: Record<string, (h: string) => string> = {
  instagram: (h) => `https://www.instagram.com/${h}/`,
  tiktok: (h) => `https://www.tiktok.com/@${h}`,
  youtube: (h) => `https://www.youtube.com/@${h}`,
  "youtube gaming": (h) => `https://www.youtube.com/@${h}`,
  twitch: (h) => `https://www.twitch.tv/${h}`,
  kick: (h) => `https://kick.com/${h}`,
  x: (h) => `https://x.com/${h}`,
  "x (twitter)": (h) => `https://x.com/${h}`,
  twitter: (h) => `https://x.com/${h}`,
  facebook: (h) => `https://www.facebook.com/${h}`,
  "facebook gaming": (h) => `https://www.facebook.com/${h}`,
  linkedin: (h) => `https://www.linkedin.com/in/${h}`,
  pinterest: (h) => `https://www.pinterest.com/${h}/`,
  snapchat: (h) => `https://www.snapchat.com/add/${h}`,
  threads: (h) => `https://www.threads.net/@${h}`,
  lemon8: (h) => `https://www.lemon8-app.com/@${h}`,
};

/** A link someone typed without https:// (instagram.com/name, www.tiktok.com/@name, youtu.be/…). */
const BARE_LINK = /^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|tv|net|gg|app|be|co|me)(\/|$)/i;

/** The profile address for what someone typed, or null when there is no sure address (e.g. a Discord name). */
export function profileUrl(platform: string, typed: string): string | null {
  const t = typed.trim().replace(/\s+/g, "");
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return safeUrl(t);
  if (BARE_LINK.test(t)) return safeUrl(`https://${t}`);
  const handle = t.replace(/^@+/, "").replace(/\/+$/, "");
  if (!/^[\w.\-]{1,80}$/.test(handle)) return null;
  const make = PROFILE[platform.trim().toLowerCase()];
  return make ? make(handle) : null;
}

function safeUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

/** The channel lines of a lead ("Platform: handle · followers"), each with its profile link. */
export function parseChannels(text: string): Channel[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([^:]+):\s+(.*)$/);
      const platform = m ? m[1].trim() : "";
      const rest = m ? m[2] : line;
      // "handle · followers": split at the last ·, which may have lost its trailing space
      const parts = rest.match(/^(.*?)\s*·\s*([^·]*)$/);
      const handle = (parts ? parts[1] : rest).trim();
      const followers = parts ? parts[2].trim() : "";
      return { platform, handle, followers, url: profileUrl(platform, handle) };
    });
}
