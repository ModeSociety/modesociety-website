/**
 * The creator application, which is also the onboarding form (Asha's pack, 16 Nov 2026:
 * Creator_Application_Form_and_Terms for each business). One form serves both sites; the lists
 * that differ come from APP_OPTIONS. The browser and the server use the same rules (stepProblems),
 * so they can never disagree about what is required.
 */
import type { Side } from "./side";

export type Based = "Australia" | "International";
export type AddressType = "Street address" | "PO Box or parcel locker";
export type Representation = "Exclusive (20% commission)" | "Non-exclusive (30% commission)";
export type Channel = { platform: string; link: string; followers: string };

export type Application = {
  // Step 1: about you
  legalName: string;
  creatorName: string;
  email: string;
  mobile: string;
  dob: string; // yyyy-mm-dd
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  // Step 1b: where you're based
  based: Based | "";
  country: string;
  region: string;
  uaePermit: string;
  // Step 1c: postal address for PR packages
  addressType: AddressType | "";
  address1: string;
  address2: string;
  suburb: string;
  postcode: string;
  // Step 2: headshots (Drive file ids; the first is the profile photo)
  photos: string[];
  profileThumb: string;
  // Step 3: socials
  mainPlatform: string;
  mainLink: string;
  mainFollowers: string;
  avgViews: string;
  others: Channel[];
  mediaKit: string; // a Drive file id or a link
  /** optional screenshots of their insights or analytics (Drive file ids), up to MAX_SCREENSHOTS */
  screenshots: string[];
  // Step 4: content
  niches: string[];
  work: string[];
  games: string; // Tech
  setup: string[]; // Tech
  audienceCountry: string;
  /** ModeSociety Tech: the share of their audience that is 18+ (its House rules) */
  adultShare: string;
  collaborations: string;
  represented: "Yes" | "No" | "";
  agency: string;
  // Step 5: discovery
  discovery: string;
  referrer: string;
  discoveryOther: string;
  // Step 6: representation
  representation: Representation | "";
  // Step 7: agreements
  agreements: string[];
  tips: boolean;
};

export const blankApplication = (): Application => ({
  legalName: "", creatorName: "", email: "", mobile: "", dob: "", guardianName: "", guardianEmail: "", guardianPhone: "",
  based: "", country: "", region: "", uaePermit: "",
  addressType: "", address1: "", address2: "", suburb: "", postcode: "",
  photos: [], profileThumb: "",
  mainPlatform: "", mainLink: "", mainFollowers: "", avgViews: "", others: [], mediaKit: "", screenshots: [],
  niches: [], work: [], games: "", setup: [], audienceCountry: "", adultShare: "", collaborations: "", represented: "", agency: "",
  discovery: "", referrer: "", discoveryOther: "",
  representation: "",
  agreements: [], tips: false,
});

// ---------------------------------------------------------------------------
// Lists (Asha's spec). The eligible countries and blocked regions are editable in the admin panel.
// ---------------------------------------------------------------------------

export const ELIGIBLE_COUNTRIES = ["Australia", "United States", "United Kingdom", "Japan", "United Arab Emirates"];
export const BLOCKED_REGIONS = ["California", "New York"];
export const NOT_LISTED = "My country isn't listed";

export const AU_STATES = [
  "Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland",
  "South Australia", "Tasmania", "Victoria", "Western Australia",
];
export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
  "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
  "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

/** Audience top country (optional): the common ones, then "Other". */
export const AUDIENCE_COUNTRIES = [
  "Australia", "New Zealand", "United States", "United Kingdom", "Canada", "Ireland", "Japan", "South Korea", "Singapore",
  "Philippines", "Indonesia", "Malaysia", "India", "United Arab Emirates", "Germany", "France", "Brazil", "Mexico", "Other",
];

export const REPRESENTATIONS: Representation[] = ["Exclusive (20% commission)", "Non-exclusive (30% commission)"];

export type AppOptions = {
  name: string;
  platforms: string[];
  niches: string[];
  work: string[];
  discovery: string[];
  setup: string[];
  /** Step 3's optional number: average views per post, or (Tech) average live viewers */
  avgLabel: string;
  agreements: string[];
  tipsLabel: string;
};

