/**
 * Site copy, taken from the Canva edit slides. Edit wording here.
 * Anything marked TODO needs a real value from Mode Society.
 */

export const COMPANY = "Mode Society Pty Ltd";
export const INSTAGRAM_URL = "https://instagram.com/modesocietyagency";
/** TODO: Mode Society's LinkedIn page. The LinkedIn icon is hidden until this is set. */
export const LINKEDIN_URL = "";
export const GRANT_HELP_URL = "https://granthelp.com.au";

export const MENU = [
  { href: "/about", label: "About us" },
  { href: "/work-with-us", label: "For brands" },
  { href: "/apply-to-be-a-creator", label: "For talent" },
  { href: "/services", label: "Services" },
  { href: "/get-in-touch?form=partner", label: "Partner with us" },
  // TODO: dedicated For Tech companies page; until then it opens the partnership form.
  { href: "/get-in-touch?form=partner&for=tech", label: "For Tech companies" },
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

export type ServiceDetail = {
  id: string;
  number: string;
  title: string;
  summary: string;
  steps: string[];
  get: string[];
  who: string;
  media: string;
  buttons: { label: string; href: string; external?: boolean }[];
  extra?: { title: string; points: string[] };
};

/** The Services page: five sections with jump links. No prices anywhere. */
export const SERVICES_PAGE: ServiceDetail[] = [
  {
    id: "influencer-campaigns",
    number: "01",
    title: "Influencer Campaigns",
    summary:
      "Paid and gifted collabs with creators who genuinely fit your brand: shortlisted, contracted, briefed and paid, without you managing any of it.",
    steps: ["Brief", "Shortlist", "Contract", "Production", "Report"],
    get: [
      "A shortlist with audience data: location, age split, engagement",
      "Signed agreements covering deliverables, exclusivity and usage",
      "Draft approval before anything is posted",
      "Affiliate links and tracked seeding where the campaign suits it",
      "All creator payments handled",
      "A close-out report with links and performance",
    ],
    who: "Brands running a launch, a seasonal push, or an always-on creator programme.",
    media: "service.influencer",
    buttons: [{ label: "Tell us about your campaign", href: "/get-in-touch?form=brands" }],
  },
  {
    id: "ugc-content",
    number: "02",
    title: "UGC Content",
    summary:
      "Creator-made content built for your ads and socials: briefed properly, delivered as ready-to-run assets, with usage rights agreed upfront.",
    steps: ["Scope", "Casting", "Brief", "Delivery", "Revisions"],
    get: [
      "9:16, 4:5 and 1:1 versions as standard",
      "Raw footage plus edited cuts",
      "Multiple hook variations built for paid testing",
      "Usage rights agreed before filming: paid social, organic and whitelisting, scoped in writing",
      "Captions and on-screen text where the format needs it",
    ],
    who: "Brands who need volume for paid social testing, or a consistent organic feed without a studio budget.",
    media: "service.ugc",
    buttons: [{ label: "Scope a UGC package", href: "/get-in-touch?form=brands" }],
  },
  {
    id: "event-guest-lists",
    number: "03",
    title: "Event Guest Lists",
    summary:
      "Creators and models who'll actually turn up and post: chosen for your room, confirmed in advance, and briefed on what to capture.",
    steps: ["The room", "The list", "Confirmation", "Brief", "Follow-up"],
    get: [
      "A curated, confirmed list sized to your capacity",
      "Agreed content deliverables per attendee on paid bookings",
      "A contact on the night so you're not managing talent at your own event",
      "A post-event round-up of what went out",
    ],
    who: "Launches, store openings, runway, activations and press nights.",
    media: "service.events",
    buttons: [{ label: "Build a guest list", href: "/get-in-touch?form=brands" }],
  },
  {
    id: "funding",
    number: "04",
    title: "Funding",
    summary:
      "Through our sister company Grant Help, eligible brands can claim back up to 50% of overseas marketing spend, with government grants from $5,000 to $150,000.",
    steps: ["Eligibility check", "Application", "Campaign", "Claim"],
    get: [
      "An eligibility answer before you commit to anything",
      "Application handled by Grant Help, not by you",
      "Campaign work scoped so it qualifies",
      "Documentation kept in order for the claim",
    ],
    who: "Australian brands marketing into overseas markets.",
    media: "service.funding",
    buttons: [
      { label: "Check if you're eligible", href: "/get-in-touch?form=brands" },
      { label: "Read more about Grant Help →", href: GRANT_HELP_URL, external: true },
    ],
  },
  {
    id: "ai-campaigns",
    number: "05",
    title: "AI Campaigns (New)",
    summary:
      "A full-scale campaign built with AI-generated content, for brands who need volume and speed at lower cost, or who want to stretch a creator campaign further.",
    steps: ["Concept", "Generation", "Direction", "Variations", "Delivery"],
    get: [
      "Campaign concepts and scripts",
      "AI-generated video and stills",
      "Hook and caption variations for paid testing",
      "Platform-ready formats in every aspect ratio you need",
      "Clear AI labelling on delivered assets",
    ],
    who: "Brands testing creative at volume, brands working to a smaller budget, and brands wanting more mileage out of a campaign they've already run.",
    media: "service.ai",
    buttons: [{ label: "Talk through an AI campaign", href: "/get-in-touch?form=brands" }],
    // TODO: replace with the full "Where we draw the line" text from the slide notes.
    extra: {
      title: "Where we draw the line",
      points: [
        "Everything AI-generated is disclosed and labelled as AI.",
        "We never use a real person's likeness without their written consent.",
        "If your brief needs real trust, a real face or a real review, we'll tell you to book a creator instead.",
      ],
    },
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
