/**
 * Site copy, taken from the Canva edit slides. Edit wording here.
 * Anything marked TODO needs a real value from Mode Society.
 */

export const COMPANY = "Mode Society Pty Ltd";
export const INSTAGRAM_URL = "https://www.instagram.com/modesocietyagency";
export const TIKTOK_URL = "https://www.tiktok.com/@modesocietyagency";
export const LINKEDIN_URL = "https://www.linkedin.com/company/modesocietyagency";
export const GRANT_HELP_URL = "https://granthelp.com.au";

export const MENU = [
  { href: "/about", label: "About us" },
  { href: "/work-with-us", label: "For brands" },
  { href: "/apply-to-be-a-creator", label: "For talent" },
  { href: "/services", label: "Services" },
  { href: "/partner-with-us", label: "Partner with us" },
  // TODO: dedicated For Tech companies page; until then it opens the partnership form.
  { href: "/partner-with-us?for=tech", label: "For Tech companies" },
  { href: "/get-in-touch", label: "Contact us" },
];

export const QUOTE = "We put brands in front of the right creators and media. That's what turns attention into sales.";

export const AGENCY_INTRO =
  "Think of us as your external PR team. We don't make content in house. We find the right creators, anywhere in the world, and run the collab from brief to payment. Every package is built around you, whether that's a full campaign, influencer seeding, a guest list or one very targeted push. We've worked on launches from fashion to food and beverage, here and overseas.";

export type ServiceCopy = { key: string; title: string; body: string; link?: { href: string; label: string } };

/** The four services on the home page and For brands page (flip cards). */
export const SERVICE_COPY: ServiceCopy[] = [
  {
    key: "influencer",
    title: "Influencer campaigns",
    body: "Paid and gifted collabs with creators who genuinely fit your brand. We shortlist, negotiate, contract and brief them, then handle affiliate links, seeding, posting and payment. You approve the names; we run everything after that.",
  },
  {
    key: "ugc",
    title: "UGC content",
    body: "Creator-made content built for your paid ads and socials. Briefed properly to your product, your angle and your formats, and delivered as ready-to-run assets with usage rights agreed upfront.",
  },
  {
    key: "events",
    title: "Event guest lists",
    body: "Creators and models who'll actually turn up and post. We build the list around your room. From your audience, look, and numbers to briefing them on what to capture, leave your guest list up to us.",
  },
  {
    key: "funding",
    title: "Funding",
    body: "Through our sister company Grant Help, eligible brands can claim back up to 50% of overseas marketing and promotional spend, with government grants from $5,000 to $150,000. We'll tell you upfront whether you qualify.",
    link: { href: GRANT_HELP_URL, label: "Read more →" },
  },
];

export type StepIcon =
  | "brief" | "users" | "contract" | "camera" | "chart" | "target" | "search" | "package" | "refresh"
  | "room" | "list" | "check" | "mail" | "badge" | "file" | "megaphone" | "coins";

export type ServiceDetail = {
  id: string;
  title: string;
  steps: { name: string; text: string; icon: StepIcon }[];
  cta: { label: string; href: string; external?: boolean };
  more?: { label: string; href: string; external?: boolean };
};

/** The Services page: one service at a time, its "How it works" steps animating in. No prices anywhere. */
export const SERVICES_PAGE: ServiceDetail[] = [
  {
    id: "influencer-campaigns",
    title: "Influencer Campaigns",
    steps: [
      { name: "Brief", text: "You share the goal, budget and timing.", icon: "brief" },
      { name: "Shortlist", text: "Creators who fit, with location, age split and engagement data.", icon: "users" },
      { name: "Contract", text: "Signed agreements on deliverables, exclusivity and usage.", icon: "contract" },
      { name: "Production", text: "You approve every draft before anything goes live.", icon: "camera" },
      { name: "Report", text: "A close-out report with links and performance.", icon: "chart" },
    ],
    cta: { label: "Tell us about your campaign", href: "/get-in-touch?form=brands" },
  },
  {
    id: "ugc-content",
    title: "UGC Content",
    steps: [
      { name: "Scope", text: "Formats, volume and usage rights, agreed upfront.", icon: "target" },
      { name: "Casting", text: "Creators matched to your product and your angle.", icon: "search" },
      { name: "Brief", text: "Hooks, angles and formats, briefed properly.", icon: "brief" },
      { name: "Delivery", text: "Ready-to-run 9:16, 4:5 and 1:1 assets, raw and edited.", icon: "package" },
      { name: "Revisions", text: "Tweaks handled until it's ready to run.", icon: "refresh" },
    ],
    cta: { label: "Scope a UGC package", href: "/get-in-touch?form=brands" },
  },
  {
    id: "event-guest-lists",
    title: "Event Guest Lists",
    steps: [
      { name: "The room", text: "Your audience, your look and your numbers.", icon: "room" },
      { name: "The list", text: "A curated list sized to your capacity.", icon: "list" },
      { name: "Confirmation", text: "Every attendee confirmed in advance.", icon: "check" },
      { name: "Brief", text: "Guests briefed on what to capture on the night.", icon: "brief" },
      { name: "Follow-up", text: "A round-up of everything that went out.", icon: "mail" },
    ],
    cta: { label: "Build a guest list", href: "/get-in-touch?form=brands" },
  },
  {
    id: "funding",
    title: "Funding",
    steps: [
      { name: "Eligibility", text: "We tell you upfront whether you qualify.", icon: "badge" },
      { name: "Application", text: "Grant Help handles the application, not you.", icon: "file" },
      { name: "Campaign", text: "Campaign work scoped so it qualifies.", icon: "megaphone" },
      { name: "Claim", text: "Claim back up to 50% of eligible overseas spend.", icon: "coins" },
    ],
    cta: { label: "Check if you're eligible", href: "/get-in-touch?form=brands" },
    more: { label: "About Grant Help ↗", href: GRANT_HELP_URL, external: true },
  },
];