const agreements = (name: string, adultsOnly = false) => [
  `I consent to ${name} using the images and content I have uploaded, as set out in the Application Terms.`,
  "I have read and agree to the Application Terms and Privacy Collection Notice.",
  "I confirm the information I have provided is true and accurate.",
  adultsOnly ? "I am 18 or older." : "I am 18 or older, or my parent/guardian has consented to this application.",
  `I understand ${name} does not guarantee representation, work or income.`,
];

export const APP_OPTIONS: Record<Side, AppOptions> = {
  talent: {
    name: "Mode Society",
    platforms: ["Instagram", "TikTok", "YouTube", "Pinterest", "Facebook", "LinkedIn", "Snapchat", "X (Twitter)", "Lemon8", "Other"],
    niches: ["Fashion", "Beauty / makeup", "Skincare", "Hair", "Lifestyle", "Fitness & wellness", "Food", "Travel", "Home & interiors", "Parenting", "Luxury", "Modelling", "Other"],
    work: [
      "UGC / content creation", "Social media influencing", "Fashion / commercial modelling", "Beauty / hair / fitness campaigns",
      "Brand ambassadorships", "Event appearances", "Photography / videography", "Creative direction",
    ],
    discovery: ["Instagram", "TikTok", "LinkedIn", "Google search", "Referred by a creator", "Referred by a brand", "Event", "Other"],
    setup: [],
    avgLabel: "Average views per post",
    agreements: agreements("Mode Society"),
    tipsLabel: "Send me Mode Society creator tips and opportunities by email.",
  },
  tech: {
    name: "Mode Society Tech",
    platforms: ["Twitch", "YouTube", "YouTube Gaming", "TikTok", "Kick", "Instagram", "X (Twitter)", "Discord", "Facebook Gaming", "LinkedIn", "Other"],
    niches: [
      "FPS", "Battle royale", "MOBA", "RPG / MMO", "Sports & racing", "Strategy", "Simulation", "Horror", "Mobile gaming", "Retro",
      "Indie", "Esports / competitive", "Variety streaming", "Tech reviews & unboxing", "PC builds & setups", "Cosplay",
      "Mobile / telco / gadgets", "Other",
    ],
    work: [
      "Sponsored streams", "Sponsored YouTube videos", "Short-form (TikTok/Shorts)", "Game & product reviews", "Game key / launch campaigns",
      "Event & LAN appearances", "Esports / tournament", "UGC ads", "Long-term ambassador", "Hosting / casting",
    ],
    discovery: ["Instagram", "TikTok", "LinkedIn", "Twitch", "Discord", "Google search", "Referred by a creator", "Referred by a brand", "Event", "Other"],
    setup: ["PC", "PlayStation", "Xbox", "Nintendo", "Mobile", "VR"],
    avgLabel: "Average live viewers (if streaming)",
    agreements: agreements("Mode Society Tech", true),
    tipsLabel: "Send me Mode Society Tech creator tips and opportunities by email.",
  },
};

/** The version of the Application Terms a creator accepts (saved with the consent record). */
export const TERMS_VERSION = "2026-11-18"; // 18 Nov: ModeSociety Tech signs 18+ only (its House rules)

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

export const STEP_IDS = ["about", "based", "address", "photos", "socials", "content", "discovery", "representation", "agreements"] as const;
export type StepId = (typeof STEP_IDS)[number];

/** Age in whole years on a date (yyyy-mm-dd), or null for a date that isn't one. */
export function ageOn(dob: string, today = new Date()): number | null {
  const m = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (Number.isNaN(d.getTime()) || d > today) return null;
  let age = today.getUTCFullYear() - d.getUTCFullYear();
  const md = (today.getUTCMonth() - d.getUTCMonth()) * 100 + (today.getUTCDate() - d.getUTCDate());
  if (md < 0) age--;
  return age;
}

export const isEmailAddress = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
/** A phone number: digits with spaces, brackets, dashes and an optional leading + (8 to 15 digits). */
export const isPhone = (v: string) => /^\+?[\d\s()-]+$/.test(v.trim()) && (v.match(/\d/g)?.length ?? 0) >= 8 && (v.match(/\d/g)?.length ?? 0) <= 15;

