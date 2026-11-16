import type { Side } from "./side";

/**
 * Where each side's form emails go, and the address applicants reply to. Stored in the Sheet's
 * Settings tab as email.<side>.<role>; keep the defaults in step with NOTIFY_DEFAULTS in Code.gs.
 */
export type EmailRole = "creators" | "brands" | "replyTo";
export type EmailSettings = Record<Side, Record<EmailRole, string>>;

export const EMAIL_DEFAULTS: EmailSettings = {
  talent: { creators: "pr@modesociety.com.au", brands: "brands@modesociety.com.au", replyTo: "pr@modesociety.com.au" },
  tech: {
    creators: "techadmin@modesociety.com.au, patrick@modesociety.com.au",
    brands: "techadmin@modesociety.com.au, patrick@modesociety.com.au",
    replyTo: "techadmin@modesociety.com.au",
  },
};

export const EMAIL_FIELDS: { role: EmailRole; label: string; hint: string; many: boolean }[] = [
  { role: "creators", label: "Creator applications", hint: "Each new creator application is emailed here.", many: true },
  { role: "brands", label: "Brand leads", hint: "Each new brand enquiry or call booking is emailed here.", many: true },
  { role: "replyTo", label: "Applicants reply to", hint: "The reply-to address on emails sent to applicants (auto-replies, welcome emails).", many: false },
];

/** Mode Society's shared inboxes: Tech mail never goes to them (the businesses are separate). */
export const MODE_SOCIETY_INBOXES = ["pr@modesociety.com.au", "brands@modesociety.com.au"];

export const settingKey = (side: Side, role: EmailRole) => `email.${side}.${role}`;

const EMAIL = /^[^@\s,]+@[^@\s,]+\.[^@\s,]+$/;

/** A typed list ("a@x.com, b@y.com") checked and tidied, or the reason it can't be used. */
export function cleanEmails(side: Side, role: EmailRole, raw: string): { value: string } | { error: string } {
  const list = raw
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const label = EMAIL_FIELDS.find((f) => f.role === role)!.label;
  if (!list.length) return { error: `${label}: add at least one address` };
  if (list.length > (role === "replyTo" ? 1 : 6)) return { error: `${label}: ${role === "replyTo" ? "one address only" : "six addresses at most"}` };
  const bad = list.find((e) => !EMAIL.test(e));
  if (bad) return { error: `${label}: "${bad}" isn't an email address` };
  if (side === "tech" && list.some((e) => MODE_SOCIETY_INBOXES.includes(e))) {
    return { error: `${label}: ModeSociety Tech mail can't go to a Mode Society inbox (pr@ or brands@)` };
  }
  return { value: [...new Set(list)].join(", ") };
}

/** The saved settings over the defaults. */
export function readEmails(settings: Record<string, string>): EmailSettings {
  const out = structuredClone(EMAIL_DEFAULTS);
  for (const side of ["talent", "tech"] as Side[]) {
    for (const f of EMAIL_FIELDS) {
      const v = settings[settingKey(side, f.role)]?.trim();
      if (v) out[side][f.role] = v;
    }
  }
  return out;
}
