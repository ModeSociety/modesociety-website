/**
 * "Featured in": the press features Mode Society manages in the admin panel (Featured in tab),
 * stored one row per feature in the "Featured In" tab of the Sheet.
 */

export type PressPhoto = { fileId: string; src: string };

export type PressItem = {
  id: string;
  order: number;
  /** the feature's address: /featured-in/<slug> */
  slug: string;
  outlet: string;
  title: string;
  /** yyyy-mm-dd, or free text such as "Spring 2026" */
  date: string;
  /** the short teaser on the home page and the Featured in list */
  excerpt: string;
  /** the full write-up: paragraphs separated by a blank line (see RichText) */
  body: string;
  /** the original article, if it's online */
  href: string;
  /** the first is the cover */
  photos: PressPhoto[];
  visible: boolean;
};

/** "Vogue Australia: The New Agency!" → "vogue-australia-the-new-agency" */
export function slugify(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

/** "2026-10-01" → "1 October 2026"; anything else is shown as typed. */
export function pressDate(d: string) {
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return d;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** The teaser: the excerpt, or the start of the article when there isn't one. */
export function pressTeaser(a: PressItem, max = 220) {
  const text = (a.excerpt || a.body.replace(/^#+\s.*$/gm, "").replace(/[*_>#[\]]|\(https?:[^)]*\)/g, "")).replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text;
}
