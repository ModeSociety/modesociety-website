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
  // Step 4: content
  niches: string[];
  work: string[];
  games: string; // Tech
  setup: string[]; // Tech
  audienceCountry: string;
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
  mainPlatform: "", mainLink: "", mainFollowers: "", avgViews: "", others: [], mediaKit: "",
  niches: [], work: [], games: "", setup: [], audienceCountry: "", collaborations: "", represented: "", agency: "",
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

const agreements = (name: string) => [
  `I consent to ${name} using the images and content I have uploaded, as set out in the Application Terms.`,
  "I have read and agree to the Application Terms and Privacy Collection Notice.",
  "I confirm the information I have provided is true and accurate.",
  "I am 18 or older, or my parent/guardian has consented to this application.",
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
    agreements: agreements("Mode Society Tech"),
    tipsLabel: "Send me Mode Society Tech creator tips and opportunities by email.",
  },
};

/** The version of the Application Terms a creator accepts (saved with the consent record). */
export const TERMS_VERSION = "2026-11-16";

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

/** Step 1: About you. */
export const aboutProblems = (a: Application, today = new Date()) => {
  const out: string[] = [];
  if (!a.legalName.trim()) out.push("Add your full legal name");
  if (!a.creatorName.trim()) out.push("Add your creator or professional name");
  if (!isEmailAddress(a.email)) out.push("Add a valid email");
  const intl = a.mobile.trim().startsWith("+") && !a.mobile.replace(/\s/g, "").startsWith("+61");
  if (!(intl ? isPhone(a.mobile) : isAustralianPhone(a.mobile))) out.push("Add a mobile number (e.g. 0412 345 678, or +44 7700 900123 outside Australia)");
  const age = ageOn(a.dob, today);
  if (age === null) out.push("Add your date of birth");
  else if (age < 13 || age > 120) out.push("Check your date of birth");
  if (age !== null && age < 18) {
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
