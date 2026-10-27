/**
 * ModeSociety Tech — the gaming & tech side of Mode Society, served under /tech.
 * Copy from "Website copy.pdf" (Home, For brands, For creators, Our talent, Contact),
 * plus the categories, formats, 18+ policy and FAQ from the homepage mocks.
 */

export const TECH_BASE = "/tech";

export const TECH_MENU = [
  { href: "/tech/brands", label: "For brands" },
  { href: "/tech/creators", label: "For creators" },
  { href: "/tech/talent", label: "Our talent" },
  { href: "/tech/contact", label: "Contact" },
];

// ---------------------------------------------------------------------------
// Roster (admin panel → Roster, stored in the "Tech Roster" tab of the Sheet)
// ---------------------------------------------------------------------------

export const PLATFORMS = [
  { id: "twitch", label: "Twitch" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "x", label: "X" },
  { id: "kick", label: "Kick" },
] as const;
export type PlatformId = (typeof PLATFORMS)[number]["id"];

export const ROSTER_TYPES = ["Creator", "Streamer", "Esports athlete", "Team"] as const;

export type RosterMember = {
  id: string;
  order: number;
  name: string;
  handle: string;
  type: string;
  niche: string;
  region: string;
  /** a line from the creator, shown on For creators */
  quote: string;
  /** shown on the home page */
  featured: boolean;
  visible: boolean;
  /** Drive file ID of the photo (uploaded in the admin panel) */
  photo: string;
  platforms: Partial<Record<PlatformId, { url: string; followers: string }>>;
};