export const ABOUT = {
  story:
    "Mode Society is a female-led and owned boutique talent and creator agency out of Melbourne. We look after PR, guest lists, digital strategy and talent management for brands in beauty, wellness, fashion, gaming and consumer goods. We started in January 2022. Our CEO and directors each bring 15+ years in PR and communications, most of it spent running PR and digital campaigns.",
  grantHelp:
    "And through our sister company Grant Help, Australian brands can tap into government grants to fund marketing overseas.",
  whatWeAre: [
    "Boutique. You deal directly with the directors.",
    "Experienced across digital, social and traditional media.",
    "Picky about aesthetic fit. Follower count comes second.",
    "At the forefront of influencer engagement.",
    "Home to talent big and small, worldwide.",
  ],
  team: "Our team: Asha Stonehouse, Tiana Scheirs and Patrick Finnegan.",
};

/** "What you can expect from us": swipe-through cards. */
export const EXPECT = {
  intro:
    "Mode Society is an Australian boutique talent agency representing a carefully curated roster of UGC creators, influencers, models and creative professionals worldwide. We source through our own roster and an extended creator network.",
  cards: [
    { title: "Sourcing", body: "We look past follower counts to find creators whose audience already matches yours." },
    { title: "Casting", body: "A shortlist chosen for aesthetic fit and real engagement, for you to approve." },
    { title: "Briefing", body: "Clear briefs on your product, your angle and your formats, so content lands first time." },
    { title: "Content coordination", body: "Drafts, approvals and posting schedules managed in one place." },
    { title: "Outreach", body: "We approach creators through our own roster and an extended network worldwide." },
    { title: "Negotiations", body: "Rates, usage and exclusivity agreed in writing before anything is made." },
    { title: "Communication", body: "One point of contact and fast replies, from first call to final report." },
    { title: "Deliverables", body: "Content delivered on time, with links and performance reported back." },
  ],
};

export const TALENT = {
  intro:
    "Mode Society represents models, influencers and UGC creators across beauty, wellness, fashion, gaming and tech, connecting talent with campaigns that suit their aesthetic, not just their follower count. Whether you're just starting out or already have a portfolio behind you, we want to hear from you.",
  frustrations: ["Poor communication", "Lack of transparency", "Misaligned opportunities", "Slow responses"],
  created:
    "Mode Society was created to offer a more personal, hands-on approach. Our talent aren't just represented; they're understood. We take care of the administration, negotiations and communication, while understanding each creator's goals, creative direction and the brands they want to work with.",
  journey: [
    { title: "Sign", body: "A short chat, a clear agreement, and you're on the roster." },
    { title: "Get matched", body: "We pitch you to brands that suit your aesthetic and audience." },
    { title: "Create", body: "Briefs, contracts and approvals handled. You focus on the content." },
    { title: "Get paid", body: "We invoice the brand and chase payment, so you don't have to." },
  ],
  forYou: [
    "Your own Mode Society email",
    "Brand vetting",
    "Negotiation",
    "Contracts",
    "Invoicing and payment collection",
    "Mon–Fri online support",
    "Help growing your socials",
    "No commission on gifted collabs",
  ],
  // TODO: match the final wording to the talent agreement.
  flexible: [
    { title: "Your choice", body: "Exclusive or non-exclusive representation. You decide." },
    { title: "No conflicts", body: "We only cover social, influencer and UGC work, so we sit alongside any modelling agency." },
    { title: "30 days' notice", body: "Either side can end the arrangement with 30 days' notice." },
  ],
};

/**
 * Results infographic. TODO: replace with Mode Society's real campaign figures.
 * While `illustrative` is true the section carries an "illustrative figures" note.
 */
export const INFOGRAPHIC = {
  illustrative: true,
  roi: [
    { label: "Return per $1 spent", mode: 5.2, inHouse: 2.1, format: (v: number) => `$${v.toFixed(1)}` },
    { label: "Creators within reach", mode: 1000, inHouse: 40, format: (v: number) => `${Math.round(v)}${v >= 1000 ? "+" : ""}` },
    { label: "Weeks to first campaign live", mode: 2, inHouse: 8, format: (v: number) => `${Math.round(v)}` },
  ],
  salesLift: {
    months: ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"],
    mode: [100, 118, 141, 163, 190, 214],
    inHouse: [100, 104, 109, 112, 117, 121],
  },
  budget: {
    mode: [
      { label: "Creators & content", value: 78 },
      { label: "Management", value: 22 },
    ],
    inHouse: [
      { label: "Salary & overheads", value: 55 },
      { label: "Creators & content", value: 30 },
      { label: "Tools & software", value: 15 },
    ],
  },
};

export const GET_IN_TOUCH = {
  heading: "Get in touch",
  line: "Have more questions? We're chronically online, so shoot us a message.",
  socials: "Psst, make sure to follow us <3",
};

export const FORM_INTROS = {
  talent:
    "Want Mode to represent you? Tell us a bit about you and your channels. We ask for your follower count and engagement screenshots for each channel so we can see how your audience actually shows up for you, not just how big it is.",
  brands:
    "Are you looking for an external agency to handle all your PR and social media marketing? That's where we come in. Tell us about your brand and what you need, and we'll email you to lock in a call.",
  partner:
    "Not booking our services, but want to work together? This form is for B2B partnerships: referral and affiliate programs, co-marketing, cross-promotions and strategic alliances. For example, a platform that refers its creators to us while we refer ours back, rather than paying us for a service.",
};
