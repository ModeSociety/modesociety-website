/**
 * Click-to-edit in the page builder's preview: works out which field of a block a clicked word or
 * photo comes from, by matching what was clicked against the block's own saved words and photos.
 * Nothing on the site needs marking up for it, so the designed sections work as they are.
 */
import { DEFS, type LayoutBlock } from "@/lib/builder";
import { SECTIONS, type Field, type SectionDef, type SectionId } from "@/lib/copy";
import { SLOTS, type SiteContent } from "@/lib/slots";

/** Where the clicked thing is edited. `dom` is the id of the input in the editor; `raw` the words to select in it. */
export type Hit =
  | { kind: "prop"; dom: string; label: string; raw?: string }
  | { kind: "copy"; section: SectionId; dom: string; label: string; raw?: string }
  | { kind: "slot"; slots: string[]; label: string };

type Candidate = { norm: string; hit: Hit };

/** Text as compared: case, stars, quotes, arrows and spacing don't count. */
export function norm(s: string) {
  return s
    .replace(/\*/g, "")
    .replace(/[“”«»"]/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/[→↗←↓↑✓✶·•]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Plain lines of typed text: markdown marks removed, one per line or paragraph. */
function pieces(text: string): string[] {
  const out = new Set<string>();
  const clean = (l: string) =>
    l
      .replace(/^\s*(#{1,6}\s|>\s?|[-*]\s|\d+[.)]\s)/, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .trim();
  if (text.trim()) out.add(text.replace(/\n+/g, " "));
  for (const para of text.split(/\n\s*\n/)) if (para.trim()) out.add(para.split("\n").map(clean).join(" "));
  for (const line of text.split("\n")) if (clean(line)) out.add(clean(line));
  return [...out];
}

function add(list: Candidate[], text: unknown, hit: Exclude<Hit, { kind: "slot" }>) {
  if (typeof text !== "string" || !text.trim()) return;
  for (const p of pieces(text)) {
    const n = norm(p);
    if (n) list.push({ norm: n, hit: { ...hit, raw: p } });
  }
}

function copyCandidates(section: SectionId, value: Record<string, unknown>, list: Candidate[]) {
  const def = SECTIONS[section] as SectionDef;
  const walk = (fields: Record<string, Field>, v: Record<string, unknown>, dom: string, prefix: string) => {
    for (const [k, f] of Object.entries(fields)) {
      const id = `${dom}-${k}`;
      const label = prefix ? `${prefix} · ${f.label}` : f.label;
      const x = v?.[k];
      if (f.type === "list" && Array.isArray(x)) x.forEach((item, i) => walk(f.item, item as Record<string, unknown>, `${id}-${i}`, `${f.itemName[0].toUpperCase()}${f.itemName.slice(1)} ${i + 1}`));
      else if (f.type === "lines" && Array.isArray(x)) x.forEach((line) => add(list, line, { kind: "copy", section, dom: id, label }));
      else if (f.type !== "select") add(list, x, { kind: "copy", section, dom: id, label });
    }
  };
  walk(def.fields, value, section, "");
}

const PROP_LABELS: Record<string, string> = { heading: "Heading", text: "Text", caption: "Caption", buttonLabel: "Button", button2Label: "Second button" };
const ITEM_LABELS: Record<string, string> = { title: "Title", text: "Text", linkLabel: "Link" };

/** Everything in a block that a click can land on. */
export function blockFields(b: LayoutBlock, content: SiteContent) {
  const def = DEFS[b.type];
  const texts: Candidate[] = [];
  const photos = new Map<string, Hit>();
  let slots: string[] = [];
  if (def?.kind === "generic") {
    const p = b.props;
    const dom = (k: string) => `gb-${b.id}-${k}`;
    for (const k of Object.keys(PROP_LABELS)) add(texts, p[k as keyof typeof p], { kind: "prop", dom: dom(k), label: b.type === "quote" && k === "text" ? "The quote" : PROP_LABELS[k] });
    const name = def.itemName ? def.itemName[0].toUpperCase() + def.itemName.slice(1) : "Item";
    p.items.forEach((it, i) => {
      for (const k of Object.keys(ITEM_LABELS)) {
        // a figure's number and a question are the item itself; their caption and answer are named
        const label =
          b.type === "stats" ? (k === "title" ? `${name} ${i + 1}` : `${name} ${i + 1} · Caption`) :
          b.type === "faq" ? (k === "title" ? `${name} ${i + 1}` : `Answer ${i + 1}`) :
          `${name} ${i + 1} · ${ITEM_LABELS[k]}`;
        add(texts, it[k as keyof typeof it], { kind: "prop", dom: dom(`items-${i}-${k}`), label });
      }
      if (it.photo) photos.set(it.photo, { kind: "prop", dom: dom(`items-${i}-photo`), label: `${name} ${i + 1} · Photo` });
    });
    p.photos.forEach((id, i) => photos.set(id, { kind: "prop", dom: dom("photos"), label: p.photos.length > 1 ? `Photo ${i + 1}` : "Photo" }));
  } else if (def?.kind === "feature") {
    for (const id of def.copy) copyCandidates(id, content.copy[id] as unknown as Record<string, unknown>, texts);
    slots = def.slots ?? [];
  }
  if (b.style.bgImage) photos.set(b.style.bgImage, { kind: "prop", dom: `gb-${b.id}-bgImage`, label: "Background photo" });
  return { texts, photos, slots };
}

/**
 * The text of an element as written (not as styled: uppercase in CSS doesn't count). Words hidden
 * from screen readers are left out: animated headings show scrambled letters there and keep the real
 * words in a screen-reader copy.
 */
function textOf(el: Element) {
  const doc = el.ownerDocument;
  const walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let out = "";
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const hidden = n.parentElement?.closest('[aria-hidden="true"], [aria-hidden=""]');
    if (hidden && (el.contains(hidden) || hidden.contains(el))) continue;
    out += n.textContent;
  }
  return norm(out);
}

/**
 * What was clicked: the clicked element and its parents (up to the block) are compared with the
 * block's words; an exact match wins, otherwise a near one (a word inside a heading, a button with its arrow).
 */
/** The field, and the element on the page that shows it. */
export type Picked = { hit: Hit; el: Element };

export function resolveClick(target: Element, blockEl: Element, fields: ReturnType<typeof blockFields>): Picked | null {
  // photos and videos
  const media = target.closest("img, video") ?? (textOf(target) ? null : target.querySelector("img, video"));
  if (media && blockEl.contains(media)) {
    const src = (media as HTMLImageElement).currentSrc || media.getAttribute("src") || "";
    for (const [id, hit] of fields.photos) if (src.includes(encodeURIComponent(id)) || src.includes(id)) return { hit, el: media };
    if (fields.slots.length) return { hit: { kind: "slot", slots: fields.slots, label: "Photo · in Images & video" }, el: media };
  }
  const chain: Element[] = [];
  for (let el: Element | null = target; el && el !== blockEl.parentElement; el = el.parentElement) chain.push(el);
  for (const el of chain) {
    const t = textOf(el);
    if (!t) continue;
    const exact = fields.texts.find((c) => c.norm === t);
    if (exact) return { hit: exact.hit, el };
  }
  const first = chain.find((el) => textOf(el));
  if (!first) return null;
  const t = textOf(first);
  // a word or line inside a longer field
  const inside = fields.texts.filter((c) => t.length >= 3 && c.norm.includes(t)).sort((a, b) => a.norm.length - b.norm.length)[0];
  if (inside) return { hit: inside.hit, el: first };
  // the field plus a little more (a button's arrow, a number beside a title)
  const around = fields.texts.filter((c) => c.norm.length >= 3 && t.includes(c.norm) && t.length <= c.norm.length + 24).sort((a, b) => b.norm.length - a.norm.length)[0];
  return around ? { hit: around.hit, el: first } : null;
}

export const slotLabel = (id: string) => SLOTS.find((s) => s.id === id)?.label ?? id;

/** The nav's and footer's words (only the footer has wording to edit; the nav's links are the page names). */
export function chromeFields(side: "talent" | "tech", root: "nav" | "footer", content: SiteContent) {
  const texts: Candidate[] = [];
  const ids: SectionId[] = root === "nav" ? [] : side === "tech" ? ["tech.footer", "tech.cta"] : ["site.footer"];
  for (const id of ids) copyCandidates(id, content.copy[id] as unknown as Record<string, unknown>, texts);
  return { texts, photos: new Map<string, Hit>(), slots: [] as string[] };
}

/** How the admin panel names an element nobody has named: by what it is. */
export function describeEl(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const cls = typeof el.className === "string" ? el.className : "";
  if (/btn/.test(cls)) return "Button";
  if (tag === "a") return "Link";
  if (tag === "img") return "Photo";
  if (tag === "video") return "Video";
  if (tag === "svg") return "Drawing";
  if (tag === "hr") return "Line";
  if (/^h[1-2]$/.test(tag)) return "Heading";
  if (/^h[3-6]$/.test(tag)) return "Title";
  const r = el.getBoundingClientRect();
  if (r.height > 0 && r.height <= 4) return "Line";
  const cs = el.ownerDocument.defaultView?.getComputedStyle(el);
  const text = (el.textContent || "").trim();
  if (cs && text && parseFloat(cs.fontSize) <= 13 && cs.textTransform === "uppercase") return "Small label";
  if (["p", "li", "span", "blockquote", "summary", "label", "td", "th"].includes(tag) && text) return tag === "blockquote" ? "Quote" : "Text";
  if (tag === "section") return "Section";
  return "Box";
}

/** Where an element sits inside its root, as the steps builder.ts elementCss understands. */
export function pathTo(root: Element, el: Element): string {
  const steps: string[] = [];
  for (let at: Element | null = el; at && at !== root; at = at.parentElement) {
    const parent: Element | null = at.parentElement;
    if (!parent) return "";
    steps.unshift(`${at.tagName.toLowerCase()}:nth-child(${Array.prototype.indexOf.call(parent.children, at) + 1})`);
  }
  return steps.join(">");
}