/** An Australian number: 10 digits starting 0 (e.g. 0412 345 678), or written +61. */
const isAustralianPhone = (v: string) => /^(0\d{9}|\+?61\d{9})$/.test(v.replace(/[\s()-]/g, ""));

/** ModeSociety Tech signs creators who are 18 or over only (its House rules, 18 Nov 2026); Mode Society takes under-18s with a guardian. */
export const ADULTS_ONLY: Record<Side, boolean> = { talent: false, tech: true };
export const UNDER_18_TECH = "ModeSociety Tech only signs creators who are 18 or over.";

/** Step 1: About you. */
export const aboutProblems = (a: Application, side: Side = "talent", today = new Date()) => {
  const out: string[] = [];
  if (!a.legalName.trim()) out.push("Add your full legal name");
  if (!a.creatorName.trim()) out.push("Add your creator or professional name");
  if (!isEmailAddress(a.email)) out.push("Add a valid email");
  const intl = a.mobile.trim().startsWith("+") && !a.mobile.replace(/\s/g, "").startsWith("+61");
  if (!(intl ? isPhone(a.mobile) : isAustralianPhone(a.mobile))) out.push("Add a mobile number (e.g. 0412 345 678, or +44 7700 900123 outside Australia)");
  const age = ageOn(a.dob, today);
  if (age === null) out.push("Add your date of birth");
  else if (age < 13 || age > 120) out.push("Check your date of birth");
  if (age !== null && age >= 13 && age < 18 && ADULTS_ONLY[side]) out.push(UNDER_18_TECH);
  else if (age !== null && age < 18) {
    if (!a.guardianName.trim()) out.push("Add your parent or guardian's name");
    if (!isEmailAddress(a.guardianEmail)) out.push("Add your parent or guardian's email");
    if (!isPhone(a.guardianPhone)) out.push("Add your parent or guardian's phone");
  }
  return out;
};

/** The countries creators can sign from and the regions blocked within them (admin panel → Applications). */
export type Eligibility = { countries: string[]; blocked: string[] };
export const DEFAULT_ELIGIBILITY: Eligibility = { countries: ELIGIBLE_COUNTRIES, blocked: BLOCKED_REGIONS };

/** Asha's "Unable to sign" message, shown in red under the field for a blocked location. */
export const unableToSign = (name: string) =>
  `Unable to sign: Unfortunately, ${name} can't represent creators based in your location at the moment because of local talent agency laws. We're working on expanding, so follow us on socials for updates.`;

/** Whether the chosen location is one we can't sign from (an unlisted country, or a blocked region). */
export function locationBlocked(a: Application, el: Eligibility): boolean {
  if (a.based === "International") {
    if (a.country === NOT_LISTED) return true;
    if (a.country && !el.countries.includes(a.country)) return true;
  }
  const region = a.region.trim().toLowerCase();
  return Boolean(region) && el.blocked.some((b) => b.trim().toLowerCase() === region);
}

/** The state/region list for a country (Australia, the US), or null for free text. */
export const regionsFor = (country: string) => (country === "Australia" ? AU_STATES : country === "United States" ? US_STATES : null);

/** Step 1b: Where you're based. */
export function basedProblems(a: Application, el: Eligibility): string[] {
  const out: string[] = [];
  if (!a.based) return ["Choose Australia or International"];
  if (locationBlocked(a, el)) return ["We can't sign creators from this location yet"];
  if (a.based === "International" && (!a.country || a.country === "Australia")) out.push("Choose your country of residence");
  const regions = regionsFor(a.based === "Australia" ? "Australia" : a.country);
  if (regions ? !regions.includes(a.region) : !a.region.trim()) out.push("Add your state or region");
  if (a.country === "United Arab Emirates" && !a.uaePermit.trim()) out.push("Add your UAE Advertiser Permit number");
  return out;
}

/** Settings tab keys for a side's lists: eligibility.<side>.countries / .blocked (one per line). */
export const eligibilityKey = (side: Side, list: "countries" | "blocked") => `eligibility.${side}.${list}`;

