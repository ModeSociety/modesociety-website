/**
 * Every editable block of text on the site, section by section. The admin panel's "Pages & text"
 * tab is generated from this list, and what's typed there is saved in the "Content" tab of the
 * Sheet. Until a section is edited it shows the wording below (the original copy in content.ts
 * and tech.ts). Saved values are merged over these defaults field by field, so a section never
 * breaks if the Sheet holds something unexpected.
 *
 * Headings use two small conventions: each line of the text is a line of the headline, and
 * words wrapped in *stars* get the accent style (the italic serif on the talent site, blue
 * gradient type on ModeSociety Tech).
 */
import {
  ABOUT,
  AGENCY_INTRO,
  AGENCY_LEAD,
  BRAND_FAQ,
  EXPECT,
  FORM_INTROS,
  GET_IN_TOUCH,
  INFOGRAPHIC,
  QUOTE,
  SERVICE_COPY,
  SERVICES_PAGE,
  TALENT,
  TALENT_FAQ,
  type StepIcon,
} from "./content";
import {
  TECH_CATEGORIES,
  TECH_CONTACT_LINE,
  TECH_FAQ_BRANDS,
  TECH_FAQ_CREATORS,
  TECH_FORMATS,
  TECH_FOR_CREATORS,
  TECH_POLICY,
  TECH_PROCESS,
  TECH_WHO,
} from "./tech";

export type CopySide = "talent" | "tech";

export type Field =
  | { type: "text"; label: string; hint?: string }
  | { type: "area"; label: string; hint?: string }
  | { type: "heading"; label: string; hint?: string }
  | { type: "lines"; label: string; hint?: string }
  | { type: "select"; label: string; options: readonly string[]; hint?: string }
  | { type: "list"; label: string; item: Record<string, Field>; itemName: string; hint?: string };

export type SectionDef = {
  side: CopySide;
  /** groups sections in the admin panel, in page order */
  page: string;
  /** where to see it */
  path: string;
  title: string;
  hint?: string;
  /** can be switched off in the admin panel */
  hideable?: boolean;
  fields: Record<string, Field>;
  defaults: Record<string, unknown>;
};

// ---- field helpers ----
const text = (label: string, hint?: string): Field => ({ type: "text", label, hint });
const area = (label: string, hint?: string): Field => ({ type: "area", label, hint });
const heading = (label = "Heading", hint?: string): Field => ({ type: "heading", label, hint });
const lines = (label: string, hint?: string): Field => ({ type: "lines", label, hint });
const list = (label: string, itemName: string, item: Record<string, Field>, hint?: string): Field => ({ type: "list", label, itemName, item, hint });
const label = text("Small label", "The small capitals above the section");
const meta = text("Note on the right", "The small note at the right of the label. Leave empty to hide it.");

export const STEP_ICONS: StepIcon[] = ["brief", "users", "contract", "camera", "chart", "target", "search", "package", "refresh", "room", "list", "check", "mail", "badge", "file", "megaphone", "coins"];

const faqFields = { label, heading: heading(), items: list("Questions", "question", { q: text("Question"), a: area("Answer") }) };

