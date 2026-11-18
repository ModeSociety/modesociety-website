import type { Metadata } from "next";
import { ABOUT, INSTAGRAM_URL, LINKEDIN_URL, SERVICE_COPY, TIKTOK_URL } from "./content";
import { TECH_SITE_URL } from "./domains";

/**
 * Search: page titles and descriptions, canonical URLs, share previews and the
 * structured data Google reads. Edit the wording in PAGES below.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.modesociety.com.au").replace(/\/$/, "");
export const SITE_NAME = "Mode Society";

export type PageKey =
  | "home" | "about" | "brands" | "talent" | "services" | "work" | "press" | "contact"
  | "privacy" | "techHome" | "techServices" | "techPrivacy" | "techHouseRules";

export const TECH_NAME = "ModeSociety Tech";
/**
 * Where the Tech page lives for search engines: modesocietytech.com once the domain split is on
 * (NEXT_PUBLIC_TECH_SITE_URL), until then /tech on Mode Society's domain.
 */
export const TECH_BASE_URL = TECH_SITE_URL || SITE_URL;
export const TECH_HOME_URL = TECH_SITE_URL ? `${TECH_SITE_URL}/` : `${SITE_URL}/tech`;
/** A Tech page's address for search engines: "/tech/services" → modesocietytech.com/services once split. */
export const techUrl = (path: string) => {
  const sub = path.replace(/^\/tech/, "");
  return TECH_SITE_URL ? `${TECH_SITE_URL}${sub || "/"}` : `${SITE_URL}${path}`;
};

/**
 * Titles stay under ~60 characters and descriptions under ~155 so Google shows them whole.
 * `og` is the line set large on the page's share image.
 */
export const PAGES: Record<PageKey, { path: string; title: string; description: string; og: string; crumb: string; tech?: boolean }> = {
  home: {
    path: "/",
    title: "Mode Society | Influencer & Talent Agency, Melbourne",
    description:
      "Female-led talent and creator agency in Melbourne, casting models, influencers, UGC creators and streamers for brand campaigns in Australia and worldwide.",
    og: "Talent & creator agency",
    crumb: "Home",
  },
  about: {
    path: "/about",
    title: "About Mode Society | Female-Led Talent Agency, Melbourne",
    description:
      "Female-led boutique talent and creator agency in Melbourne, running PR, influencer campaigns, guest lists and talent management since 2022.",
    og: "About us",
    crumb: "About us",
  },
  brands: {
    path: "/work-with-us",
    title: "Influencer Marketing Agency for Brands | Mode Society",
    description:
      "Your external PR team: influencer campaigns, UGC content and event guest lists with creators who fit your brand, run from brief to payment. Book a call.",
    og: "Let's work together",
    crumb: "For brands",
  },
  talent: {
    path: "/apply-to-be-a-creator",
    title: "Join a Talent & Influencer Agency | Mode Society",
    description:
      "Models, influencers, UGC creators and streamers: apply to Mode Society. Brand deals, contracts and invoicing handled, and no commission on gifted collabs.",
    og: "Thinking of signing?",
    crumb: "For talent",
  },
  services: {
    path: "/services",
    title: "Creator & Brand Services and Prices | Mode Society",
    description:
      "Strategy sessions, social media audits, content editing, email and SMS marketing, media kits and more for creators and brands. Prices in AUD, with free strategy for exclusive creators.",
    og: "Grow with intention",
    crumb: "Services",
  },
  work: {
    path: "/our-work",
    title: "Our Work | Influencer & UGC Campaigns | Mode Society",
    description:
      "Selected influencer campaigns, UGC content and event guest lists by Mode Society for brands from fashion and beauty to gaming and food.",
    og: "Selected work",
    crumb: "Our work",
  },
  press: {
    path: "/featured-in",
    title: "Press & Media Features | Mode Society",
    description: "Where Mode Society, the Melbourne talent and creator agency, has been featured in the press and media.",
    og: "Featured in",
    crumb: "Featured in",
  },
  contact: {
    path: "/get-in-touch",
    title: "Contact Mode Society | Book a Call or Apply",
    description:
      "Get in touch with Mode Society: book a call about your next campaign, or apply for representation as a creator.",
    og: "Get in touch",
    crumb: "Contact us",
  },
  techHome: {
    path: "/tech",
    tech: true,
    title: "ModeSociety Tech | Gaming & Tech Creator Agency",
    description:
      "Talent and creator agency for streamers, content creators and esports athletes, running brand campaigns and events across gaming and tech worldwide.",
    og: "Not just gaming.",
    crumb: "ModeSociety Tech",
  },
  privacy: {
    path: "/privacy",
    title: "Privacy Policy | Mode Society",
    description: "How Mode Society collects, uses, shares and protects personal information, and how to access or correct yours.",
    og: "Privacy Policy",
    crumb: "Privacy Policy",
  },
  techPrivacy: {
    path: "/tech/privacy",
    tech: true,
    title: "Privacy Policy | ModeSociety Tech",
    description: "How ModeSociety Tech collects, uses, shares and protects personal information, and how to access or correct yours.",
    og: "Privacy Policy",
    crumb: "Privacy Policy",
  },
  techHouseRules: {
    path: "/tech/house-rules",
    tech: true,
    title: "House Rules: 18+ Creators Only | ModeSociety Tech",
    description:
      "Every ModeSociety Tech creator is 18+, every brief is written in-house, every paid post is disclosed, and we publish the sponsors we won't work with.",
    og: "How we play.",
    crumb: "House rules",
  },
  techServices: {
    path: "/tech/services",
    tech: true,
    title: "Streamer & Gaming Creator Services | ModeSociety Tech",
    description:
      "Channel audits, stream clips, YouTube editing, strategy sessions and more for streamers, gaming creators and brands. Prices in AUD, free strategy for exclusive creators.",
    og: "Level up your channel.",
    crumb: "Services",
  },
};