/** A typed list: one name per line (or comma-separated), tidied, no repeats. */
export const parseList = (raw: string) => [...new Set(raw.split(/[\n,]+/).map((x) => x.trim().replace(/\s+/g, " ")).filter(Boolean))];

/** Each side's saved lists over Asha's starting ones. */
export function readEligibility(settings: Record<string, string>): Record<Side, Eligibility> {
  const one = (side: Side): Eligibility => {
    const countries = parseList(settings[eligibilityKey(side, "countries")] ?? "");
    const blocked = settings[eligibilityKey(side, "blocked")];
    return {
      countries: countries.length ? countries : ELIGIBLE_COUNTRIES,
      blocked: blocked === undefined ? BLOCKED_REGIONS : parseList(blocked),
    };
  };
  return { talent: one("talent"), tech: one("tech") };
}

export const ADDRESS_TYPES: AddressType[] = ["Street address", "PO Box or parcel locker"];

/** Step 1c: postal address for PR packages. State and country come from step 1b. */
export function addressProblems(a: Application): string[] {
  const out: string[] = [];
  if (!a.addressType) out.push("Choose a street address or a PO Box");
  if (!a.address1.trim()) out.push("Add address line 1");
  if (!a.suburb.trim()) out.push("Add your suburb or city");
  const pc = a.postcode.trim();
  const country = a.based === "Australia" ? "Australia" : a.country;
  if (!pc) out.push("Add your postcode");
  else if (country === "Australia" && !/^\d{4}$/.test(pc)) out.push("An Australian postcode has 4 digits");
  else if (country === "United States" && !/^\d{5}(-\d{4})?$/.test(pc)) out.push("A US ZIP code has 5 digits");
  return out;
}

export const MAX_PHOTOS = 6;
/** optional insights screenshots on the socials step (no minimum size: they're screenshots) */
export const MAX_SCREENSHOTS = 6;
export const MIN_PHOTO_SIDE = 1080;
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
export const PHOTO_TOO_SMALL = "This image is too small. Please upload a high-quality photo at least 1080 x 1080 pixels.";

/** Step 2: headshots. 1 to 6 photos; the first is the profile photo, with its round crop saved. */
export function photosProblems(a: Application): string[] {
  if (!a.photos.length) return ["Upload at least one headshot or photo of yourself"];
  if (a.photos.length > MAX_PHOTOS) return [`Keep it to ${MAX_PHOTOS} photos`];
  if (!a.profileThumb) return ["Save the crop of your profile photo"];
  return [];
}

/** The web addresses each platform's links live on (Other: any link). */
const PLATFORM_HOSTS: Record<string, RegExp> = {
  instagram: /(^|\.)instagram\.com$/,
  tiktok: /(^|\.)tiktok\.com$/,
  youtube: /(^|\.)(youtube\.com|youtu\.be)$/,
  "youtube gaming": /(^|\.)(youtube\.com|youtu\.be)$/,
  pinterest: /(^|\.)pinterest\.[a-z.]+$/,
  facebook: /(^|\.)(facebook\.com|fb\.com|fb\.gg)$/,
  "facebook gaming": /(^|\.)(facebook\.com|fb\.com|fb\.gg)$/,
  linkedin: /(^|\.)linkedin\.com$/,
  snapchat: /(^|\.)snapchat\.com$/,
  "x (twitter)": /(^|\.)(x\.com|twitter\.com)$/,
  lemon8: /(^|\.)lemon8-app\.com$/,
  twitch: /(^|\.)twitch\.tv$/,
  kick: /(^|\.)kick\.com$/,
  discord: /(^|\.)(discord\.gg|discord\.com)$/,
};

/**
 * A channel as a link: what the creator typed (a link, a link without https://, or a @handle) as the
 * profile address, or null when it isn't one for that platform.
 */
