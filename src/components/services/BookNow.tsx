"use client";

import { useRef, useState } from "react";
import Popup from "@/components/forms/creator/Popup";
import { Chips, Field } from "@/components/forms/StepForm";
import { BOOKING_AS, blankBooking, bookingProblems, bookingThanks, type Booking } from "@/lib/booking";
import type { Side } from "@/lib/side";
import { postJson } from "@/lib/upload";

/**
 * A tier's Book now button (SP-127). It opens a short form with the service and tier already chosen:
 * name, email, creator or brand, socials or website, and goals. The booking becomes a lead, and the
 * team confirms it and sends an invoice by hand (nothing is paid online).
 */
export default function BookNow({ side, service, tier, price, label }: { side: Side; service: string; tier: string; price: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [b, setB] = useState<Booking>(() => blankBooking(service, tier));
  const [honey, setHoney] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const openedAt = useRef(0);
  const set = (patch: Partial<Booking>) => setB((cur) => ({ ...cur, ...patch }));

  const show = () => {
    openedAt.current = Date.now();
    setError("");
    setOpen(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problems = bookingProblems(b);
    if (problems.length) return setError(problems.length > 1 ? `${problems[0]} (and ${problems.length - 1} more).` : `${problems[0]}.`);
    setBusy(true);
    setError("");
    try {
      const r = await postJson<{ reference: string }>("/api/forms/service-booking", { side, booking: b, website_url: honey, elapsed: Date.now() - openedAt.current });
      setDone(r.reference);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={show}
        className={side === "tech" ? "pill sm book" : "whitespace-nowrap border border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-paper"}
        aria-label={`${label}: ${service}, ${tier}`}
      >
        {label}
        {side === "tech" && <span className="ac">→</span>}
      </button>
      {open && (
        <Popup title={done ? "Booking received" : `Book: ${tier}`} onClose={() => setOpen(false)}>
          {done ? (
            <div role="status" className="grid gap-3">
              <p className="text-ink">{bookingThanks(b.name, tier)}</p>
              <p className="font-mono text-[12px] text-muted">Reference {done}</p>
              <button type="button" className="btn w-fit" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-5">
              <p className="border-l-2 border-ink pl-3 text-ink">
                {service} · {tier} · <span className="font-mono text-[13px]">{price}</span>
              </p>
              <input className="honeypot" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} aria-hidden />
              <Field label="Your name *">
                <input className="input" value={b.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" />
              </Field>
              <Field label="Email *">
                <input className="input" type="email" value={b.email} onChange={(e) => set({ email: e.target.value })} autoComplete="email" />
              </Field>
              <Field label="I'm a *">
                <Chips options={BOOKING_AS} value={b.as ? [b.as as (typeof BOOKING_AS)[number]] : []} onChange={(v) => set({ as: v[0] ?? "" })} multiple={false} />
              </Field>
              <Field label={b.as === "Brand" ? "Website or socials *" : "Socials (a handle or link) *"}>
                <input className="input" value={b.link} onChange={(e) => set({ link: e.target.value })} placeholder={b.as === "Brand" ? "yourbrand.com" : "@yourhandle"} />
              </Field>
              <Field label="Your goals *">
                <textarea className="input min-h-[110px]" value={b.goals} onChange={(e) => set({ goals: e.target.value })} placeholder="What you'd like to get out of it" />
              </Field>
              <p className="text-[13px] text-muted">No payment now: our team will confirm your booking and email you an invoice.</p>
              {error && (
                <p role="alert" className="text-pin">
                  {error}
                </p>
              )}
              <button type="submit" className="btn w-fit" disabled={busy}>
                {busy ? "Sending…" : "Send booking"} <span className="arrow">→</span>
              </button>
            </form>
          )}
        </Popup>
      )}
    </>
  );
}