export const ogImageUrl = (line: string, tech = false) => `/og?title=${encodeURIComponent(line)}${tech ? "&theme=tech" : ""}`;

/** Full metadata for a page: title, description, canonical URL and share previews. */
export function pageMetadata(key: PageKey, extra: Partial<Metadata> = {}): Metadata {
  const p = PAGES[key];
  const name = p.tech ? TECH_NAME : SITE_NAME;
  const image = { url: ogImageUrl(p.og, p.tech), width: 1200, height: 630, alt: `${name}: ${p.og}` };
  // each business's pages point search engines at its own domain
  const url = p.tech ? techUrl(p.path) : p.path;
  return {
    title: { absolute: p.title },
    description: p.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: name,
      locale: "en_AU",
      title: p.title,
      description: p.description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: p.title, description: p.description, images: [image.url] },
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// Structured data (schema.org JSON-LD)
// ---------------------------------------------------------------------------

const ORG_ID = `${SITE_URL}/#organization`;

/** Mode Society's business data for Google. email: its public contact address. */
export function organizationJsonLd(email?: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": ORG_ID,
        name: SITE_NAME,
        legalName: "Mode Society Pty Ltd",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo-512.png`, width: 512, height: 512 },
        image: `${SITE_URL}${ogImageUrl(PAGES.home.og)}`,
        description: PAGES.home.description,
        ...(email ? { email } : {}),
        slogan: "Cast for fit, not follower count.",
        foundingDate: "2022-01",
        address: { "@type": "PostalAddress", addressLocality: "Melbourne", addressRegion: "VIC", addressCountry: "AU" },
        areaServed: [{ "@type": "Country", name: "Australia" }, "Worldwide"],
        knowsAbout: [
          "Influencer marketing",
          "Influencer campaigns",
          "User-generated content (UGC)",
          "Talent management",
          "Model and creator casting",
          "Event guest lists",
          "Public relations",
        ],
        sameAs: [INSTAGRAM_URL, TIKTOK_URL, LINKEDIN_URL],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Services",
          itemListElement: SERVICE_COPY.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s.title, description: s.body, provider: { "@id": ORG_ID }, areaServed: "Worldwide" },
          })),
        },
        employee: ABOUT.team
          .replace(/^Our team:\s*/, "")
          .replace(/\.$/, "")
          .split(/,\s*|\s+and\s+/)
          .filter(Boolean)
          .map((name) => ({ "@type": "Person", name })),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "en-AU",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

/** Mode Society's own social accounts: never listed as ModeSociety Tech's. */
const MODE_SOCIETY_ACCOUNTS = new Set([INSTAGRAM_URL, TIKTOK_URL, LINKEDIN_URL].map((u) => u.replace(/\/+$/, "").toLowerCase()));

/**
 * ModeSociety Tech's business data for Google, as a business of its own (since 16 Nov 2026): its own
 * address, logo and website, its own social accounts (from the Tech footer, without any of Mode
 * Society's) and its public contact address. Linked to nothing of Mode Society's.
 */
export function techOrganizationJsonLd({ email, socials = [] }: { email?: string; socials?: string[] } = {}) {
  const id = `${TECH_BASE_URL}/#tech-organization`;
  const sameAs = [...new Set(socials.map((u) => u.trim()).filter((u) => /^https:\/\//.test(u) && !MODE_SOCIETY_ACCOUNTS.has(u.replace(/\/+$/, "").toLowerCase())))];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": id,
        name: TECH_NAME,
        legalName: "Mode Society Pty Ltd",
        url: TECH_HOME_URL,
        logo: { "@type": "ImageObject", url: `${TECH_BASE_URL}/brand/tech-512.png`, width: 512, height: 512 },
        image: `${TECH_BASE_URL}${ogImageUrl(PAGES.techHome.og, true)}`,
        description: PAGES.techHome.description,
        ...(email ? { email } : {}),
        address: { "@type": "PostalAddress", addressLocality: "Melbourne", addressRegion: "VIC", addressCountry: "AU" },
        areaServed: "Worldwide",
        knowsAbout: ["Gaming influencer marketing", "Streamer sponsorships", "Esports talent management", "UGC", "Tech creator campaigns"],
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${TECH_BASE_URL}/#tech-website`,
        url: TECH_HOME_URL,
        name: TECH_NAME,
        inLanguage: "en-AU",
        publisher: { "@id": id },
      },
    ],
  };
}

/** "Home › For brands" trail for a sub-page. */
export function breadcrumbJsonLd(key: PageKey) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      PAGES[key].tech
        ? { "@type": "ListItem", position: 1, name: TECH_NAME, item: TECH_HOME_URL }
        : { "@type": "ListItem", position: 1, name: PAGES.home.crumb, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: PAGES[key].crumb, item: `${SITE_URL}${PAGES[key].path}` },
    ],
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