export function channelLink(platform: string, typed: string): string | null {
  const t = typed.trim().replace(/\s+/g, "");
  if (!t) return null;
  const hosts = PLATFORM_HOSTS[platform.toLowerCase()];
  const asUrl = /^https?:\/\//i.test(t) ? t : /^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/|$)/i.test(t) ? `https://${t}` : null;
  if (asUrl) {
    try {
      const u = new URL(asUrl);
      if (!/^https?:$/.test(u.protocol)) return null;
      return !hosts || hosts.test(u.hostname.toLowerCase()) ? u.href : null;
    } catch {
      return null;
    }
  }
  // a handle: the profile address for the platforms that have one
  const handle = t.replace(/^@+/, "");
  if (!/^[\w.-]{1,80}$/.test(handle)) return null;
  const make: Record<string, (h: string) => string> = {
    instagram: (h) => `https://www.instagram.com/${h}/`,
    tiktok: (h) => `https://www.tiktok.com/@${h}`,
    youtube: (h) => `https://www.youtube.com/@${h}`,
    "youtube gaming": (h) => `https://www.youtube.com/@${h}`,
    pinterest: (h) => `https://www.pinterest.com/${h}/`,
    facebook: (h) => `https://www.facebook.com/${h}`,
    "facebook gaming": (h) => `https://www.facebook.com/${h}`,
    linkedin: (h) => `https://www.linkedin.com/in/${h}`,
    snapchat: (h) => `https://www.snapchat.com/add/${h}`,
    "x (twitter)": (h) => `https://x.com/${h}`,
    lemon8: (h) => `https://www.lemon8-app.com/@${h}`,
    twitch: (h) => `https://www.twitch.tv/${h}`,
    kick: (h) => `https://kick.com/${h}`,
  };
  const f = make[platform.toLowerCase()];
  return f ? f(handle) : null;
}

/** A follower or view count typed with or without commas ("12,400"): the whole number, or null. */
export const countOf = (v: string) => (/^\d{1,3}(,?\d{3})*$|^\d+$/.test(v.trim()) ? Number(v.trim().replace(/,/g, "")) : null);

export const MEDIA_KIT_MAX_MB = 3;

/** Step 3: your socials. */
export function socialsProblems(a: Application, side: Side): string[] {
  const out: string[] = [];
  const platforms = APP_OPTIONS[side].platforms;
  if (!platforms.includes(a.mainPlatform)) out.push("Choose your main platform");
  else if (!channelLink(a.mainPlatform, a.mainLink)) out.push(`Add a valid ${a.mainPlatform} link or @handle for your main channel`);
  if (countOf(a.mainFollowers) === null) out.push("Add your main channel's follower count (a whole number)");
  if (a.avgViews.trim() && countOf(a.avgViews) === null) out.push(`${APP_OPTIONS[side].avgLabel}: a whole number`);
  a.others.forEach((c, n) => {
    if (!platforms.includes(c.platform) || !channelLink(c.platform, c.link) || countOf(c.followers) === null) {
      out.push(`Other platform ${n + 1}: choose the platform, add its link and follower count (or remove it)`);
    }
  });
  if (a.mediaKit && !/^[\w-]{10,}$/.test(a.mediaKit) && !/^https?:\/\/\S+\.\S+/.test(a.mediaKit.trim())) out.push("Media kit: upload a PDF or paste a link");
  return out;
}

/** Step 4: your content. */
/**
 * ModeSociety Tech's House rules: every partnership is checked against who the creator's audience is,
 * so Tech creators say what share of their audience is 18+ (from their platform analytics).
 */
export const ADULT_SHARES = ["90% or more", "75–89%", "50–74%", "Under 50%", "I don't know yet"] as const;

export function contentProblems(a: Application, side: Side): string[] {
  const o = APP_OPTIONS[side];
  const out: string[] = [];
  if (!a.niches.some((n) => o.niches.includes(n))) out.push("Choose at least one niche");
  if (!a.work.some((w) => o.work.includes(w))) out.push("Choose at least one kind of work you're open to");
  if (side === "tech" && !(ADULT_SHARES as readonly string[]).includes(a.adultShare)) out.push("Tell us what share of your audience is 18+");
  if (!a.represented) out.push("Tell us if you're represented by an agency or manager");
  else if (a.represented === "Yes" && !a.agency.trim()) out.push("Add the agency's or manager's name");
  return out;
}

export const REFERRALS = ["Referred by a creator", "Referred by a brand"];

