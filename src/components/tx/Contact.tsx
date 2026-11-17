"use client";

import { useEffect, useState } from "react";
import CreatorApplication from "@/components/forms/creator/CreatorApplication";
import { isEmail } from "@/components/forms/StepForm";
import type { Eligibility } from "@/lib/application";
import type { SectionCopy } from "@/lib/copy";
import { TECH_BUDGETS, TECH_CATEGORY_OPTIONS, TECH_FORMAT_OPTIONS, TECH_TIMELINES } from "@/lib/tech";
import { postJson } from "@/lib/upload";
import { pixel } from "./pixel";
import { TAB_EVENT } from "./TxShell";

type Mode = "brand" | "creator";

function Opts<T extends string>({ options, value, onChange, single = false }: { options: readonly T[]; value: T[]; onChange: (v: T[]) => void; single?: boolean }) {
  return (
    <div className="opts">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" aria-pressed={on} onClick={() => onChange(single ? (on ? [] : [o]) : on ? value.filter((x) => x !== o) : [...value, o])}>
            + {o}
          </button>
        );
      })}
    </div>
  );
}

/**
 * "Two ways in": the two-level form from Asha's design, sending to the live backend. Level 1 is the
 * design's; level 2 holds the live form's questions (brands: category, formats, the campaign, budget,
 * timeline; creators: channels, niche, region, notes and the 18+ check). Any data-tab button on the
 * page opens it on that tab.
 */