/** "18.4K", "1.2M", "84,000", "84000" → 84000. Anything unreadable counts as 0. */
export function parseFollowers(v: string | undefined): number {
  const m = String(v || "").replace(/,/g, "").trim().match(/^(\d+(?:\.\d+)?)\s*([km])?/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return Math.round(m[2]?.toLowerCase() === "m" ? n * 1e6 : m[2]?.toLowerCase() === "k" ? n * 1e3 : n);
}

export function totalFollowers(m: RosterMember) {
  return Object.values(m.platforms).reduce((s, p) => s + parseFollowers(p?.followers), 0);
}

/** 1234 → "1.2K", 2500000 → "2.5M". */
export function compact(n: number) {
  return new Intl.NumberFormat("en-AU", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** Placeholder cards, shown (clearly marked) until real creators are added in the admin panel. */
export const SAMPLE_ROSTER: RosterMember[] = [
  { id: "s1", order: 1, name: "Kairo", handle: "sample_kairo", type: "Streamer", niche: "Shooters · PC builds", region: "Australia", quote: "", featured: true, visible: true, photo: "", platforms: { twitch: { url: "", followers: "84K" }, youtube: { url: "", followers: "52K" } } },
  { id: "s2", order: 2, name: "Team Halcyon", handle: "sample_halcyon", type: "Team", niche: "Battle royale", region: "Asia", quote: "", featured: true, visible: true, photo: "", platforms: { twitch: { url: "", followers: "31K" }, tiktok: { url: "", followers: "40K" }, x: { url: "", followers: "18K" } } },
  { id: "s3", order: 3, name: "Juno", handle: "sample_juno", type: "Creator", niche: "Phones · gear reviews", region: "Europe", quote: "", featured: true, visible: true, photo: "", platforms: { youtube: { url: "", followers: "210K" }, tiktok: { url: "", followers: "390K" }, instagram: { url: "", followers: "96K" } } },
  { id: "s4", order: 4, name: "Rook", handle: "sample_rook", type: "Esports athlete", niche: "Fighting games", region: "North America", quote: "", featured: true, visible: true, photo: "", platforms: { twitch: { url: "", followers: "22K" }, x: { url: "", followers: "9K" } } },
];

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------

export const TECH_WHO = {
  lead: "We are a talent and creator agency representing streamers, content creators, and esports athletes worldwide for brand campaigns and events across gaming products and technology.",
  body: "From local streamers to internationally represented athletes, our roster is built on quality over volume. We handle the relationship end-to-end, so brands get seamless execution and talent get partnerships that actually complement their niche.",
};

/** Who we run campaigns for (from the mocks). */
export const TECH_CATEGORIES = [
  { title: "Gaming gear & peripherals", body: "Mice, keyboards, headsets and full setups, shown in real use on stream and in clips." },
  { title: "Energy drinks & snacks", body: "Stream sponsorships, UGC and event guest lists, with each creator's adult audience share shown up front." },
  { title: "Tech & telco", body: "Phones, devices, connectivity and software, with creators who cover tech as well as games." },
  { title: "Game publishers", body: "Launches, updates and drops, with streams, clips and creators on the guest list." },
];

/** Formats (from the mocks). */
export const TECH_FORMATS = [
  { key: "campaigns", title: "Influencer & creator campaigns", body: "Multi-creator campaigns built around one brand goal, not one-off posts." },
  { key: "ugc", title: "UGC", body: "Creator-made clips and posts, made for your own channels." },
  { key: "streaming", title: "Streaming", body: "Sponsored streams and segments with creators who stream live." },
  { key: "events", title: "Event guest lists", body: "The right creators on the guest list for launches and events." },
  { key: "management", title: "Creator management", body: "We manage creators, streamers, players and teams, and connect them with brands." },
];

export const TECH_PROCESS = [
  {
    title: "Understanding your brand objective",
    body: "Every successful campaign starts with a clear understanding of what you want to achieve. We work with your team to define your objectives, target audience, key messages and KPIs, creating a strategic foundation for a campaign that delivers meaningful results.",
  },
  {
    title: "Building the perfect partnership",
    body: "The right talent can make or break a campaign. We use our understanding of our creators, their audiences, content style and performance history to identify the talent that genuinely aligns with your brand, ensuring every partnership feels natural and relevant.",
  },
  {
    title: "Creating high-quality authentic content",
    body: "We turn objectives into ideas that audiences actually want to engage with. From campaign concepts and content direction to platform strategy and deliverables, we develop creative that allows talent to communicate your brand authentically while staying true to their own voice.",
  },
  {
    title: "Measuring performance & ROI",
    body: "We believe every campaign should have a clear measure of success. Following each activation, we provide transparent reporting across relevant metrics including reach, views, engagement and other agreed KPIs, giving your team a clear understanding of campaign performance and return on investment.",
  },
];

export const TECH_FOR_CREATORS = [
  {
    title: "Brand partnerships",
    body: "We explore every opportunity and connect you with the right brands for paid brand campaigns, gifted collaborations, UGC content creation, and long-term brand ambassadorships.",
  },
  { title: "Managing the boring stuff", body: "We manage your emails, pitch you to brands and organise invoicing and paperwork." },
  { title: "Help you grow as a creator", body: "Help you build your socials with our expansive and experienced team. We love seeing our creators grow!" },
  { title: "Networking", body: "We connect you to an established network of global brands and creators, including opportunities beyond your current niche." },
];

/** The 18+ policy band (from the mocks). */
export const TECH_POLICY = {
  title: "Every creator is 18 or over.",
  // TODO(Asha): confirm the policy wording before launch (it comes from the homepage mocks)
  body: "Every creator we sign is 18 or over, and every partnership is checked against who their audience is. We publish the sponsors we will not work with.",
  stats: [
    { value: "18+", label: "Every signed creator" },
    { value: "In-house", label: "Every creator brief" },
    { value: "0", label: "Wagering, skin gambling, case-opening or crypto casino sponsors" },
  ],
};

/** TODO(Asha): ModeSociety Tech's own handles, if it gets them; until then the Mode Society ones are used. */
export const TECH_SOCIALS: { label: string; href: string }[] = [];

export const TECH_CONTACT_LINE =
  "If you're interested in working with us, complete the form with a few details about your brand or about you as a creator, and our team will get in touch with you.";

export const TECH_FAQ_BRANDS = [
  { q: "Who writes the creator brief?", a: "We do. Our team turns your objectives, audience and key messages into the brief creators work from, and you approve it before anything is made." },
  { q: "How do you choose creators?", a: "On fit, not follower count: their audience, content style and performance history, checked against your brand, your goal and the creator's adult audience share." },
  { q: "What do you report after a campaign?", a: "Transparent reporting across reach, views, engagement and the other KPIs we agree up front, so you can see performance and return on investment." },
  { q: "Which brands do you work with?", a: "Gaming gear and peripherals, energy drinks and snacks, tech and telco, and game publishers, in Australia and worldwide." },
];

export const TECH_FAQ_CREATORS = [
  { q: "Who can apply?", a: "Streamers, content creators, esports athletes and teams across gaming and tech, from local streamers to internationally represented players." },
  { q: "Do I need to be 18 or over?", a: "Yes. Every creator we sign is 18 or over; for a team, that means every member." },
  { q: "What do you handle for me?", a: "Brand partnerships, your emails, pitching you to brands, invoicing and paperwork, plus help growing your socials." },
  { q: "Which platforms do you look at?", a: "Twitch, YouTube, TikTok, Instagram, X and Kick. Tell us where your audience is, and how big it is, in the application." },
];

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

export const TECH_APPLY_AS = ["Creator", "Streamer", "Esports athlete", "Team"] as const;
export const TECH_REGIONS = ["Australia & NZ", "Asia", "Europe", "North America", "Elsewhere"] as const;
export const TECH_BUDGETS = ["Under $5k", "$5k–$15k", "$15k–$50k", "$50k+", "Not sure yet"] as const;
export const TECH_TIMELINES = ["ASAP", "Next 1–3 months", "3–6 months", "Just exploring"] as const;
export const TECH_CATEGORY_OPTIONS = TECH_CATEGORIES.map((c) => c.title.replace(" & ", " and "));
export const TECH_FORMAT_OPTIONS = TECH_FORMATS.map((f) => f.title);

/** The roster to show: the real one, or the marked samples until the first creator is added. */
export function rosterFor(real: RosterMember[]) {
  return real.length ? { members: real, sample: false } : { members: SAMPLE_ROSTER, sample: true };
}
