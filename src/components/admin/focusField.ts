"use client";

/**
 * Brings an editor field into view after a click in the preview: scrolls to it, puts the cursor in
 * it with the clicked words selected, and flashes it so it's easy to spot.
 */
export function focusField(dom: string, raw = "", tries = 8) {
  const el = document.getElementById(dom);
  if (!el) {
    // the field can take a moment to appear (a section opening, a tab switching)
    if (tries > 0) setTimeout(() => focusField(dom, raw, tries - 1), 60);
    return;
  }
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  el.classList.remove("field-flash");
  void el.offsetWidth; // restart the flash
  el.classList.add("field-flash");
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    el.focus({ preventScroll: true });
    const value = el.value;
    const find = (s: string) => (s ? value.indexOf(s) : -1);
    let at = find(raw);
    let len = raw.length;
    if (at < 0 && raw) {
      // typed with *stars* or markdown: find it by its first words
      const start = raw.split(" ").slice(0, 3).join(" ");
      at = find(start);
      len = at >= 0 ? Math.min(value.length - at, raw.length + 8) : 0;
    }
    if (at >= 0) el.setSelectionRange(at, at + len);
  }
}
