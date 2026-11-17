/**
 * A Book now booking from a Services page (SP-127): the service and tier come from the button, the
 * rest from the short form. The browser and the server check it with the same rules. The team confirms
 * each booking and sends an invoice by hand; nothing is paid online.
 */
import { isEmailAddress } from "./application";
import type { PricedService } from "./services";

export const BOOKING_AS = ["Creator", "Brand"] as const;

export type Booking = { service: string; tier: string; name: string; email: string; as: string; link: string; goals: string };

export const blankBooking = (service = "", tier = ""): Booking => ({ service, tier, name: "", email: "", as: "", link: "", goals: "" });

export function bookingProblems(b: Booking): string[] {
  const out: string[] = [];
  if (!b.name.trim()) out.push("Add your name");
  if (!isEmailAddress(b.email)) out.push("Add a valid email");
  if (!(BOOKING_AS as readonly string[]).includes(b.as)) out.push("Choose creator or brand");
  if (b.link.trim().length < 3) out.push(b.as === "Brand" ? "Add your website or socials" : "Add your socials (a handle or link)");
  if (b.goals.trim().length < 5) out.push("Tell us your goals");
  return out;
}

/** The tier in this site's current list (the server's check that the booking is for a real tier), with its price. */
export function findTier(items: PricedService[], service: string, tier: string) {
  const s = items.find((x) => x.title.trim() === service.trim());
  const t = s?.tiers.find((x) => x.name.trim() === tier.trim());
  return s && t ? { service: s.title.trim(), tier: t.name.trim(), price: t.price.trim() } : null;
}

export const bookingThanks = (name: string, tier: string) =>
  `Thanks, ${name.trim().split(/\s+/)[0] || "there"}. We've got your booking for ${tier}. Our team will confirm it and email you an invoice.`;
