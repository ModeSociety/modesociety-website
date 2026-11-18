/**
 * A signed creator's payment details (SP-122), read from their signed contract in PandaDoc when an
 * admin opens the profile. They are never saved in the Sheet or Drive, never emailed and never
 * exported: the profile shows them masked, and Reveal (logged) shows them in full for that view only.
 */
import { PART_A, PART_B } from "./contract";

export type PandaDocField = { merge_field?: string; value?: unknown };

/** "123456" → "***-*56", "12345678" → "****5678", a PayPal email → "j***@gmail.com". */
export function mask(id: string, value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (id === "bsb") {
    const d = v.replace(/\D/g, "");
    return d.length >= 2 ? `***-*${d.slice(-2)}` : "***";
  }
  if (id === "paypalEmail") {
    const [user, domain] = v.split("@");
    return domain ? `${user.slice(0, 1)}***@${domain}` : "***";
  }
  const tail = v.replace(/\s/g, "").slice(-4);
  return `****${tail}`;
}

/** the fields that are masked; the rest (names, ABN, GST, method) show as they are */
const SECRET = new Set(["bsb", "accountNumber", "paypalEmail", "swift", "iban", "aba", "sortCode", "jpCodes"]);

export type PaymentView = {
  part: "A" | "B" | null;
  method: string;
  /** "12 345 678 901", "Statement by a supplier", or "" */
  abn: string;
  gst: string;
  /** label, value (masked unless revealed) */
  rows: [string, string][];
  /** reminders for the person paying them */
  notes: string[];
};

const text = (v: unknown) => (typeof v === "string" ? v : typeof v === "boolean" ? (v ? "Yes" : "") : v == null ? "" : String(v));

/** The contract's payment fields as the profile shows them. region: the creator's state, for the QLD reminder. */
export function paymentView(fields: PandaDocField[], region: string, reveal = false): PaymentView {
  const by = new Map(fields.filter((f) => f.merge_field).map((f) => [f.merge_field!, text(f.value)]));
  const part = by.has("accountName") ? "A" : by.has("taxCountry") ? "B" : null;
  const list = part === "A" ? PART_A : part === "B" ? PART_B : [];
  const noAbn = by.get("noAbn") === "Yes" || by.get("noAbn") === "true";
  const abn = by.get("abn")?.trim() || (noAbn ? "Statement by a supplier" : "");
  const notes: string[] = [];
  if (part === "A" && !by.get("abn")?.trim()) notes.push("No ABN on file: 47% must be withheld unless they give an ATO \"Statement by a supplier\".");
  if (/^(QLD|Queensland)$/i.test(region.trim())) notes.push("Queensland: pay within 7 days of cleared funds.");
  return {
    part,
    method: part === "A" ? "Australia: bank transfer" : part === "B" ? `International: ${by.get("payMethod") || "not chosen"}` : "",
    abn,
    gst: by.get("gst") ?? "",
    rows: list
      .filter((f) => f.kind !== "checkbox" && !["abn", "gst", "payMethod"].includes(f.id))
      .map((f) => [f.label, by.get(f.id) ?? ""] as [string, string])
      .filter(([, v]) => v.trim())
      .map(([label, v]) => {
        const id = list.find((f) => f.label === label)!.id;
        return [label, reveal || !SECRET.has(id) ? v : mask(id, v)];
      }),
    notes,
  };
}
