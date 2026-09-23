"use client";

import { useEffect, useState } from "react";
import { BUDGETS, SERVICES } from "@/lib/forms";
import { postJson } from "@/lib/upload";
import StepForm, { Chips, Field, isEmail } from "./StepForm";
import { SuccessBoard } from "./Uploads";

type Service = (typeof SERVICES)[number];
type Budget = (typeof BUDGETS)[number];

export default function BrandForm() {
  const [f, setF] = useState({ name: "", position: "", company: "", email: "", phone: "", website: "", business: "", target: "", goals: "" });
  const [services, setServices] = useState<Service[]>([]);
  const [budget, setBudget] = useState<Budget[]>([]);
  const [played, setPlayed] = useState<{ game: string; score: string } | null>(null);
  const [honey, setHoney] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);

  // Arriving from a homepage game carries the visitor's score along (?from=game&game=…&score=…).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const game = q.get("game")?.slice(0, 40);
    const score = q.get("score")?.slice(0, 80);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL params are only known in the browser
    if (q.get("from") === "game" && game && score) setPlayed({ game, score });
    const svc = q.get("service");
    if (svc && (SERVICES as readonly string[]).includes(svc)) setServices([svc as Service]);
  }, []);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await postJson<{ reference: string }>("/api/forms/brand", {
        fields: {
          ...f,
          services,
          budget: budget[0] || "",
          moodboard: played ? [`${played.game}: ${played.score}`] : [],
        },
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
        title="Brief received."
        body="Thank you. If it feels like the right fit, our team will be in touch to book a call."
        links={[
          { href: "/about", label: "How we work" },
          { href: "https://instagram.com/modesocietyagency", label: "See our work", external: true },
        ]}
      />
    );
  }

  return (
    <>
      {played && (
        <div className="mb-10 flex items-center gap-4 border border-line bg-paper-2/60 p-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink font-serif text-lg italic text-paper">★</span>
          <p className="text-sm text-ink-2">
            <strong className="font-medium text-ink">{played.game} champion.</strong> You finished with {played.score}, so we&apos;ll
            mention it on your brief.
          </p>
        </div>
      )}
      <input className="honeypot" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} aria-hidden />
      <StepForm
        submitting={submitting}
        error={error}
        submitLabel="Send brief"
        onSubmit={submit}
        steps={[
          {
            kicker: "About you",
            title: "Who are we talking to?",
            valid: Boolean(f.name.trim() && f.company.trim()) && isEmail(f.email),
            hint: "Your name, company and a valid email are needed to continue.",
            content: (
              <>
                <div className="grid gap-8 md:grid-cols-2">
                  <Field label="Your full name">
                    <input className="input" value={f.name} onChange={set("name")} autoComplete="name" />
                  </Field>
                  <Field label="Your position" optional>
                    <input className="input" value={f.position} onChange={set("position")} autoComplete="organization-title" />
                  </Field>
                </div>
                <Field label="Company name">
                  <input className="input" value={f.company} onChange={set("company")} autoComplete="organization" />
                </Field>
                <div className="grid gap-8 md:grid-cols-2">
                  <Field label="Email">
                    <input className="input" type="email" value={f.email} onChange={set("email")} autoComplete="email" />
                  </Field>
                  <Field label="Phone" optional>
                    <input className="input" type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" />
                  </Field>
                </div>
                <Field label="Website or socials" optional>
                  <input className="input" value={f.website} onChange={set("website")} placeholder="www.yourbrand.com" />
                </Field>
              </>
            ),
          },
          {
            kicker: "Your brand",
            title: "Tell us about the business.",
            valid: f.business.trim().length > 10,
            hint: "Give us a few words about your business.",
            content: (
              <>
                <Field label="Tell us about your business">
                  <textarea className="input" value={f.business} onChange={set("business")} />
                </Field>
                <Field label="Who is your target market?" optional>
                  <textarea className="input !min-h-[80px]" value={f.target} onChange={set("target")} />
                </Field>
              </>
            ),
          },
          {
            kicker: "The brief",
            title: "What does success look like?",
            valid: services.length > 0 && budget.length > 0,
            hint: "Choose at least one service and a budget range.",
            content: (
              <>
                <Field label="What are you hoping to achieve by working with us?" optional>
                  <textarea className="input" value={f.goals} onChange={set("goals")} />
                </Field>
                <Field label="What services are you looking for?">
                  <Chips options={SERVICES} value={services} onChange={setServices} />
                </Field>
                <Field label="Budget">
                  <Chips options={BUDGETS} value={budget} onChange={setBudget} multiple={false} />
                </Field>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
