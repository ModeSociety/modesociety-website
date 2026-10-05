"use client";

import { useState } from "react";
import { PARTNERSHIPS, SUCCESS_MESSAGE } from "@/lib/forms";
import { FORM_INTROS, INSTAGRAM_URL } from "@/lib/content";
import { postJson } from "@/lib/upload";
import StepForm, { Chips, Field, isEmail } from "./StepForm";
import { SuccessBoard } from "./Uploads";

type Partnership = (typeof PARTNERSHIPS)[number];

/** Brand partnerships (B2B): referrals, co-marketing, cross-promotion. Not for paid bookings. */
export default function PartnerForm({ showIntro = true, typeHint = "" }: { showIntro?: boolean; typeHint?: string }) {
  const [f, setF] = useState({ business: "", type: typeHint, website: "", name: "", email: "", idea: "" });
  const [partnership, setPartnership] = useState<Partnership[]>([]);
  const [honey, setHoney] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await postJson<{ reference: string }>("/api/forms/partner", { fields: { ...f, partnership }, website_url: honey });
      setDone(res.reference);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <SuccessBoard
        reference={done}
        title={SUCCESS_MESSAGE}
        body="We'll come back to you about the partnership."
        links={[{ href: INSTAGRAM_URL, label: "Follow us", external: true }]}
      />
    );
  }

  return (
    <>
      {showIntro && <p className="font-serif mb-10 text-[clamp(18px,1.6vw,22px)] italic leading-snug text-ink">&ldquo;{FORM_INTROS.partner}&rdquo;</p>}
      <input className="honeypot" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} aria-hidden />
      <StepForm
        submitting={submitting}
        error={error}
        submitLabel="Send"
        onSubmit={submit}
        steps={[
          {
            kicker: "About you",
            title: "Who are you?",
            valid: Boolean(f.business.trim() && f.type.trim() && f.website.trim() && f.name.trim()) && isEmail(f.email),
            hint: "All of these are needed.",
            content: (
              <>
                <div className="grid gap-8 md:grid-cols-2">
                  <Field label="Business name *">
                    <input className="input" value={f.business} onChange={set("business")} autoComplete="organization" />
                  </Field>
                  <Field label="Type of business *">
                    <input className="input" value={f.type} onChange={set("type")} placeholder="e.g. streaming platform, events agency, creator tool" />
                  </Field>
                </div>
                <Field label="Website or Instagram *">
                  <input className="input" value={f.website} onChange={set("website")} />
                </Field>
                <div className="grid gap-8 md:grid-cols-2">
                  <Field label="Your name *">
                    <input className="input" value={f.name} onChange={set("name")} autoComplete="name" />
                  </Field>
                  <Field label="Email *">
                    <input className="input" type="email" value={f.email} onChange={set("email")} autoComplete="email" />
                  </Field>
                </div>
              </>
            ),
          },
          {
            kicker: "The idea",
            title: "How could we work together?",
            valid: partnership.length > 0 && f.idea.trim().length > 10,
            hint: "Pick a partnership type and tell us your idea.",
            content: (
              <>
                <Field label="Type of partnership * (tick any)">
                  <Chips options={PARTNERSHIPS} value={partnership} onChange={setPartnership} />
                </Field>
                <Field label="Tell us your partnership idea *">
                  <textarea className="input" value={f.idea} onChange={set("idea")} />
                </Field>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