/** Step 5: how they found us. */
export function discoveryProblems(a: Application, side: Side): string[] {
  if (!APP_OPTIONS[side].discovery.includes(a.discovery)) return [`Tell us how you discovered ${APP_OPTIONS[side].name}`];
  if (REFERRALS.includes(a.discovery) && !a.referrer.trim()) return ["Tell us who referred you"];
  if (a.discovery === "Other" && !a.discoveryOther.trim()) return ["Tell us where you heard about us"];
  return [];
}

/** Asha's "How do you want to be represented?" explanation (the (i) pop-up), for each site. */
export function representationInfo(side: Side) {
  const tech = side === "tech";
  const name = tech ? "Mode Society Tech" : "Mode Society";
  const domain = tech ? "modesocietytech.com" : "modesociety.com.au";
  return [
    {
      heading: "Exclusive representation (20% commission)",
      intro: `${name} becomes your one and only agency. We manage all of your brand deals and your whole creator career, and we invest more in you.`,
      points: [
        "We take 20% of your earnings from brand deals and paid work. You keep 80%.",
        "All brand enquiries come through us, including DMs.",
        `You get your own dedicated ${name} email ([name]@${domain}) to display in your bios.`,
        "Free strategy support, growth guidance and priority pitching to our brand partners.",
        "12-month minimum term. It renews automatically each year unless you opt out in the 14 days before your anniversary (we'll remind you beforehand).",
      ],
    },
    {
      heading: "Non-exclusive representation (30% commission)",
      intro: `Work with ${name} alongside other agencies or your own deals. You stay flexible, and we bring you opportunities when they're a good fit.`,
      points: [
        `We take 30% of earnings from deals that come through ${name}. Deals you find yourself are yours.`,
        `You display pr@${domain} in your bios.`,
        "Cancel any time.",
        "Strategy calls and support are available at our standard rates.",
      ],
    },
    {
      heading: "Both options",
      intro: "",
      points: [
        "We can't guarantee work or income, but we'll pitch you to brands that suit your content.",
        `${name} can use content you've created up until your representation ends, permanently, to promote you and our agency.`,
      ],
    },
  ];
}

/** Step 6: representation. */
export const representationProblems = (a: Application) => (REPRESENTATIONS.includes(a.representation as Representation) ? [] : ["Choose exclusive or non-exclusive representation"]);

/** Step 7: the five agreements are all required (the email tips are optional). */
export const agreementsProblems = (a: Application, side: Side) =>
  APP_OPTIONS[side].agreements.every((t) => a.agreements.includes(t)) ? [] : ["Tick all five agreements to send your application"];

// ---------------------------------------------------------------------------
// Checking a whole application (the server), tags and the Sheet row
// ---------------------------------------------------------------------------

/** Every step's problems at once: what the server checks before saving an application. */
export function allProblems(a: Application, side: Side, el: Eligibility): string[] {
  return [
    ...aboutProblems(a, side),
    ...basedProblems(a, el),
    ...addressProblems(a),
    ...photosProblems(a),
    ...socialsProblems(a, side),
    ...contentProblems(a, side),
    ...discoveryProblems(a, side),
    ...representationProblems(a),
    ...agreementsProblems(a, side),
  ];
}

/**
 * The lead's admin tags (Asha's spec): NSW creators need the Information for Performers sheet before
 * a contract, QLD creators are paid within 7 days, and anyone outside Australia is International.
 */
export function tagsFor(a: Application): string[] {
  const tags: string[] = [];
  if (a.adultShare === "Under 50%" || a.adultShare === "50–74%") tags.push("Audience under 75% adults: check each partnership's audience");
  if (a.based === "Australia" && a.region === "New South Wales") tags.push("NSW: send Information for Performers sheet before contract");
  if (a.based === "Australia" && a.region === "Queensland") tags.push("QLD: pay within 7 days");
  if (a.based === "International") tags.push("International");
  return tags;
}

/** The consent record saved with each application: when, from where, and which terms. */
export type Consent = { at: string; ip: string; terms: string };

/**
 * The Sheet row for an application: [column, value] pairs in column order. The backend adds any column
 * missing from the tab, so older rows keep their own columns. Files are added by the backend (Drive links).
 */
