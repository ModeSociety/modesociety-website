/** Options for the three forms (Canva "forms" slide). */

// Talent
export const ROLES = ["Model", "Influencer", "UGC creator", "Streamer", "Other"] as const;
export const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitch"] as const;
export const NICHES = ["Fashion", "Beauty", "Lifestyle", "Fitness", "Gaming"] as const;
export const SIGNED = ["No", "Yes"] as const;

// Book a call
export const SERVICES = ["Influencer campaigns", "UGC content", "Event guest lists", "Funding"] as const;
/** TODO (Mode Society): set the final budget ranges. */
export const BUDGETS = ["Under $5k", "$5k – $15k", "$15k – $50k", "$50k – $100k", "$100k+", "Not sure yet"] as const;
/** TODO (Mode Society): set the final timeline options. */
export const TIMELINES = ["As soon as possible", "Within a month", "1–3 months", "3–6 months", "Just exploring"] as const;

// Brand partnerships
export const PARTNERSHIPS = ["Referral / affiliate program", "Co-marketing", "Cross-promotion", "Events", "Other"] as const;

export const SUCCESS_MESSAGE = "Thanks! We'll be in touch.";
