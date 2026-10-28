"use client";

import { useState } from "react";
import { BUDGETS, SERVICES, SUCCESS_MESSAGE, TIMELINES } from "@/lib/forms";
import { INSTAGRAM_URL } from "@/lib/content";
import { postJson } from "@/lib/upload";
import StepForm, { Chips, Field, isEmail } from "./StepForm";
import { SuccessBoard } from "./Uploads";

type Service = (typeof SERVICES)[number];

/** "Book a call": the brand enquiry form. */
export default function BrandForm({ intro = "" }: { intro?: string }) {
  const [f, setF] = useState({ brand: "", website: "", name: "", email: "", project: "", budget: "", timeline: "" });
  const [services, setServices] = useState<Service[]>([]);
  const [honey, setHoney] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await postJson<{ reference: string }>("/api/forms/brand", {
        fields: { ...f, services },
        website_url: honey,
      });
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
        body="We'll email you to lock in a call."
        links={[
          { href: "/services", label: "Our services" },
          { href: INSTAGRAM_URL, label: "See our work", external: true },
        ]}
      />
    );
  }

  return (
    <>
      {intro && <p className="font-serif mb-10 text-[clamp(18px,1.6vw,22px)] italic leading-snug text-ink">&ldquo;{intro}&rdquo;</p>}
      <input className="honeypot" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} aria-hidden />
      <StepForm
        submitting={submitting}
        error={error}
        submitLabel="Book a call"
        onSubmit={submit}
        steps={[
          {
            kicker: "About you",
            title: "Who are we talking to?",
            valid: Boolean(f.brand.trim() && f.website.trim() && f.name.trim()) && isEmail(f.email),
            hint: "Brand name, website or Instagram, your name and a valid email are needed.",
            content: (
              <>
                <div className="grid gap-8 md:grid-cols-2">
                  <Field label="Brand name *">
                    <input className="input" value={f.brand} onChange={set("brand")} autoComplete="organization" />
                  </Field>
                  <Field label="Website or Instagram *">
                    <input className="input" value={f.website} onChange={set("website")} placeholder="yourbrand.com or @yourbrand" />
                  </Field>
                </div>
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
            kicker: "The brief",
            title: "What do you need?",
            valid: f.project.trim().length > 10 && Boolean(f.budget) && Boolean(f.timeline),
            hint: "Tell us about the project and pick a budget range and timeline.",
            content: (
              <>
                <Field label="Services you're interested in (tick any)" optional>
                  <Chips options={SERVICES} value={services} onChange={setServices} />
                </Field>
                <Field label="About the project *">
                  <textarea className="input" value={f.project} onChange={set("project")} placeholder="Your brand, the product, the goal, any dates." />
                </Field>
                <div className="grid gap-8 md:grid-cols-2">
                  <Field label="Budget range *">
                    <select className="input" value={f.budget} onChange={set("budget")}>
                      <option value="">Choose…</option>
                      {BUDGETS.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Timeline *">
                    <select className="input" value={f.timeline} onChange={set("timeline")}>
                      <option value="">Choose…</option>
                      {TIMELINES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