export function applicationColumns(a: Application, side: Side, consent: Consent): [string, string][] {
  const fmt = (n: string) => (countOf(n) ?? "").toString();
  const address = [a.addressType, a.address1, a.address2, a.suburb, a.region, a.postcode, a.based === "Australia" ? "Australia" : a.country]
    .map((x) => x.trim())
    .filter(Boolean)
    .join("\n");
  const others = a.others.map((c) => `${c.platform}: ${channelLink(c.platform, c.link) ?? c.link} · ${fmt(c.followers)}`).join("\n");
  const age = ageOn(a.dob);
  return [
    ["Full Name", a.legalName.trim()],
    ["Creator Name", a.creatorName.trim()],
    ["Email", a.email.trim().toLowerCase()],
    ["Mobile", a.mobile.trim()],
    ["Date of Birth", a.dob],
    ["Guardian", age !== null && age < 18 ? `${a.guardianName.trim()} · ${a.guardianEmail.trim()} · ${a.guardianPhone.trim()}` : ""],
    ["Based", a.based],
    ["Country", a.based === "Australia" ? "Australia" : a.country],
    ["State / Region", a.region.trim()],
    ["UAE Permit", a.uaePermit.trim()],
    ["Postal Address", address],
    ["Main Platform", a.mainPlatform],
    ["Main Channel", channelLink(a.mainPlatform, a.mainLink) ?? a.mainLink.trim()],
    ["Main Followers", fmt(a.mainFollowers)],
    [APP_OPTIONS[side].avgLabel, fmt(a.avgViews)],
    ["Other Platforms", others],
    ["Niche", a.niches.join(", ")],
    ["Work Open To", a.work.join(", ")],
    ["Games", side === "tech" ? a.games.trim() : ""],
    ["Setup", side === "tech" ? a.setup.join(", ") : ""],
    ["Audience Top Country", a.audienceCountry],
    ["Audience 18+", a.adultShare],
    ["Past Collaborations", a.collaborations.trim()],
    ["Agency", a.represented === "Yes" ? `Yes: ${a.agency.trim()}` : "No"],
    ["Discovery", [a.discovery, a.referrer.trim(), a.discoveryOther.trim()].filter(Boolean).join(": ")],
    ["Representation", a.representation],
    ["Agreements", `All ${a.agreements.length} ticked`],
    ["Email Tips", a.tips ? "Yes" : "No"],
    ["Consent Record", `${consent.at} · IP ${consent.ip || "unknown"} · terms ${consent.terms}`],
    ["Tags", tagsFor(a).join("\n")],
  ];
}

/** Each site's Creator Growth Guide (Asha's PDFs, in public/guides). */
export const GROWTH_GUIDE: Record<Side, string> = {
  talent: "/guides/mode-society-creator-growth-guide.pdf",
  tech: "/guides/mode-society-tech-creator-growth-guide.pdf",
};

/** The first name for "Thanks, [first name]!": the first word of the legal name. */
export const firstNameOf = (a: Pick<Application, "legalName" | "creatorName">) => (a.legalName.trim().split(/\s+/)[0] || a.creatorName.trim() || "there");

/** Asha's thank-you message (the screen after submitting, and the auto-reply email). */
export const thankYouMessage = (first: string) =>
  `Thanks, ${first}! Your application is in. Our team reviews every application and will be in touch if it's a fit. In the meantime, download our free Creator Growth Guide below.`;

/** The auto-reply to the applicant (Asha's spec): one email with the same message and the guide's link. */
export function autoReply(side: Side, a: Application, guideUrl: string) {
  const name = APP_OPTIONS[side].name;
  const first = firstNameOf(a);
  const message = thankYouMessage(first);
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return {
    subject: `We've received your ${name} application`,
    text: `${message}\n\nCreator Growth Guide: ${guideUrl}\n\nThe ${name} Team`,
    html:
      `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:560px">` +
      `<p>${esc(message)}</p>` +
      `<p><a href="${esc(guideUrl)}" style="display:inline-block;padding:10px 18px;background:#1a1a1a;color:#fff;text-decoration:none">Download the Creator Growth Guide</a></p>` +
      `<p>The ${esc(name)} Team</p></div>`,
    fromName: name,
  };
}