export const SECTIONS = {
  // =========================================================================
  // Talent site: shared sections (they appear on more than one page)
  // =========================================================================
  "site.quote": {
    side: "talent",
    page: "Shared sections",
    path: "/about",
    title: "Pull quote",
    hint: "The big quote on About, For brands and next to the services on the home page.",
    fields: { quote: area("Quote", "Without quotation marks; they're added for you") },
    defaults: { quote: QUOTE },
  },
  "site.services": {
    side: "talent",
    page: "Shared sections",
    path: "/",
    title: "Services cards",
    hint: "The flip cards on the home page and For brands, and the services list on About.",
    fields: {
      label,
      meta,
      heading: heading(),
      items: list("Services", "service", { title: text("Name"), body: area("What it is"), linkLabel: text("Link text (optional)"), linkUrl: text("Link address (optional)") }),
    },
    defaults: {
      label: "Services",
      meta: "Four ways we work with brands",
      heading: "What we\n*bring to the table.*",
      items: SERVICE_COPY.map((s) => ({ title: s.title, body: s.body, linkLabel: s.link?.label ?? "", linkUrl: s.link?.href ?? "" })),
    },
  },
  "site.expect": {
    side: "talent",
    page: "Shared sections",
    path: "/work-with-us",
    title: "What you can expect from us",
    hint: "The swipe-through cards on the burgundy background (About and For brands).",
    hideable: true,
    fields: { label, heading: heading(), intro: area("Intro"), cards: list("Cards", "card", { title: text("Title"), body: area("Text") }), button: text("Button") },
    defaults: { label: "How we work", heading: "What you can expect *from us.*", intro: EXPECT.intro, cards: EXPECT.cards.map((c) => ({ ...c })), button: "Book a call" },
  },
  "site.clients": {
    side: "talent",
    page: "Shared sections",
    path: "/",
    title: "Brands slideshow",
    hint: "The two rows of brand logos. The logos themselves are under Images.",
    hideable: true,
    fields: { label, heading: text("Big word"), subheading: text("Line beside it") },
    defaults: { label: "Clients", heading: "Brands", subheading: "our creators have worked with" },
  },
  "site.numbers": {
    side: "talent",
    page: "Shared sections",
    path: "/",
    title: "The numbers",
    hint: "The charts comparing Mode Society with an in-house marketer (home, About, For brands).",
    hideable: true,
    fields: {
      label,
      meta,
      heading: heading(),
      intro: area("Intro"),
      chartTitle: text("Line chart title"),
      chartNote: text("Line chart note"),
      barsTitle: text("Bars title"),
      rows: list("Bars", "measure", {
        label: text("Measure"),
        mode: text("With Mode Society", "e.g. $5.2, 1000+, 2"),
        inHouse: text("In-house marketer", "e.g. $2.1, 40, 8"),
      }),
      moneyTitle: text("Budget title"),
      moneyText: area("Budget text"),
      note: text("Small print", "e.g. \"Illustrative figures.\" Leave empty to hide it."),
    },
    defaults: {
      label: "The numbers",
      meta: "Mode Society vs an in-house marketer",
      heading: "The right creators, *better returns.*",
      intro: "Sourcing the right people for each campaign beats carrying an in-house marketer: more reach, faster launches and more of your spend landing where it sells.",
      chartTitle: "Sales index over a six-month campaign",
      chartNote: "Indexed to 100 at launch · hover to compare",
      barsTitle: "Mode Society vs in-house",
      rows: INFOGRAPHIC.roi.map((r) => ({ label: r.label, mode: r.format(r.mode), inHouse: r.format(r.inHouse) })),
      moneyTitle: "Where the money goes",
      moneyText: "In house, most of the budget is salary, overheads and tools. With us, it's creators and content: the part your customers actually see.",
      note: INFOGRAPHIC.illustrative ? "Illustrative figures." : "",
    },
  },
  "site.cta": {
    side: "talent",
    page: "Shared sections",
    path: "/",
    title: "Let's work together",
    hint: "The For brands / For talent section near the bottom of the home page. Its animation is chosen under Animations.",
    hideable: true,
    fields: {
      label,
      brandsEyebrow: text("Brands: label"),
      brandsTitle: text("Brands: headline"),
      brandsButton: text("Brands: button"),
      talentEyebrow: text("Talent: label"),
      talentTitle: text("Talent: headline"),
      talentButton: text("Talent: button"),
    },
    defaults: {
      label: "Let's work together",
      brandsEyebrow: "For brands",
      brandsTitle: "Cast your next campaign",
      brandsButton: "Work with us",
      talentEyebrow: "For talent",
      talentTitle: "Thinking of signing?",
      talentButton: "Apply now",
    },
  },
  "site.forms": {
    side: "talent",
    page: "Shared sections",
    path: "/get-in-touch",
    title: "Form introductions",
    hint: "The italic line at the top of each enquiry form, wherever the form appears.",
    fields: { talent: area("Talent application"), brands: area("Brand enquiry"), partner: area("Partnership enquiry") },
    defaults: { ...FORM_INTROS },
  },
  "site.footer": {
    side: "talent",
    page: "Shared sections",
    path: "/",
    title: "Footer",
    hint: "The burgundy footer on every page.",
    fields: {
      label,
      meta,
      heading: text("Headline"),
      subheading: text("Second line"),
      enquiryLabel: text("Enquiries label"),
      enquiryText: area("Enquiries text"),
      enquiryButton: text("Enquiries button"),
      strapline: text("Bottom line"),
    },
    defaults: {
      label: "Let's connect",
      meta: "Melbourne → worldwide",
      heading: "Tell us your vision.",
      subheading: "We'll bring it to life.",
      enquiryLabel: "Enquiries",
      enquiryText: "Tell us a little about you and we'll get back to you.",
      enquiryButton: "Make an enquiry",
      strapline: "Influencer campaigns · UGC · Event guest lists · Funding",
    },
  },

  // =========================================================================
  // Home
  // =========================================================================
  "home.hero": {
    side: "talent",
    page: "Home",
    path: "/",
    title: "Hero",
    hint: "Under the big logo at the top. The photos are under Images; the animation under Animations.",
    fields: {
      tagline: area("Tagline", "*stars* = italic"),
      circled: text("Circled word", "A word from the tagline that gets the red circle drawn around it"),
      brandsButton: text("Brands button"),
      talentButton: text("Talent button"),
      list: lines("List on the right", "One per line"),
    },
    defaults: {
      tagline: "*Models, influencers, UGC creators & streamers,* cast for fit, not follower count.",
      circled: "fit",
      brandsButton: "For brands",
      talentButton: "For talent",
      list: ["Influencer campaigns", "UGC content", "Event guest lists", "Funding"],
    },
  },
  "home.intro": {
    side: "talent",
    page: "Home",
    path: "/",
    title: "Intro film",
    hint: "A landscape film under the hero. Paste a YouTube or Vimeo link, or put the video in the Drive folder \"Intro Video\". Hidden until there's a film.",
    hideable: true,
    fields: { label, meta, heading: heading(), body: area("Text (optional)"), videoUrl: text("YouTube or Vimeo link", "Leave empty to use the video in the Drive folder \"Intro Video\"") },
    defaults: { label: "Meet Mode Society", meta: "Press play", heading: "Meet *Mode Society.*", body: "", videoUrl: "" },
  },
  "home.agency": {
    side: "talent",
    page: "Home",
    path: "/",
    title: "The agency",
    hideable: true,
    fields: { label, meta, heading: heading(), body: area("Text"), button: text("Button") },
    defaults: {
      label: "The agency",
      meta: "Boutique · female-led · Melbourne",
      heading: "Think of us as your *external* PR team.",
      body: AGENCY_INTRO.replace(AGENCY_LEAD, "").trim(),
      button: "Get to know us",
    },
  },
  "home.work": {
    side: "talent",
    page: "Home",
    path: "/",
    title: "Selected work",
    hint: "The photos come from Images → Our work.",
    hideable: true,
    fields: { label, meta, heading: heading(), body: area("Text"), button: text("Button") },
    defaults: {
      label: "Our work",
      meta: "Selected campaigns",
      heading: "Selected *work.*",
      body: "Influencer campaigns, UGC and event guest lists for brands from fashion and beauty to gaming and food.",
      button: "See all work",
    },
  },
  "home.press": {
    side: "talent",
    page: "Home",
    path: "/",
    title: "Featured in",
    hint: "Shows once there's press. The features themselves are in the Featured in tab.",
    hideable: true,
    fields: { label, heading: heading() },
    defaults: { label: "Featured in", heading: "As *seen in.*" },
  },

  // =========================================================================
  // About
  // =========================================================================
  "about.hero": {
    side: "talent",
    page: "About us",
    path: "/about",
    title: "Page title",
    fields: { label, meta, heading: heading() },
    defaults: { label: "Mode Society", meta: "Est. January 2022 · Melbourne", heading: "About *us.*" },
  },
  "about.story": {
    side: "talent",
    page: "About us",
    path: "/about",
    title: "Our story",
    fields: {
      storyTitle: text("First dropdown title"),
      story: area("Our story", "Leave a blank line between paragraphs"),
      listTitle: text("Second dropdown title"),
      list: lines("What we are", "One per line"),
      caption: text("Team photo caption"),
    },
    defaults: {
      storyTitle: "Our story",
      story: [ABOUT.story, AGENCY_INTRO, ABOUT.grantHelp].join("\n\n"),
      listTitle: "What we are",
      list: [...ABOUT.whatWeAre],
      caption: ABOUT.team.replace("Our team: ", ""),
    },
  },
  "about.services": {
    side: "talent",
    page: "About us",
    path: "/about",
    title: "What we do",
    hint: "The services themselves are under Shared sections → Services cards.",
    hideable: true,
    fields: { label, meta, heading: heading() },
    defaults: { label: "What we do", meta: "Four services", heading: "Creators your customers *actually trust.*" },
  },

  // =========================================================================
  // For brands
  // =========================================================================
  "brands.hero": {
    side: "talent",
    page: "For brands",
    path: "/work-with-us",
    title: "Page title",
    fields: { label, meta, heading: heading(), body: area("Text"), button: text("Button") },
    defaults: {
      label: "Your external PR team",
      meta: "Influencer · UGC · Events · Funding",
      heading: "Let's work\n*together.*",
      body: AGENCY_INTRO,
      button: "Book a call",
    },
  },
  "brands.approach": {
    side: "talent",
    page: "For brands",
    path: "/work-with-us",
    title: "Our approach",
    hint: "Shows the pull quote (Shared sections → Pull quote).",
    hideable: true,
    fields: { label },
    defaults: { label: "Our approach" },
  },
  "brands.faq": {
    side: "talent",
    page: "For brands",
    path: "/work-with-us",
    title: "Questions brands ask",
    hint: "Also given to Google as FAQ data.",
    hideable: true,
    fields: faqFields,
    defaults: { label: "Questions brands ask", heading: "Good to *know.*", items: BRAND_FAQ.map((f) => ({ ...f })) },
  },
  "brands.form": {
    side: "talent",
    page: "For brands",
    path: "/work-with-us#book",
    title: "Enquiry form",
    hint: "The form's own introduction is under Shared sections → Form introductions.",
    fields: { label, meta, heading: heading() },
    defaults: { label: "Enquiry form", meta: "We reply by email", heading: "Tell us about *your brand.*" },
  },

  // =========================================================================
  // For talent
  // =========================================================================
  "talent.hero": {
    side: "talent",
    page: "For talent",
    path: "/apply-to-be-a-creator",
    title: "Page title",
    fields: { label, meta, heading: heading(), body: area("Text"), button: text("Button") },
    defaults: {
      label: "Models · influencers · UGC · streamers",
      meta: "Applications open",
      heading: "Thinking of\n*signing?*",
      body: TALENT.intro,
      button: "Apply now",
    },
  },
  "talent.why": {
    side: "talent",
    page: "For talent",
    path: "/apply-to-be-a-creator",
    title: "Why we started",
    hideable: true,
    fields: { label, meta, heading: heading(), body: area("Text"), list: lines("Struck-through list", "One per line") },
    defaults: {
      label: "Why we started",
      meta: "What creators told us",
      heading: "Why we started *Mode Society.*",
      body: "Traditional representation left too many creators frustrated. So we built the agency we wished we'd had.",
      list: [...TALENT.frustrations],
    },
  },
  "talent.expect": {
    side: "talent",
    page: "For talent",
    path: "/apply-to-be-a-creator",
    title: "What you can expect",
    hideable: true,
    fields: { label, heading: heading(), body: area("Big text"), stepsLabel: text("Steps label"), steps: list("Steps", "step", { title: text("Title"), body: area("Text") }) },
    defaults: {
      label: "What you can expect",
      heading: "What you can expect *from us.*",
      body: TALENT.created,
      stepsLabel: "From signing to getting paid",
      steps: TALENT.journey.map((s) => ({ ...s })),
    },
  },
  "talent.forYou": {
    side: "talent",
    page: "For talent",
    path: "/apply-to-be-a-creator",
    title: "What we do for you",
    hideable: true,
    fields: { label, heading: heading(), list: lines("Ticked list", "One per line") },
    defaults: { label: "What we do for you", heading: "What we do *for you.*", list: [...TALENT.forYou] },
  },
  "talent.flexible": {
    side: "talent",
    page: "For talent",
    path: "/apply-to-be-a-creator",
    title: "Flexible representation",
    hideable: true,
    fields: { label, heading: heading(), cards: list("Cards", "card", { title: text("Title"), body: area("Text") }) },
    defaults: { label: "Flexible representation", heading: "Flexible *representation.*", cards: TALENT.flexible.map((c) => ({ ...c })) },
  },
  "talent.faq": {
    side: "talent",
    page: "For talent",
    path: "/apply-to-be-a-creator",
    title: "Questions creators ask",
    hint: "Also given to Google as FAQ data.",
    hideable: true,
    fields: faqFields,
    defaults: { label: "Questions creators ask", heading: "Good to *know.*", items: TALENT_FAQ.map((f) => ({ ...f })) },
  },
  "talent.form": {
    side: "talent",
    page: "For talent",
    path: "/apply-to-be-a-creator#apply",
    title: "Application form",
    hint: "The form's own introduction is under Shared sections → Form introductions.",
    fields: { label, heading: heading() },
    defaults: { label: "Talent application", heading: "Want Mode *to represent you?*" },
  },

  // =========================================================================
  // Services
  // =========================================================================
  "services.hero": {
    side: "talent",
    page: "Services",
    path: "/services",
    title: "Page title",
    hint: "The second line of the heading is set smaller.",
    fields: { label, meta, heading: heading() },
    defaults: { label: "How it works", meta: "No price list: every package is built around you", heading: "Four ways\n*we work with brands.*" },
  },
  "services.list": {
    side: "talent",
    page: "Services",
    path: "/services",
    title: "Services, step by step",
    fields: {
      items: list("Services", "service", {
        title: text("Name"),
        steps: list("How it works", "step", { name: text("Step"), text: area("What happens"), icon: { type: "select", label: "Icon", options: STEP_ICONS } }),
        ctaLabel: text("Button"),
        ctaUrl: text("Button link"),
        moreLabel: text("Second button (optional)"),
        moreUrl: text("Second button link"),
      }),
    },
    defaults: {
      items: SERVICES_PAGE.map((s) => ({
        title: s.title,
        steps: s.steps.map((st) => ({ ...st })),
        ctaLabel: s.cta.label,
        ctaUrl: s.cta.href,
        moreLabel: s.more?.label ?? "",
        moreUrl: s.more?.href ?? "",
      })),
    },
  },

  // =========================================================================
  // Our work
  // =========================================================================
  "work.hero": {
    side: "talent",
    page: "Our work",
    path: "/our-work",
    title: "Page title",
    fields: { label, meta, heading: text("Big word"), accent: text("Red word beside it"), body: area("Text"), side: lines("Note on the right", "One per line") },
    defaults: {
      label: "Case studies",
      meta: "Since 2022",
      heading: "Work/",
      accent: "archive",
      body: "Campaigns, UGC and event guest lists our creators have made for brands, from fashion and beauty to gaming and food, here and overseas.",
      side: ["Influencer campaigns / UGC content", "Event guest lists / Funding"],
    },
  },
  "work.gallery": {
    side: "talent",
    page: "Our work",
    path: "/our-work",
    title: "Gallery",
    hint: "The photos and videos are under Images → Our work; the brand names come from the brand logos.",
    fields: { heading: text("Heading"), brandsLabel: text("Brand list label"), button: text("Button") },
    defaults: { heading: "Selected work", brandsLabel: "Brands", button: "Be next" },
  },
  "work.next": {
    side: "talent",
    page: "Our work",
    path: "/our-work",
    title: "Want to be next?",
    hideable: true,
    fields: { label, meta, heading: heading(), brandsButton: text("Brands button"), talentButton: text("Talent button") },
    defaults: { label: "Your campaign", meta: "Brands · talent", heading: "Want to be *next?*", brandsButton: "For brands", talentButton: "For talent" },
  },

  // =========================================================================
  // Featured in, Partner with us, Contact
  // =========================================================================
  "press.hero": {
    side: "talent",
    page: "Featured in",
    path: "/featured-in",
    title: "Page title",
    hint: "The features themselves are in the Featured in tab.",
    fields: {
      label,
      meta,
      heading: heading(),
      ghost: text("Blurred word behind"),
      empty: area("Message while there's no press yet"),
      emptyButton: text("Button while there's no press yet"),
    },
    defaults: {
      label: "Featured in",
      meta: "Media & press",
      heading: "Featured *in.*",
      ghost: "Press",
      empty: "Our press page is on its way. In the meantime, here are some of the brands our creators have worked with.",
      emptyButton: "Press enquiries",
    },
  },
  "partner.hero": {
    side: "talent",
    page: "Partner with us",
    path: "/partner-with-us",
    title: "Page title",
    hint: "The form's introduction is under Shared sections → Form introductions.",
    fields: { label, meta, heading: heading() },
    defaults: { label: "B2B partnerships", meta: "Referrals · affiliates · co-marketing", heading: "Partner *with us.*" },
  },
  "contact.hero": {
    side: "talent",
    page: "Contact us",
    path: "/get-in-touch",
    title: "Page title",
    fields: { label, meta, heading: heading(), line: area("Line under the heading"), socials: text("Line beside the social links") },
    defaults: { label: "Brands · talent · partners", meta: "Melbourne → worldwide", heading: "Get in *touch.*", line: GET_IN_TOUCH.line, socials: GET_IN_TOUCH.socials },
  },
  "contact.cards": {
    side: "talent",
    page: "Contact us",
    path: "/get-in-touch",
    title: "Who are you? cards",
    hint: "The three cards that open each form. Keep them in this order: talent, brands, partners.",
    fields: { cards: list("Cards", "card", { eyebrow: text("Label"), title: text("Headline"), body: text("Line"), cta: text("Button") }) },
    defaults: {
      cards: [
        { eyebrow: "For talent", title: "Want us to represent you?", body: "Models, influencers, UGC creators and streamers.", cta: "Apply now" },
        { eyebrow: "For brands", title: "Looking for an external PR team?", body: "Influencer campaigns, UGC, guest lists and funding.", cta: "Book a call" },
        { eyebrow: "Partner with us", title: "Want to work together?", body: "Referrals, affiliates, co-marketing and cross-promotion.", cta: "Send" },
      ],
    },
  },
  // =========================================================================
  // ModeSociety Tech: Home
  // =========================================================================
  "techHome.hero": {
    side: "tech",
    page: "Home",
    path: "/tech",
    title: "Hero",
    hint: "The top of /tech, with the two doors for brands and creators.",
    fields: {
      eyebrow: text("Small label"),
      heading: heading("Heading", "Each line is a line of the heading · wrap words in *stars* for blue gradient type"),
      body: area("Text"),
      brandsLabel: text("Brands door: label"),
      brandsTitle: text("Brands door: headline"),
      brandsBody: area("Brands door: text"),
      brandsButton: text("Brands door: button"),
      creatorsLabel: text("Creators door: label"),
      creatorsTitle: text("Creators door: headline"),
      creatorsBody: area("Creators door: text"),
      creatorsButton: text("Creators door: button"),
      hud: lines("Readout, top right", "One per line"),
      ticker: lines("Scrolling ticker", "One per line; the first gets the blue Live tag"),
    },
    defaults: {
      eyebrow: "Gaming and tech creators",
      heading: "Not just\n*gaming.*",
      body: "We sign streamers, content creators and esports athletes across gaming and wider tech, and build brand campaigns around them.",
      brandsLabel: "Player 1 · For brands",
      brandsTitle: "Run a campaign.",
      brandsBody: "Creator campaigns, UGC, streams and event guest lists, built around your brand.",
      brandsButton: "Brand enquiry",
      creatorsLabel: "Player 2 · For creators",
      creatorsTitle: "Get signed.",
      creatorsBody: "Management for streamers, creators, players and teams. Adults only, by application.",
      creatorsButton: "Apply to sign",
      hud: ["Status · signing creators", "Region · AU → worldwide", "Mode · gaming & tech"],
      ticker: ["Now casting", ...TECH_CATEGORIES.map((c) => c.title), ...TECH_FORMATS.map((f) => f.title)],
    },
  },
  "techHome.intro": {
    side: "tech",
    page: "Home",
    path: "/tech",
    title: "Intro film",
    hint: "A landscape film under the hero. Paste a YouTube or Vimeo link, or put the video in the Drive folder \"Tech Video\". Hidden until there's a film.",
    hideable: true,
    fields: { eyebrow: text("Small label"), heading: heading(), videoUrl: text("YouTube or Vimeo link", "Leave empty to use the video in the Drive folder \"Tech Video\"") },
    defaults: { eyebrow: "Watch", heading: "Meet ModeSociety Tech.", videoUrl: "" },
  },
  "techHome.who": {
    side: "tech",
    page: "Home",
    path: "/tech",
    title: "Who are we?",
    hideable: true,
    fields: { label: text("Small label"), lead: area("Big text"), body: area("Text"), categoriesTitle: heading("Heading above the categories") },
    defaults: { label: "Who are we?", lead: TECH_WHO.lead, body: TECH_WHO.body, categoriesTitle: "Who we run campaigns for." },
  },
  "techHome.talent": {
    side: "tech",
    page: "Home",
    path: "/tech",
    title: "Choose your creator",
    hint: "The featured roster. Shows once ModeSociety Tech is launched; the creators are in the Roster tab.",
    hideable: true,
    fields: { eyebrow: text("Small label"), heading: heading(), lead: area("Text"), button: text("Button") },
    defaults: {
      eyebrow: "Our talent",
      heading: "Choose your creator.",
      lead: "Streamers, content creators and esports athletes across gaming and tech. Quality over volume.",
      button: "See the full roster",
    },
  },
  "techHome.run": {
    side: "tech",
    page: "Home",
    path: "/tech",
    title: "What we run",
    hint: "The formats themselves are under Shared sections → Formats.",
    hideable: true,
    fields: { heading: heading(), lead: area("Text") },
    defaults: { heading: "What we run.", lead: "For gaming gear and peripheral brands, energy drinks and snacks, tech and telco, and game publishers." },
  },
  "techHome.contact": {
    side: "tech",
    page: "Home",
    path: "/tech#contact",
    title: "Enquiry forms",
    hint: "Beside the two forms on the landing page (before launch).",
    fields: { eyebrow: text("Small label"), heading: heading(), body: area("Text") },
    defaults: { eyebrow: "Get in touch", heading: "Two ways in.", body: TECH_CONTACT_LINE },
  },

  // =========================================================================
  // ModeSociety Tech: For brands, For creators, Our talent, Contact
  // =========================================================================
  "techBrands.hero": {
    side: "tech",
    page: "For brands",
    path: "/tech/brands",
    title: "Page title",
    fields: { eyebrow: text("Small label"), heading: text("Heading"), lead: area("Text"), ghost: text("Outlined word behind"), button: text("Button") },
    defaults: { eyebrow: "For brands", heading: "Why brands call us.", lead: "Creator campaigns, UGC, streams and event guest lists, built around your brand.", ghost: "Brief.", button: "Brand enquiry" },
  },
  "techBrands.process": {
    side: "tech",
    page: "For brands",
    path: "/tech/brands",
    title: "Our process",
    hideable: true,
    fields: { eyebrow: text("Small label"), heading: heading(), steps: list("Levels", "level", { title: text("Title"), body: area("Text") }) },
    defaults: { eyebrow: "How a campaign runs", heading: "Our process.", steps: TECH_PROCESS.map((s) => ({ ...s })) },
  },
  "techBrands.run": {
    side: "tech",
    page: "For brands",
    path: "/tech/brands",
    title: "What we run",
    hint: "The formats and categories themselves are under Shared sections.",
    hideable: true,
    fields: { heading: heading(), lead: area("Text"), categoriesTitle: heading("Heading above the categories") },
    defaults: { heading: "What we run.", lead: "Formats we build campaigns from, mixed to suit your goal.", categoriesTitle: "Who we work with." },
  },
  "techCreators.hero": {
    side: "tech",
    page: "For creators",
    path: "/tech/creators",
    title: "Page title",
    fields: { eyebrow: text("Small label"), heading: text("Heading"), lead: area("Text"), ghost: text("Outlined word behind"), button: text("Button") },
    defaults: { eyebrow: "For creators", heading: "Get signed.", lead: "Management for streamers, content creators and esports athletes. Adults only, by application.", ghost: "Join.", button: "Apply to sign" },
  },
  "techCreators.forYou": {
    side: "tech",
    page: "For creators",
    path: "/tech/creators",
    title: "What we do for you",
    hideable: true,
    fields: { heading: heading(), items: list("Cards", "card", { title: text("Title"), body: area("Text") }) },
    defaults: { heading: "What we do for you.", items: TECH_FOR_CREATORS.map((c) => ({ ...c })) },
  },
  "techCreators.examples": {
    side: "tech",
    page: "For creators",
    path: "/tech/creators",
    title: "Who we look after",
    hint: "The quotes and cards come from the Roster tab.",
    hideable: true,
    fields: { eyebrow: text("Small label"), heading: heading() },
    defaults: { eyebrow: "Creator examples", heading: "Who we look after." },
  },
  "techCreators.join": {
    side: "tech",
    page: "For creators",
    path: "/tech/creators",
    title: "Get on the roster",
    hideable: true,
    fields: { heading: text("Heading"), body: area("Text"), button: text("Button"), secondButton: text("Second button") },
    defaults: {
      heading: "Get on the roster.",
      body: "Streamers, creators, esports athletes and teams across gaming and tech can apply. Our team reviews every application.",
      button: "Apply to sign",
      secondButton: "See the roster",
    },
  },
  "techTalent.hero": {
    side: "tech",
    page: "Our talent",
    path: "/tech/talent",
    title: "Page title",
    hint: "The creators themselves are in the Roster tab.",
    fields: { eyebrow: text("Small label"), heading: text("Heading"), lead: area("Text"), ghost: text("Outlined word behind"), cta: text("Line under the roster") },
    defaults: {
      eyebrow: "Our talent",
      heading: "The roster.",
      lead: "Streamers, content creators, esports athletes and teams, with their channels and how many people follow them.",
      ghost: "Talent.",
      cta: "Want one of them on your campaign, or want to join them?",
    },
  },
  "techContact.hero": {
    side: "tech",
    page: "Contact",
    path: "/tech/contact",
    title: "Page title",
    fields: { eyebrow: text("Small label"), heading: text("Heading"), lead: area("Text"), ghost: text("Outlined word behind"), asideLabel: text("Box beside the form: label"), asideText: area("Box beside the form: text") },
    defaults: {
      eyebrow: "Contact",
      heading: "Let's work together.",
      lead: TECH_CONTACT_LINE,
      ghost: "Hello.",
      asideLabel: "Follow us",
      asideText: "New signings, streams and campaigns, as they happen.",
    },
  },

  // =========================================================================
  // ModeSociety Tech: shared sections
  // =========================================================================
  "tech.categories": {
    side: "tech",
    page: "Shared sections",
    path: "/tech",
    title: "Who we run campaigns for",
    hint: "The category cards on Home and For brands. (The brand form's category options stay as they are, so the Sheet stays tidy.)",
    fields: { items: list("Categories", "category", { title: text("Title"), body: area("Text") }) },
    defaults: { items: TECH_CATEGORIES.map((c) => ({ ...c })) },
  },
  "tech.formats": {
    side: "tech",
    page: "Shared sections",
    path: "/tech",
    title: "Formats",
    hint: "The five cards in What we run, each with its own little animation, in this order: campaigns, UGC, streaming, guest lists, management. Empty a title to hide that card.",
    fields: { items: list("Formats", "format", { title: text("Title"), body: area("Text") }) },
    defaults: { items: TECH_FORMATS.map((f) => ({ title: f.title, body: f.body })) },
  },
  "tech.policy": {
    side: "tech",
    page: "Shared sections",
    path: "/tech",
    title: "18+ policy",
    hint: "The band on Home and For creators.",
    hideable: true,
    fields: { title: heading(), body: area("Text"), stats: list("Figures", "figure", { value: text("Figure"), label: text("Caption") }) },
    defaults: { title: TECH_POLICY.title, body: TECH_POLICY.body, stats: TECH_POLICY.stats.map((x) => ({ ...x })) },
  },
  "tech.faq": {
    side: "tech",
    page: "Shared sections",
    path: "/tech",
    title: "Questions, answered",
    hint: "Home shows the first three of each; For brands and For creators show their full list. Also given to Google as FAQ data.",
    hideable: true,
    fields: {
      heading: heading(),
      lead: text("Line under the heading"),
      brands: list("For brands", "question", { q: text("Question"), a: area("Answer") }),
      creators: list("For creators", "question", { q: text("Question"), a: area("Answer") }),
    },
    defaults: {
      heading: "Questions, answered.",
      lead: "If yours isn't here, ask us.",
      brands: TECH_FAQ_BRANDS.map((f) => ({ ...f })),
      creators: TECH_FAQ_CREATORS.map((f) => ({ ...f })),
    },
  },
  "tech.logos": {
    side: "tech",
    page: "Shared sections",
    path: "/tech",
    title: "Brand logos",
    hint: "On Home once ModeSociety Tech is launched. The logos are under Images & video.",
    hideable: true,
    fields: { label: text("Small label"), emptyTitle: text("Heading while there are no logos"), emptyBody: area("Text while there are no logos"), button: text("Button") },
    defaults: {
      label: "Brands our creators have worked with",
      emptyTitle: "This space is open.",
      emptyBody: "ModeSociety Tech is new. Partner logos appear here once a deal is signed and the partner has approved it.",
      button: "Brand enquiry",
    },
  },
  "tech.cta": {
    side: "tech",
    page: "Shared sections",
    path: "/tech/brands",
    title: "Two ways in (end of each page)",
    hint: "The closing call above the footer, once ModeSociety Tech is launched.",
    hideable: true,
    fields: { heading: text("Heading"), body: area("Text"), brandsButton: text("Brands button"), creatorsButton: text("Creators button") },
    defaults: { heading: "Two ways in.", body: "Brands, tell us what you're launching. Creators, apply to sign.", brandsButton: "Brand enquiry", creatorsButton: "Apply to sign" },
  },
  "tech.footer": {
    side: "tech",
    page: "Shared sections",
    path: "/tech",
    title: "Footer",
    fields: { blurb: area("Text"), place: text("Bottom line") },
    defaults: {
      blurb: "Streamers, content creators and esports athletes, worldwide, for brand campaigns and events across gaming products and technology.",
      place: "Melbourne, Australia · Working worldwide",
    },
  },
} satisfies Record<string, SectionDef>;

