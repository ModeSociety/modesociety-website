"use client";

import { usePathname } from "next/navigation";

/**
 * Where the Tech site's links go. The home page's sections ("#contact") are anchors on the home page
 * and full links from its other pages ("/tech#contact", or "/#contact" on modesocietytech.com),
 * and its pages are under /tech, or at the root of its own domain.
 */
export function useTechPaths() {
  const path = usePathname() || "/";
  const base = path.startsWith("/tech") ? "/tech" : "";
  const onHome = path === "/" || path === "/tech";
  return {
    onHome,
    /** a section of the home page; "#creator" style hashes the page reads (e.g. #apply) work too */
    section: (hash: string) => (onHome ? hash : `${base || "/"}${hash}`),
    /** another Tech page, e.g. "/services" */
    page: (p: string) => `${base}${p}`,
    home: base || "/",
  };
}

/** A link to another page of the site it's on (e.g. "/privacy": /privacy, /tech/privacy, or /privacy on modesocietytech.com). */
export function PageA({ to, ...rest }: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: string }) {
  return <a href={useTechPaths().page(to)} {...rest} />;
}

/** A link to a section of the Tech home page (or "#top" of this page), from any Tech page. */
export function TxA({ to, ...rest }: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: string }) {
  const p = useTechPaths();
  const href = to === "#top" ? (p.onHome ? "#top" : p.home) : p.section(to);
  return <a href={href} {...rest} />;
}
