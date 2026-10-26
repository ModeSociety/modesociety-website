import type { Metadata } from "next";
import { ABOUT, INSTAGRAM_URL, LINKEDIN_URL, SERVICE_COPY, TIKTOK_URL } from "./content";

/**
 * Search: page titles and descriptions, canonical URLs, share previews and the
 * structured data Google reads. Edit the wording in PAGES below.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.modesociety.com.au").replace(/\/$/, "");
export const SITE_NAME = "Mode Society";

export type PageKey = "home" | "about" | "brands" | "talent" | "services" | "work" | "press" | "contact" | "partner";

/**
 * Titles stay under ~60 characters and descriptions under ~155 so Google shows them whole.
 * `og` is the line set large on the page's share image.
 */
export const PAGES: Record<PageKey, { path: string; title: string; description: string; og: string; crumb: string }> = {
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
    title: "Influencer Campaigns, UGC & Guest Lists | Mode Society",
    description:
      "Influencer campaigns, UGC content, event guest lists and grant funding for overseas marketing. See how each Mode Society service works, step by step.",
    og: "Four ways we work with brands",
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
      "Get in touch with Mode Society: book a call about your next campaign, apply for representation as a creator, or propose a partnership.",
    og: "Get in touch",
    crumb: "Contact us",
  },
  partner: {
    path: "/partner-with-us",
    title: "Partner With Mode Society | Referral & Co-Marketing",
    description:
      "B2B partnerships with Mode Society: referral and affiliate programs, co-marketing, cross-promotion and strategic alliances with platforms and agencies.",
    og: "Partner with us",
    crumb: "Partner with us",
  },
};

export const ogImageUrl = (line: string) => `/og?title=${encodeURIComponent(line)}`;

/** Full metadata for a page: title, description, canonical URL and share previews. */
export function pageMetadata(key: PageKey, extra: Partial<Metadata> = {}): Metadata {
  const p = PAGES[key];
  const image = { url: ogImageUrl(p.og), width: 1200, height: 630, alt: `${SITE_NAME}: ${p.og}` };
  return {
    title: { absolute: p.title },
    description: p.description,
    alternates: { canonical: p.path },
    openGraph: {
      type: "website",
      url: p.path,
      siteName: SITE_NAME,
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

export function organizationJsonLd() {
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

/** "Home › For brands" trail for a sub-page. */
export function breadcrumbJsonLd(key: PageKey) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: PAGES.home.crumb, item: SITE_URL },
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