export default function Contact({ copy: c, eligibility }: { copy: SectionCopy<"techSite.contact">; eligibility: Eligibility }) {
  const [mode, setMode] = useState<Mode>("brand");
  const [step, setStep] = useState(1);
  const [b, setB] = useState({ brand: "", website: "", name: "", email: "", about: "", budget: "", timeline: "" });
  const [categories, setCategories] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [honey, setHoney] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ mode: Mode; ref: string } | null>(null);

  const open = (m: Mode) => {
    setMode(m);
    setStep(1);
    setError("");
  };
  useEffect(() => {
    const on = (e: Event) => open((e as CustomEvent<Mode>).detail);
    addEventListener(TAB_EVENT, on);
    // #apply (the old landing page's link, and /tech/creators) opens the creator tab
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the hash is only known in the browser
    if (location.hash === "#apply") open("creator");
    return () => removeEventListener(TAB_EVENT, on);
  }, []);

  const ok1 = Boolean(b.brand.trim() && b.name.trim()) && isEmail(b.email);
  const ok2 = b.about.trim().length > 10;
  const need1 = "Brand name, your name and a valid email are needed.";
  const need2 = "Tell us a little about the campaign.";

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await postJson<{ reference: string }>("/api/forms/tech-brand", { fields: { ...b, categories, formats }, website_url: honey });
      setDone({ mode, ref: res.reference });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!ok1) return setError(need1);
      setError("");
      return setStep(2);
    }
    if (!ok2) return setError(need2);
    submit();
  };


  return (
    <section className="sec contact" id="contact">
      <div className="blobs" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <span id="enquire" className="absolute top-0" aria-hidden />
      <span id="apply" className="absolute top-0" aria-hidden />
      <div className="wrap">
        <div className="cols">
          <div>
            <span className="mono" style={{ color: "var(--royal)", display: "block", marginBottom: 20 }}>
              {c.label}
            </span>
            <h2 className="h-l rv">{pixel(c.heading)}</h2>
            <p className="rv" style={{ marginTop: 24, fontSize: 18, maxWidth: "38ch", color: "var(--body)" }}>
              {c.body}
            </p>
          </div>

          {mode === "creator" && !done ? (
            <div className="form rv in">
              <div className="tabs" role="tablist">
                {(
                  [
                    ["brand", c.brandTab],
                    ["creator", c.creatorTab],
                  ] as const
                ).map(([m, label]) => (
                  <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => open(m)}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="panel creator-app">
                <CreatorApplication side="tech" eligibility={eligibility} />
              </div>
            </div>
          ) : done ? (
            <div className="form rv in" role="status">
              <span className="mono" style={{ color: "var(--royal)" }}>
                Received · {done.ref}
              </span>
              <h3>Thanks!</h3>
              <p style={{ color: "var(--body)" }}>{c.brandThanks}</p>
            </div>
          ) : (
            <form className="form rv" onSubmit={onSubmit} noValidate>
              <input className="honeypot" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} aria-hidden />
              <div className="tabs" role="tablist">
                {(
                  [
                    ["brand", c.brandTab],
                    ["creator", c.creatorTab],
                  ] as const
                ).map(([m, label]) => (
                  <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => open(m)}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="xp mono">
                <span>Level {step} / 2</span>
                <span>{step * 50} XP</span>
              </div>
              <div className="xpbar">
                <i style={{ width: `${step * 50}%` }} />
              </div>

              {step === 1 && mode === "brand" && (
                <div className="panel">
                  <span className="mono" style={{ color: "var(--royal)" }}>
                    {c.level1}
                  </span>
                  <h3>{c.level1Title}</h3>
                  <div className="fields">
                    <div className="f">
                      <label className="mono" htmlFor="tb1">Brand name *</label>
                      <input id="tb1" value={b.brand} onChange={(e) => setB({ ...b, brand: e.target.value })} autoComplete="organization" required />
                    </div>
                    <div className="f">
                      <label className="mono" htmlFor="tb2">Website (optional)</label>
                      <input id="tb2" value={b.website} onChange={(e) => setB({ ...b, website: e.target.value })} placeholder="yourbrand.com" />
                    </div>
                    <div className="f">
                      <label className="mono" htmlFor="tb3">Your name *</label>
                      <input id="tb3" value={b.name} onChange={(e) => setB({ ...b, name: e.target.value })} autoComplete="name" required />
                    </div>
                    <div className="f">
                      <label className="mono" htmlFor="tb4">Email *</label>
                      <input id="tb4" type="email" value={b.email} onChange={(e) => setB({ ...b, email: e.target.value })} autoComplete="email" required />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && mode === "brand" && (
                <div className="panel">
                  <span className="mono" style={{ color: "var(--royal)" }}>
                    {c.level2}
                  </span>
                  <h3>{c.brandLevel2}</h3>
                  <div className="fields">
                    <div className="f full">
                      <span className="mono">Your category (optional)</span>
                      <Opts options={TECH_CATEGORY_OPTIONS} value={categories} onChange={setCategories} />
                    </div>
                    <div className="f full">
                      <span className="mono">Formats you&apos;re interested in (optional)</span>
                      <Opts options={TECH_FORMAT_OPTIONS} value={formats} onChange={setFormats} />
                    </div>
                    <div className="f full">
                      <label className="mono" htmlFor="tb5">About the campaign *</label>
                      <textarea id="tb5" value={b.about} onChange={(e) => setB({ ...b, about: e.target.value })} placeholder="The product, the goal, the audience, any dates." />
                    </div>
                    <div className="f">
                      <label className="mono" htmlFor="tb6">Budget (optional)</label>
                      <select id="tb6" value={b.budget} onChange={(e) => setB({ ...b, budget: e.target.value })}>
                        <option value="">Choose…</option>
                        {TECH_BUDGETS.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </div>
                    <div className="f">
                      <label className="mono" htmlFor="tb7">Timeline (optional)</label>
                      <select id="tb7" value={b.timeline} onChange={(e) => setB({ ...b, timeline: e.target.value })}>
                        <option value="">Choose…</option>
                        {TECH_TIMELINES.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="actions">
                <button type="button" className="back" style={{ visibility: step === 1 ? "hidden" : "visible" }} onClick={() => setStep(1)}>
                  {c.back}
                </button>
                <button type="submit" className="pill" disabled={busy}>
                  <span>{busy ? "Sending…" : step === 1 ? c.next : c.brandSend}</span> <span className="ac">→</span>
                </button>
              </div>
              {error && (
                <p className="note mono" role="alert">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
