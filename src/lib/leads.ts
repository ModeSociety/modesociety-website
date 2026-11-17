import { revalidateTag, unstable_cache } from "next/cache";
import { callBackend } from "./backend";
import type { EnquiryKind, SheetTable } from "./enquiries";

/**
 * Leads (the form tabs of the Sheet) as the admin panel reads them. Apps Script takes 2 to 7 seconds
 * to answer, so the website keeps a copy: the panel shows the copy at once, then asks for a fresh
 * one in the background and swaps it in. Every change (a status, a delete, a new form) marks the copy
 * stale, so the next read starts a rebuild without anyone waiting for it.
 */
export const LEADS_TAG = "leads";

type Tables = Partial<Record<EnquiryKind, SheetTable>>;
/** the leads, and the Signed Talent tab (read in the same call; it's joined to the creator leads) */
export type LeadsSnapshot = { enquiries: Tables; signed?: SheetTable; at: string };

const read = async (): Promise<LeadsSnapshot> => {
  const data = await callBackend<{ enquiries: Tables; signed?: SheetTable }>("listEnquiries");
  return { enquiries: data.enquiries, signed: data.signed, at: new Date().toISOString() };
};

const readCached = unstable_cache(read, ["leads-v2"], { tags: [LEADS_TAG], revalidate: 300 });

/** The kept copy (instant), or with fresh, straight from the Sheet (the copy is then rebuilt too). */
export async function getLeads(fresh = false): Promise<LeadsSnapshot> {
  if (!fresh) return readCached();
  const snap = await read();
  revalidateTag(LEADS_TAG, "max");
  return snap;
}

/** After any change to a lead, or a new form: the kept copy is rebuilt on its next read. */
export function leadsChanged() {
  revalidateTag(LEADS_TAG, "max");
}
