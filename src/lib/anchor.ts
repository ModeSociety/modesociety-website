import type Lenis from "lenis";

/**
 * Scrolls to a section of the page through the site's smooth scroller (Lenis), which honours the
 * section's scroll-margin-top. A plain jump would leave Lenis out of step, which reads as lag.
 */
export function scrollToSection(el: HTMLElement) {
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
  if (lenis) lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

/**
 * Same-page links ("#apply", or "/page#apply" while on /page) scroll to their section on every
 * click, not only the first, and the address shows the hash once. The browser's own handling
 * does nothing when the hash is already in the address. Returns the cleanup.
 */
export function handleSectionLinks() {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || url.hash.length < 2) return;
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    scrollToSection(el);
    history.replaceState(history.state, "", url.hash);
  };
  // capture: runs before Next's <Link> handler, which then sees the click handled
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