export type SectionId = keyof typeof SECTIONS;
type Defaults<K extends SectionId> = (typeof SECTIONS)[K]["defaults"];
export type SectionCopy<K extends SectionId> = Defaults<K> & { hidden: boolean };
export type SiteCopy = { [K in SectionId]: SectionCopy<K> };

export const SECTION_IDS = Object.keys(SECTIONS) as SectionId[];
export const isSectionId = (id: unknown): id is SectionId => typeof id === "string" && id in SECTIONS;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const blankFor = (f: Field): unknown => (f.type === "list" || f.type === "lines" ? [] : "");

/** One field: the saved value if it has the right shape, otherwise the default. */
export function mergeField(f: Field, def: unknown, raw: unknown): unknown {
  if (f.type === "list") {
    if (!Array.isArray(raw)) return def;
    return raw
      .filter(isObj)
      .slice(0, 60)
      .map((r) => Object.fromEntries(Object.entries(f.item).map(([k, sub]) => [k, mergeField(sub, blankFor(sub), r[k])])));
  }
  if (f.type === "lines") return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string").slice(0, 80) : def;
  if (f.type === "select") return typeof raw === "string" && f.options.includes(raw) ? raw : def;
  return typeof raw === "string" ? raw : def;
}

export function mergeSection(id: SectionId, raw: unknown) {
  const def = SECTIONS[id] as SectionDef;
  const r = isObj(raw) ? raw : {};
  const out: Record<string, unknown> = Object.fromEntries(Object.entries(def.fields).map(([k, f]) => [k, mergeField(f, def.defaults[k], r[k])]));
  out.hidden = Boolean(def.hideable && r.hidden === true);
  return out;
}

/** The whole site's copy: saved edits (section id → JSON) over the defaults. */
export function resolveCopy(saved: Record<string, unknown> = {}): SiteCopy {
  return Object.fromEntries(SECTION_IDS.map((id) => [id, mergeSection(id, saved[id])])) as SiteCopy;
}
