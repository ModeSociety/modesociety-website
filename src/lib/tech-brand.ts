/**
 * ModeSociety Tech's brand enquiry (Asha's pack: Mode_Society_Tech_Brand_Enquiry_Form). The browser
 * and the server use the same rules (brandProblems, campaignProblems), so they never disagree.
 */
import { isEmailAddress, isPhone } from "./application";

export const TB_INDUSTRIES = [
  "Game publisher / studio", "Esports organisation", "PC hardware & peripherals", "Consumer tech & electronics",
  "Telco / mobile / internet provider", "Streaming / software platform", "Energy drinks / FMCG", "Gaming retail",
  "Agency (on behalf of a brand)", "Other",
];
export const TB_MARKETS = ["Australia", "New Zealand", "APAC", "Global", "Other"];
export const TB_GOALS = [
  "Game launch / wishlists", "Downloads / installs", "Product awareness", "Sales / sign-ups", "Event or tournament promotion",
  "Plan or device launch (telco)", "Community growth (Discord / socials)", "Long-term brand ambassadors",
];
export const TB_TYPES = [
  "Sponsored streams", "Sponsored YouTube videos", "Short-form (TikTok / Shorts / Reels)", "Game key drops", "Product reviews & unboxings",
  "Event / LAN activation", "Esports sponsorship", "UGC ad creative", "Ambassador program", "Not sure yet",
];
export const TB_PLATFORMS = ["Twitch", "YouTube", "TikTok", "Kick", "Instagram", "X", "Discord"];
export const TB_CREATORS = ["Streamers", "Gaming YouTubers", "Short-form gaming creators", "Esports pros", "Tech reviewers", "Cosplayers", "Mobile / telco creators"];
export const TB_BUDGETS = ["Under $2,500", "$2,500–$5,000", "$5,000–$10,000", "$10,000–$25,000", "$25,000–$50,000", "$50,000+", "Not sure yet"];
export const TB_HEARD = ["LinkedIn", "Instagram", "TikTok", "Google search", "Referral", "Event", "Other"];

export const TB_INTRO =
  "Reach gamers, streamers and tech audiences through creators they actually trust. Tell us about your campaign and our team will come back to you within 2 business days.";
export const TB_CONSENT = "I agree to Mode Society Tech collecting and using my details to respond to this enquiry, in line with the Privacy Policy.";
export const tbThanks = (first: string) => `Thanks, ${first}. Your enquiry is with our partnerships team. We'll be in touch within 2 business days.`;
/**
 * The brief or deck: PDF, PPTX or DOCX. Asha's spec allows 25 MB, but uploads pass through the website
 * (Vercel takes 4.5 MB a request), so a file up to 3 MB is uploaded and a bigger one is shared as a link.
 */
export const TB_BRIEF_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export type TechBrand = {
  company: string; contact: string; role: string; email: string; phone: string; website: string; industry: string; market: string;
  goals: string[]; types: string[]; platforms: string[]; creators: string[]; audience: string; budget: string; start: string;
  details: string; brief: string; heard: string; heardOther: string; consent: boolean;
};

export const blankTechBrand = (): TechBrand => ({
  company: "", contact: "", role: "", email: "", phone: "", website: "", industry: "", market: "",
  goals: [], types: [], platforms: [], creators: [], audience: "", budget: "", start: "", details: "", brief: "", heard: "", heardOther: "", consent: false,
});

const isWebsite = (v: string) => /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(v.trim());

/** Level 1: about your brand. */
export function brandProblems(b: TechBrand): string[] {
  const out: string[] = [];
  if (!b.company.trim()) out.push("Add the company or brand name");
  if (!b.contact.trim()) out.push("Add your name");
  if (!b.role.trim()) out.push("Add your role or title");
  if (!isEmailAddress(b.email)) out.push("Add a valid work email");
  if (b.phone.trim() && !isPhone(b.phone)) out.push("Check the phone number");
  if (!isWebsite(b.website)) out.push("Add the brand's website");
  if (!TB_INDUSTRIES.includes(b.industry)) out.push("Choose your industry");
  if (!TB_MARKETS.includes(b.market)) out.push("Choose your country or market");
  return out;
}

/** Level 2: about your campaign. */
export function campaignProblems(b: TechBrand, today = new Date()): string[] {
  const out: string[] = [];
  if (!b.goals.length) out.push("Choose at least one campaign goal");
  if (!b.types.length) out.push("Choose at least one campaign type");
  if (!b.platforms.length) out.push("Choose at least one platform");
  if (!TB_BUDGETS.includes(b.budget)) out.push("Choose a budget");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.start) || b.start < today.toISOString().slice(0, 10)) out.push("Choose an ideal start or launch date (today or later)");
  if (!TB_HEARD.includes(b.heard)) out.push("Tell us how you heard about us");
  else if (b.heard === "Other" && !b.heardOther.trim()) out.push("Tell us where you heard about us");
  if (b.brief && !/^[\w-]{10,}$/.test(b.brief) && !/^https?:\/\/\S+\.\S+/.test(b.brief.trim())) out.push("Brief: upload a file or paste a link");
  if (!b.consent) out.push("Tick the privacy consent");
  return out;
}

/** The Sheet row: [column, value] pairs; Asha's list columns come first. */
export function techBrandColumns(b: TechBrand): [string, string][] {
  return [
    ["Company", b.company.trim()],
    ["Contact Name", b.contact.trim()],
    ["Industry", b.industry],
    ["Budget", b.budget],
    ["Start Date", b.start],
    ["Platforms", b.platforms.join(", ")],
    ["Role", b.role.trim()],
    ["Email", b.email.trim().toLowerCase()],
    ["Phone", b.phone.trim()],
    ["Website", b.website.trim()],
    ["Market", b.market],
    ["Campaign Goals", b.goals.join(", ")],
    ["Campaign Types", b.types.join(", ")],
    ["Creator Types", b.creators.join(", ")],
    ["Target Audience", b.audience.trim()],
    ["Campaign Details", b.details.trim()],
    ["Heard About Us", b.heard === "Other" ? `Other: ${b.heardOther.trim()}` : b.heard],
    ["Privacy Consent", b.consent ? "Yes" : "No"],
  ];
}
