import type { SectionCopy } from "./copy";

type NavWords = SectionCopy<"site.nav">;
/** each menu link's wording in the admin panel (Pages & text → Navigation) */
const NAV_KEY: Record<string, keyof NavWords> = {
  "/": "homeLink",
  "/about": "aboutLink",
  "/work-with-us": "brandsLink",
  "/apply-to-be-a-creator": "talentLink",
  "/services": "servicesLink",
  "/our-work": "workLink",
  "/featured-in": "pressLink",
  "/tech": "techLink",
  "/get-in-touch": "contactLink",
};

/** A menu link's name: as worded in the admin panel, or the page's own name. */
export const menuName = (words: NavWords, l: { href: string; label: string }) => (NAV_KEY[l.href] && words[NAV_KEY[l.href]]) || l.label;
