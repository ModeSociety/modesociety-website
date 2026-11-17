/**
 * The creator contracts (Asha's four agreements, 16 Nov 2026): which contract a lead gets, and the
 * PandaDoc fields in it. The contract templates (Google Docs in Drive → Contracts, made by
 * scripts/build-contract-templates.py) carry a field tag for each field below, e.g.
 * {t:Talent:legalName___}; every optId in the PDF must be declared when the document is created, so
 * this list and the script must name the same fields. The creator is the only signer: Asha's
 * signature is already on the template (the contract's own clause 17).
 */
import type { Side } from "./side";

/** the signer's role in the templates' field tags (no underscores allowed in a role) */
export const CONTRACT_ROLE = "Talent";
export const CONTRACT_TYPES = ["Exclusive", "Non-exclusive"] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];
/** Schedule 2 keeps one part: A for creators based in Australia, B for everyone else */
export type PaymentPart = "A" | "B";

export type ContractField = { id: string; label: string; required: boolean; kind?: "text" | "dropdown" | "checkbox"; options?: string[] };

/** Schedule 1: the creator's details, pre-filled from the application (they can correct them). */
export const SCHEDULE_1: ContractField[] = [
  { id: "legalName", label: "Full legal name", required: true },
  { id: "creatorName", label: "Professional / creator name", required: true },
  { id: "dob", label: "Date of birth", required: true },
  { id: "mobile", label: "Mobile", required: true },
  { id: "email", label: "Personal email", required: true },
  { id: "country", label: "Country of residence", required: true },
  { id: "region", label: "State / region", required: true },
  { id: "postal", label: "Postal address for PR packages", required: true },
  { id: "mainChannel", label: "Main platform & link", required: true },
  { id: "otherChannels", label: "Other platforms & links", required: false },
  { id: "emergency", label: "Emergency contact (name, relationship, phone)", required: true },
  { id: "guardian", label: "Parent / guardian (if under 18)", required: false },
];

/** The Talent's signature block (the signature and date fields have no optId). */
export const SIGN_FIELDS: ContractField[] = [{ id: "signName", label: "Name", required: true }];

/** Schedule 2, Part A: domestic talent (Australia). */
export const PART_A: ContractField[] = [
  { id: "accountName", label: "Account name", required: true },
  { id: "bankName", label: "Bank name", required: true },
  { id: "bsb", label: "BSB", required: true },
  { id: "accountNumber", label: "Account number", required: true },
  { id: "abn", label: "ABN", required: false },
  { id: "noAbn", label: "No ABN (statement by a supplier)", required: false, kind: "checkbox" },
  { id: "tradingName", label: "Business / trading name", required: false },
  { id: "gst", label: "Registered for GST?", required: true, kind: "dropdown", options: ["Yes", "No"] },
  { id: "billingAddress", label: "Billing address (if different)", required: false },
];

/** Schedule 2, Part B: international talent. PayPal or bank fields depend on the method, so they're optional. */
export const PART_B: ContractField[] = [
  { id: "taxCountry", label: "Country of tax residence", required: true },
  { id: "taxId", label: "Tax ID number", required: false },
  { id: "uaePermit", label: "UAE Advertiser Permit number", required: false },
  { id: "payMethod", label: "Payment method", required: true, kind: "dropdown", options: ["PayPal", "International bank transfer (SWIFT)"] },
  { id: "paypalEmail", label: "PayPal account email", required: false },
  { id: "paypalName", label: "Name on PayPal account", required: false },
  { id: "holderName", label: "Account holder name", required: false },
  { id: "holderAddress", label: "Account holder address", required: false },
  { id: "intlBankName", label: "Bank name", required: false },
  { id: "bankAddress", label: "Bank address", required: false },
  { id: "swift", label: "SWIFT / BIC code", required: false },
  { id: "iban", label: "IBAN or account number", required: false },
  { id: "aba", label: "US: ABA routing number", required: false },
  { id: "sortCode", label: "UK: sort code", required: false },
  { id: "jpCodes", label: "Japan: bank code and branch code", required: false },
  { id: "currency", label: "Account currency", required: false },
];

/** The Google Doc template's name in Drive → Contracts, e.g. "Mode Society Tech Exclusive Talent Agreement". */
export const templateName = (side: Side, type: ContractType) =>
  `${side === "tech" ? "Mode Society Tech" : "Mode Society"} ${type === "Exclusive" ? "Exclusive" : "Non-Exclusive"} Talent Agreement`;

/** "Exclusive (20% commission)" → "Exclusive"; anything else → "" (the admin chooses). */
export const contractTypeOf = (representation: string): ContractType | "" =>
  representation.startsWith("Exclusive") ? "Exclusive" : representation.startsWith("Non-exclusive") ? "Non-exclusive" : "";

/** Part A when the creator is based in Australia (the application's "Based" answer, or the country). */
export const paymentPart = (based: string, country: string): PaymentPart => (based === "Australia" || (!based && country === "Australia") ? "A" : "B");

/**
 * The fields object for PandaDoc's create call: every optId the PDF holds (Schedule 1, the signature
 * block and the one payment part), Schedule 1 pre-filled from the application.
 */
export function contractFields(part: PaymentPart, prefill: Partial<Record<string, string>>) {
  const all = [...SCHEDULE_1, ...SIGN_FIELDS, ...(part === "A" ? PART_A : PART_B)];
  return Object.fromEntries(
    all.map((f) => [
      f.id,
      f.kind === "checkbox"
        ? { value: false, role: CONTRACT_ROLE }
        : f.kind === "dropdown"
          ? { value: "", role: CONTRACT_ROLE, options: f.options }
          : { value: prefill[f.id] ?? "", role: CONTRACT_ROLE },
    ]),
  );
}
