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
const tag = text("Tag", "The word in brackets before the small label. Leave empty to hide it.");
/** a note with a count in it: {n} is the number, {s} an s when it's not one */
const count = (label: string, example: string) => text(label, `{n} = the number, {s} = "s" when it's not one (e.g. ${example})`);

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
      cardLabel: text("Card label"), tapHint: text("Card hint on phones"), hoverHint: text("Card hint on computers"),
      label,
      meta,
      heading: heading(),
      items: list("Services", "service", { title: text("Name"), body: area("What it is"), linkLabel: text("Link text (optional)"), linkUrl: text("Link address (optional)") }),
    },
    defaults: {
      cardLabel: "Service", tapHint: "Tap to read →", hoverHint: "Hover to read →",
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
    fields: { tag, meta: count("Note on the right", "{n} things you can count on"), cardLabel: text("Card label"), label, heading: heading(), intro: area("Intro"), cards: list("Cards", "card", { title: text("Title"), body: area("Text") }), button: text("Button") },
    defaults: { tag: "✶", meta: "{n} things you can count on", cardLabel: "Mode Society", label: "How we work", heading: "What you can expect *from us.*", intro: EXPECT.intro, cards: EXPECT.cards.map((c) => ({ ...c })), button: "Book a call" },
  },
  "site.clients": {
    side: "talent",
    page: "Shared sections",
    path: "/",
    title: "Brands slideshow",
    hint: "The two rows of brand logos. The logos themselves are under Images.",
    hideable: true,
    fields: { meta: count("Note on the right", "{n} brands & counting"), label, heading: text("Big word"), subheading: text("Line beside it") },
    defaults: { meta: "{n} brands & counting", label: "Clients", heading: "Brands", subheading: "our creators have worked with" },
  },
  "site.numbers": {
    side: "talent",
    page: "Shared sections",
    path: "/",
    title: "The numbers",
    hint: "The charts comparing Mode Society with an in-house marketer (home, About, For brands).",
    hideable: true,
    fields: {
      modeLabel: text("First series name"), inHouseLabel: text("Second series name"), modeShort: text("First series: short name", "At the end of its line"), inHouseShort: text("Second series: short name", "At the end of its line"), modeColour: text("First series colour", "A colour code like #a3242b. Empty = the site's main colour"), inHouseColour: text("Second series colour", "A colour code like #a9822f. Empty = as designed"), months: lines("Line chart: months", "One per line"), modeLine: text("Line chart: first series", "One number per month, separated by commas"), inHouseLine: text("Line chart: second series", "One number per month, separated by commas"), modeShare: text("Budget ring: first series %", "How much of the budget reaches creators"), inHouseShare: text("Budget ring: second series %", "How much of the budget reaches creators"), ringCaption: text("Budget ring caption"), tableToggle: text("Table link"), tableMeasure: text("Table: first heading"), tableSales: text("Table: last row"),
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
      modeLabel: "With Mode Society", inHouseLabel: "In-house marketer", modeShort: "Mode", inHouseShort: "In-house", modeColour: "", inHouseColour: "", months: [...INFOGRAPHIC.salesLift.months], modeLine: INFOGRAPHIC.salesLift.mode.join(", "), inHouseLine: INFOGRAPHIC.salesLift.inHouse.join(", "), modeShare: String(INFOGRAPHIC.budget.mode.find((b) => /creators/i.test(b.label))?.value ?? ""), inHouseShare: String(INFOGRAPHIC.budget.inHouse.find((b) => /creators/i.test(b.label))?.value ?? ""), ringCaption: "of the budget goes to creators & content", tableToggle: "View the figures as a table", tableMeasure: "Measure", tableSales: "Sales index at month 6",
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
      meta, hint: text("Hint under the headlines", "Shown on computers with the blinds style"),
      label,
      brandsEyebrow: text("Brands: label"),
      brandsTitle: text("Brands: headline"),
      brandsButton: text("Brands: button"),
      talentEyebrow: text("Talent: label"),
      talentTitle: text("Talent: headline"),
      talentButton: text("Talent: button"),
    },
    defaults: {
      meta: "Brands · talent", hint: "Hover to open the blinds",
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
    fields: { talent: area("Talent application"), brands: area("Brand enquiry") },
    defaults: { ...FORM_INTROS },
  },
  "site.nav": {
    side: "talent",
    page: "Shared sections",
    path: "/",
    title: "Navigation",
    hint: "The bar along the top of every page and the menu that opens on phones.",
    fields: {
      homeLink: text("Menu: Home"),
      aboutLink: text("Menu: About us"),
      brandsLink: text("Menu: For brands"),
      talentLink: text("Menu: For talent"),
      servicesLink: text("Menu: Services"),
      workLink: text("Menu: Our work"),
      pressLink: text("Menu: Featured in"),
      techLink: text("Menu: ModeSociety Tech"),
      contactLink: text("Menu: Contact us"),
      contactButton: text("Contact button"),
      menuLabel: text("Phone menu: label"),
      menuNote: text("Phone menu: note"),
      menuEnquiry: text("Phone menu: enquiry link"),
    },
    defaults: {
      homeLink: "Home",
      aboutLink: "About us",
      brandsLink: "For brands",
      talentLink: "For talent",
      servicesLink: "Services",
      workLink: "Our work",
      pressLink: "Featured in",
      techLink: "ModeSociety Tech",
      contactLink: "Contact us",
      contactButton: "Contact us",
      menuLabel: "Index",
      menuNote: "Melbourne → worldwide",
      menuEnquiry: "Make an enquiry →",
    },
  },
  "site.footer": {
    side: "talent",
    page: "Shared sections",
    path: "/",
    title: "Footer",
    hint: "The burgundy footer on every page.",
    fields: {
      tag,
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
      tag: "✶",
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
      est: text("Top line: year"), kind: text("Top line: what we are"), middle: text("Top line: middle"), where: text("Top line: right"), whereShort: text("Top line: right, on phones"),
      tagline: area("Tagline", "*stars* = italic"),
      circled: text("Circled word", "A word from the tagline that gets the red circle drawn around it"),
      brandsButton: text("Brands button"),
      talentButton: text("Talent button"),
      list: lines("List on the right", "One per line"),
    },
    defaults: {
      est: "Est. 2022", kind: "Talent & creator agency", middle: "Models · Influencers · UGC · Streamers", where: "Melbourne → worldwide", whereShort: "Melbourne → world",
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
    fields: { allPress: text("Link to all press"), readMore: text("Read more link"), label, heading: heading() },
    defaults: { allPress: "All press ↗", readMore: "Read more", label: "Featured in", heading: "As *seen in.*" },
  },

  // =========================================================================
  // About
  // =========================================================================
  "about.hero": {
    side: "talent",
    page: "About us",
    path: "/about",
    title: "Page title",
    fields: { tag, label, meta, heading: heading() },
    defaults: { tag: "About", label: "Mode Society", meta: "Est. January 2022 · Melbourne", heading: "About *us.*" },
  },
  "about.story": {
    side: "talent",
    page: "About us",
    path: "/about",
    title: "Our story",
    fields: {
      figLabel: text("Before the photo caption"),
      storyTitle: text("First dropdown title"),
      story: area("Our story", "Leave a blank line between paragraphs"),
      listTitle: text("Second dropdown title"),
      list: lines("What we are", "One per line"),
      caption: text("Team photo caption"),
    },
    defaults: {
      figLabel: "Fig. 01",
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
    fields: { tag, label, meta, heading: heading(), body: area("Text"), button: text("Button") },
    defaults: {
      tag: "For brands",
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
    fields: { tag, label },
    defaults: { tag: "✶", label: "Our approach" },
  },
  "brands.faq": {
    side: "talent",
    page: "For brands",
    path: "/work-with-us",
    title: "Questions brands ask",
    hint: "Also given to Google as FAQ data.",
    hideable: true,
    fields: { ...faqFields, tag, meta: count("Note on the right", "{n} question{s}") },
    defaults: { tag: "FAQ", meta: "{n} question{s}", label: "Questions brands ask", heading: "Good to *know.*", items: BRAND_FAQ.map((f) => ({ ...f })) },
  },
  "brands.form": {
    side: "talent",
    page: "For brands",
    path: "/work-with-us#book",
    title: "Enquiry form",
    hint: "The form's own introduction is under Shared sections → Form introductions.",
    fields: { tag, label, meta, heading: heading() },
    defaults: { tag: "Book a call", label: "Enquiry form", meta: "We reply by email", heading: "Tell us about *your brand.*" },
  },

  // =========================================================================
  // For talent
  // =========================================================================
  "talent.hero": {
    side: "talent",
    page: "For talent",
    path: "/apply-to-be-a-creator",
    title: "Page title",
    fields: { tag, label, meta, heading: heading(), body: area("Text"), button: text("Button") },
    defaults: {
      tag: "For talent",
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
    fields: { stepsMeta: count("Steps note", "{n} steps"), stepWord: text("Word before each step number"), label, heading: heading(), body: area("Big text"), stepsLabel: text("Steps label"), steps: list("Steps", "step", { title: text("Title"), body: area("Text") }) },
    defaults: {
      stepsMeta: "{n} steps", stepWord: "Step",
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
    fields: { meta: count("Note on the right", "{n} included"), label, heading: heading(), list: lines("Ticked list", "One per line") },
    defaults: { meta: "{n} included", label: "What we do for you", heading: "What we do *for you.*", list: [...TALENT.forYou] },
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
    fields: { ...faqFields, tag, meta: count("Note on the right", "{n} question{s}") },
    defaults: { tag: "FAQ", meta: "{n} question{s}", label: "Questions creators ask", heading: "Good to *know.*", items: TALENT_FAQ.map((f) => ({ ...f })) },
  },
  "talent.form": {
    side: "talent",
    page: "For talent",
    path: "/apply-to-be-a-creator#apply",
    title: "Application form",
    hint: "The form's own introduction is under Shared sections → Form introductions.",
    fields: { tag, label, heading: heading() },
    defaults: { tag: "Apply now", label: "Talent application", heading: "Want Mode *to represent you?*" },
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
    fields: { tag, label, meta, heading: heading() },
    defaults: { tag: "Services", label: "How it works", meta: "No price list: every package is built around you", heading: "Four ways\n*we work with brands.*" },
  },
  "services.list": {
    side: "talent",
    page: "Services",
    path: "/services",
    title: "Services, step by step",
    fields: {
      eyebrow: text("Label above each service"),
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
      eyebrow: "How it works",
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
    fields: { tag, label, meta, heading: text("Big word"), accent: text("Red word beside it"), body: area("Text"), side: lines("Note on the right", "One per line") },
    defaults: {
      tag: "Archive",
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
    fields: { countLabel: count("Count beside the heading", "{n} pieces"), heading: text("Heading"), brandsLabel: text("Brand list label"), button: text("Button") },
    defaults: { countLabel: "{n} pieces", heading: "Selected work", brandsLabel: "Brands", button: "Be next" },
  },
  "work.next": {
    side: "talent",
    page: "Our work",
    path: "/our-work",
    title: "Want to be next?",
    hideable: true,
    fields: { tag, label, meta, heading: heading(), brandsButton: text("Brands button"), talentButton: text("Talent button") },
    defaults: { tag: "Next", label: "Your campaign", meta: "Brands · talent", heading: "Want to be *next?*", brandsButton: "For brands", talentButton: "For talent" },
  },

  // =========================================================================
  // Featured in, Contact
  // =========================================================================
  "press.hero": {
    side: "talent",
    page: "Featured in",
    path: "/featured-in",
    title: "Page title",
    hint: "The features themselves are in the Featured in tab.",
    fields: {
      tag, featuresLabel: text("Label above the features"), featuresMeta: count("Note above the features", "{n} feature{s}"),
      label,
      meta,
      heading: heading(),
      ghost: text("Blurred word behind"),
      empty: area("Message while there's no press yet"),
      emptyButton: text("Button while there's no press yet"),
    },
    defaults: {
      tag: "Press", featuresLabel: "Features", featuresMeta: "{n} feature{s}",
      label: "Featured in",
      meta: "Media & press",
      heading: "Featured *in.*",
      ghost: "Press",
      empty: "Our press page is on its way. In the meantime, here are some of the brands our creators have worked with.",
      emptyButton: "Press enquiries",
    },
  },
  "contact.hero": {
    side: "talent",
    page: "Contact us",
    path: "/get-in-touch",
    title: "Page title",
    fields: { tag, label, meta, heading: heading(), line: area("Line under the heading"), socials: text("Line beside the social links") },
    defaults: { tag: "Contact", label: "Brands · talent", meta: "Melbourne → worldwide", heading: "Get in *touch.*", line: GET_IN_TOUCH.line, socials: GET_IN_TOUCH.socials },
  },
  "contact.cards": {
    side: "talent",
    page: "Contact us",
    path: "/get-in-touch",
    title: "Who are you? cards",
    hint: "The two cards that open each form. Keep them in this order: talent, brands.",
    fields: { cards: list("Cards", "card", { eyebrow: text("Label"), title: text("Headline"), body: text("Line"), cta: text("Button") }) },
    defaults: {
      cards: [
        { eyebrow: "For talent", title: "Want us to represent you?", body: "Models, influencers, UGC creators and streamers.", cta: "Apply now" },
        { eyebrow: "For brands", title: "Looking for an external PR team?", body: "Influencer campaigns, UGC, guest lists and funding.", cta: "Book a call" },
      ],
    },
  },
  // =========================================================================
  // ModeSociety Tech (Asha's v3.5 design, 6 Nov 2026): one page at /tech.
  // The defaults are the design's copy, word for word.
  // =========================================================================
  "techSite.hero": {
    side: "tech",
    page: "Home",
    path: "/tech",
    title: "Hero",
    hint: "The top of the page: the status chips, the headline, the line under it and the Player 1 / Player 2 cards.",
    fields: {
      chips: lines("Status chips", "One per line. The first one gets the blinking dot."),
      heading: heading("Headline", "Each line is a line of the headline · *stars* = the pixel words"),
      lede: area("Line under the headline"),
      p1Tag: text("Player 1 card: label"),
      p1Badge: text("Player 1 card: badge"),
      p1Title: text("Player 1 card: headline"),
      p1Body: area("Player 1 card: text"),
      p1Button: text("Player 1 card: button"),
      p2Tag: text("Player 2 card: label"),
      p2Badge: text("Player 2 card: badge"),
      p2Title: text("Player 2 card: headline"),
      p2Body: area("Player 2 card: text"),
      p2Button: text("Player 2 card: button"),
    },
    defaults: {
      chips: ["Status · Signing creators", "Region · AU → Worldwide", "Mode · Gaming & Tech"],
      heading: "Not just\n*gaming.*",
      lede: "We sign streamers, content creators and esports athletes across gaming and wider tech, and build brand campaigns around them.",
      p1Tag: "Player 1 · For brands",
      p1Badge: "P1",
      p1Title: "Run a campaign.",
      p1Body: "Creator campaigns, UGC, streams and event guest lists, built around your brand.",
      p1Button: "Brand enquiry",
      p2Tag: "Player 2 · For creators",
      p2Badge: "P2",
      p2Title: "Get signed.",
      p2Body: "Management for streamers, creators, players and teams. Adults only, by application.",
      p2Button: "Apply to sign",
    },
  },
  "techSite.ticker": {
    side: "tech",
    page: "Home",
    path: "/tech",
    title: "Ticker",
    hint: "The two moving strips under the hero.",
    fields: {
      inkItems: lines("Dark strip", "One per line"),
      badge: text("Light strip: badge"),
      limeItems: lines("Light strip", "One per line"),
    },
    defaults: {
      inkItems: ["Influencer & creator campaigns", "UGC", "Streaming", "Event guest lists", "Creator management"],
      badge: "LIVE",
      limeItems: [
        "Now casting",
        "Gaming gear & peripherals",
        "Energy drinks & snacks",
        "Tech & telco",
        "Game publishers",
        "Influencer & creator campaigns",
        "UGC",
        "Streaming",
        "Event guest lists",
        "Creator management",
      ],
    },
  },
  "techSite.film": {
    side: "tech",
    page: "Home",
    path: "/tech",
    title: "Welcome film",
    hint: "The film under the hero. It plays muted as a preview; the button plays it with sound.",
    hideable: true,
    fields: {
      videoUrl: text("Video link", "The welcome film is built in (/tech/welcome-1080.mp4). To change it, paste a YouTube or Vimeo link, an .mp4 address, or a Google Drive link (shared with anyone with the link; it plays in Drive's own player)"),
      label: text("Small label above it", "Leave empty to hide it"),
      play: text("Play button"),
    },
    defaults: {
      // Asha's film (Drive: MST_Welcome_to_Mode_Society_Tech_16x9_CGI.mp4), re-encoded and served by the site
      videoUrl: "/tech/welcome-1080.mp4",
      label: "",
      play: "Play with sound",
    },
  },
  "techSite.who": {
    side: "tech",
    page: "Home",
    path: "/tech",
    title: "Who we are",
    hideable: true,
    fields: {
      label: text("Small label"),
      lead: area("Big text", "*stars* = the pixel words"),
      sideTitle: text("Side: headline"),
      side: area("Side: text"),
    },
    defaults: {
      label: "Who are we?",
      lead: "We are a talent and creator agency representing *streamers, content creators, and esports athletes* worldwide for brand campaigns and events across gaming products and technology.",
      sideTitle: "Quality over volume.",
      side: "From local streamers to internationally represented athletes, our roster is built on quality over volume. We handle the relationship end-to-end, so brands get seamless execution and talent get partnerships that actually complement their niche.",
    },
  },
  "techSite.campaigns": {
    side: "tech",
    page: "Home",
    path: "/tech",
    title: "Campaigns",
    hint: "The cobalt section with the four glass objects. The cards keep their drawings by position: headset, can, phone, cartridge.",
    hideable: true,
    fields: {
      heading: heading("Headline", "Each line is a line of the headline · *stars* = the pixel words"),
      cards: list("Cards", "card", { label: text("Small label"), title: text("Title"), body: area("Text") }),
    },
    defaults: {
      heading: "Who we run\n*campaigns for.*",
      cards: [
        { label: "01 · Category", title: "Gaming gear & peripherals", body: "Mice, keyboards, headsets and full setups, shown in real use on stream and in clips." },
        { label: "02 · Category", title: "Energy drinks & snacks", body: "Stream sponsorships, UGC and event guest lists, with each creator's adult audience share shown up front." },
        { label: "03 · Category", title: "Tech & telco", body: "Phones, devices, connectivity and software, with creators who cover tech as well as games." },
        { label: "04 · Category", title: "Game publishers", body: "Launches, updates and drops, with streams, clips and creators on the guest list." },
      ],
    },
  },
  "techSite.run": {
    side: "tech",
    page: "Home",
    path: "/tech",
    title: "What we run",
    hint: "The bento grid. The five tiles keep their drawings by position.",
    hideable: true,
    fields: {
      heading: heading("Headline", "*stars* = the pixel words"),
      intro: area("Text beside the headline"),
      tiles: list("Tiles", "tile", { title: heading("Title", "Each line is a line of the title"), body: area("Text") }),
      roles: lines("Last tile: the words", "One per line"),
      ticket: text("Guest list tile: ticket label"),
      ticketValue: text("Guest list tile: ticket figure"),
      live: text("Streaming tile: badge"),
    },
    defaults: {
      heading: "What we *run.*",
      intro: "For gaming gear and peripheral brands, energy drinks and snacks, tech and telco, and game publishers.",
      tiles: [
        { title: "Influencer & creator\ncampaigns", body: "Multi-creator campaigns built around one brand goal, not one-off posts." },
        { title: "UGC", body: "Creator-made clips and posts, made for your own channels." },
        { title: "Streaming", body: "Sponsored streams and segments with creators who stream live." },
        { title: "Event guest lists", body: "The right creators on the guest list for launches and events." },
        { title: "Creator management", body: "We manage creators, streamers, players and teams, and connect them with brands." },
      ],
      roles: ["Creators.", "Streamers.", "Players.", "Teams."],
      ticket: "Guest list",
      ticketValue: "+1",
      live: "LIVE",
    },
  },
  "techSite.rules": {
    side: "tech",
    page: "Home",
    path: "/tech",
    title: "House rules",
    hideable: true,
    fields: {
      label: text("Small label"),
      heading: heading("Headline", "Each line is a line of the headline · *stars* = the pixel words"),
      lead: area("Text"),
      cards: list("Cards", "card", { label: text("Label"), badge: text("Badge"), figure: text("Big figure"), caption: text("Caption") }),
      docLabel: text("Briefs card: note"),
      docStamp: text("Briefs card: stamp"),
      nogo: lines("No-go card: the tags", "One per line"),
    },
    defaults: {
      label: "House rules",
      heading: "Every creator is\n*18 or over.*",
      lead: "Every creator we sign is 18 or over, and every partnership is checked against who their audience is. We publish the sponsors we will not work with.",
      cards: [
        { label: "Age check", badge: "✓ Always", figure: "18+", caption: "Every signed creator" },
        { label: "Briefs", badge: "✓ Always", figure: "In-house", caption: "Every creator brief" },
        { label: "No-go list", badge: "✓ Published", figure: "0", caption: "Wagering, skin gambling, case-opening or crypto casino sponsors" },
      ],
      docLabel: "Written by us",
      docStamp: "APPROVED",
      nogo: ["Wagering", "Skin gambling", "Case-opening", "Crypto casino"],
    },
  },
  "techSite.contact": {
    side: "tech",
    page: "Home",
    path: "/tech",
    title: "Get in touch",
    hint: "The two-step form. Brand enquiries and creator applications go to the Sheet and to pr@modesociety.com.au.",
    fields: {
      label: text("Small label"),
      heading: heading("Headline", "*stars* = the pixel words"),
      body: area("Text"),
      brandTab: text("Brand tab"),
      creatorTab: text("Creator tab"),
      level1: text("Level 1: label"),
      level1Title: text("Level 1: headline"),
      level2: text("Level 2: label"),
      brandLevel2: text("Level 2 for brands: headline"),
      creatorLevel2: text("Level 2 for creators: headline"),
      next: text("Next button"),
      back: text("Back button"),
      brandSend: text("Send button (brands)"),
      creatorSend: text("Send button (creators)"),
      brandThanks: area("After a brand enquiry"),
      creatorThanks: area("After a creator application"),
    },
    defaults: {
      label: "Get in touch",
      heading: "Two ways *in.*",
      body: "If you're interested in working with us, complete the form with a few details about your brand or about you as a creator, and our team will get in touch with you.",
      brandTab: "I'm a brand",
      creatorTab: "I'm a creator",
      level1: "About you",
      level1Title: "Who are we talking to?",
      level2: "Level 2",
      brandLevel2: "What are you launching?",
      creatorLevel2: "Where's your audience?",
      next: "Next level",
      back: "← Back",
      brandSend: "Send enquiry",
      creatorSend: "Apply to sign",
      brandThanks: "Our team will read your brief and email you to set up a call.",
      creatorThanks: "Our team reviews every application and will email you either way.",
    },
  },
  "techSite.faq": {
    side: "tech",
    page: "Home",
    path: "/tech",
    title: "Questions",
    hint: "Also given to Google as FAQ data.",
    hideable: true,
    fields: {
      heading: heading("Headline", "*stars* = the pixel words"),
      intro: text("Text beside the headline"),
      brandsLabel: text("Brands: label"),
      brands: list("Brands' questions", "question", { q: text("Question"), a: area("Answer") }),
      creatorsLabel: text("Creators: label"),
      creators: list("Creators' questions", "question", { q: text("Question"), a: area("Answer") }),
    },
    defaults: {
      heading: "Questions, *answered.*",
      intro: "If yours isn't here, ask us.",
      brandsLabel: "For brands",
      brands: [
        { q: "Who writes the creator brief?", a: "We do. Our team turns your objectives, audience and key messages into the brief creators work from, and you approve it before anything is made." },
        { q: "How do you choose creators?", a: "On fit, not follower count: their audience, content style and performance history, checked against your brand, your goal and the creator's adult audience share." },
        { q: "What do you report after a campaign?", a: "Transparent reporting across reach, views, engagement and the other KPIs we agree up front, so you can see performance and return on investment." },
      ],
      creatorsLabel: "For creators",
      creators: [
        { q: "Who can apply?", a: "Streamers, content creators, esports athletes and teams across gaming and tech, from local streamers to internationally represented players." },
        { q: "Do I need to be 18 or over?", a: "Yes. Every creator we sign is 18 or over; for a team, that means every member." },
        { q: "What do you handle for me?", a: "Brand partnerships, your emails, pitching you to brands, invoicing and paperwork, plus help growing your socials." },
      ],
    },
  },
  "techSite.nav": {
    side: "tech",
    page: "Shared sections",
    path: "/tech",
    title: "Navigation and loading screen",
    hint: "The bar along the top, the menu it opens, and the loading screen.",
    fields: {
      brand: text("Name"),
      brandAccent: text("Name: the blue word"),
      xp: text("Scroll meter label"),
      menu: text("Menu button"),
      menuTitle: text("Menu: label"),
      whoLink: text("Menu: link 1 (Who we are)"),
      campaignsLink: text("Menu: link 2 (Campaigns)"),
      runLink: text("Menu: link 3 (What we run)"),
      contactLink: text("Menu: link 4 (Get in touch)"),
      faqLink: text("Menu: link 5 (FAQ)"),
      brandButton: text("Menu: brand button"),
      creatorButton: text("Menu: creator button"),
      loading: text("Loading screen: label"),
      loaderLeft: text("Loading screen: bottom left"),
      loaderRight: text("Loading screen: bottom right"),
    },
    defaults: {
      brand: "ModeSociety",
      brandAccent: "Tech",
      xp: "XP",
      menu: "Menu",
      menuTitle: "Menu",
      whoLink: "Who we are",
      campaignsLink: "Campaigns",
      runLink: "What we run",
      contactLink: "Get in touch",
      faqLink: "FAQ",
      brandButton: "Brand enquiry",
      creatorButton: "Apply to sign",
      loading: "Loading",
      loaderLeft: "Mode Society Tech",
      loaderRight: "AU",
    },
  },
  "techSite.footer": {
    side: "tech",
    page: "Shared sections",
    path: "/tech",
    title: "Footer",
    hint: "Social links left empty are hidden.",
    fields: {
      blurb: area("Text"),
      brandButton: text("Brand button"),
      creatorButton: text("Creator button"),
      x: text("X link"),
      discord: text("Discord link"),
      instagram: text("Instagram link"),
      tiktok: text("TikTok link"),
      linkedin: text("LinkedIn link"),
      facebook: text("Facebook link"),
      legal: text("Bottom line: left"),
      place: text("Bottom line: middle"),
      back: text("Bottom line: link to Mode Society"),
    },
    defaults: {
      blurb: "Streamers, content creators and esports athletes, worldwide, for brand campaigns and events across gaming products and technology.",
      brandButton: "Brand enquiry",
      creatorButton: "Apply to sign",
      x: "",
      discord: "",
      instagram: "https://www.instagram.com/modesocietytech",
      tiktok: "https://www.tiktok.com/@modesocietyagency",
      linkedin: "https://www.linkedin.com/company/modesocietyagency",
      facebook: "",
      legal: "© Mode Society Pty Ltd",
      place: "Melbourne · AU",
      back: "Mode Society →",
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
