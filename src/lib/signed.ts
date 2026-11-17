/**
 * Signed Talent: the creators who signed with Mode Society or ModeSociety Tech. The Sheet's Signed
 * Talent tab holds only the application's Reference and the contract; the rest is the application
 * row, joined here by Reference (Asha's brief, 16 Nov 2026: no copied data, no complex queries).
 */
import { toEnquiries, type Enquiry, type SheetTable } from "./enquiries";
import type { Side } from "./side";

export type Contract = {
  reference: string;
  side: Side;
  /** "Exclusive", "Non-exclusive", or "" for an older creator not yet filled in */
  type: string;
  commission: string;
  /** ISO date-time */
  signedAt: string;
  pandadocId: string;
  contractLink: string;
  modeEmailInBio: boolean;
  dedicatedEmail: string;
  updatedAt: string;
  updatedBy: string;
};

export type SignedCreator = { contract: Contract; application: Enquiry | null };

export const CONTRACT_TYPES = ["Exclusive", "Non-exclusive"] as const;
/** each contract's commission (Asha's agreements) */
export const COMMISSION: Record<string, string> = { Exclusive: "20%", "Non-exclusive": "30%" };
/** the exclusive agreement's opt-out window: the 14 days before each renewal */
export const OPT_OUT_DAYS = 14;

export function toContracts(table: SheetTable | undefined): Contract[] {
  if (!table) return [];
  const at = (row: string[], name: string) => {
    const i = table.headers.indexOf(name);
    return i < 0 ? "" : String(row[i] ?? "").trim();
  };
  return table.rows
    .filter((row) => at(row, "Reference"))
    .map((row) => ({
      reference: at(row, "Reference"),
      side: at(row, "Side") === "tech" ? "tech" : "talent",
      type: at(row, "Contract"),
      commission: at(row, "Commission"),
      signedAt: at(row, "Signed At"),
      pandadocId: at(row, "PandaDoc ID"),
      contractLink: at(row, "Contract Link"),
      modeEmailInBio: /^(yes|true)$/i.test(at(row, "Mode Email In Bio")),
      dedicatedEmail: at(row, "Dedicated Email"),
      updatedAt: at(row, "Updated At"),
      updatedBy: at(row, "Updated By"),
    }));
}

/** One side's signed creators, newest signing first, each with their application (null if its row is gone). */
export function signedCreators(side: Side, signed: SheetTable | undefined, applications: SheetTable | undefined): SignedCreator[] {
  const apps = new Map(toEnquiries(side === "tech" ? "techCreators" : "talent", applications).map((e) => [e.reference, e]));
  return toContracts(signed)
    .filter((c) => c.side === side)
    .sort((a, b) => b.signedAt.localeCompare(a.signedAt))
    .map((contract) => ({ contract, application: apps.get(contract.reference) ?? null }));
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);
/** the businesses' time zone: a signing at 9 am in Melbourne is that day, not the day before in UTC */
export const TZ = "Australia/Melbourne";
/** A moment's calendar date in Melbourne, as YYYY-MM-DD ("" for an unreadable date). */
export function localDate(at: Date | string): string {
  const d = typeof at === "string" ? new Date(at) : at;
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-CA", { timeZone: TZ });
}

/**
 * An exclusive contract's next renewal (YYYY-MM-DD): the signed date plus 12 months, then every 12
 * months, the first on or after today (Melbourne dates). Non-exclusive contracts don't renew, so null.
 */
export function nextRenewal(c: Pick<Contract, "type" | "signedAt">, today = new Date()): string | null {
  if (c.type !== "Exclusive") return null;
  const signed = localDate(c.signedAt);
  if (!signed) return null;
  const [y, m, d] = signed.split("-").map(Number);
  const now = localDate(today);
  for (let n = 1; n < 100; n++) {
    // 29 Feb signings renew on 28 Feb in other years
    const at = ymd(new Date(Date.UTC(y + n, m - 1, Math.min(d, new Date(Date.UTC(y + n, m, 0)).getUTCDate()))));
    if (at >= now) return at;
  }
  return null;
}

/** The opt-out window before a renewal: [first day, last day], as YYYY-MM-DD. */
export function optOutWindow(renewal: string): [string, string] {
  const r = new Date(`${renewal}T00:00:00Z`);
  const from = new Date(r.getTime() - OPT_OUT_DAYS * 86_400_000);
  const to = new Date(r.getTime() - 86_400_000);
  return [ymd(from), ymd(to)];
}
