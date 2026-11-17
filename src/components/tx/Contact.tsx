"use client";

import { useEffect, useRef, useState } from "react";
import CreatorApplication from "@/components/forms/creator/CreatorApplication";
import { scrollToSection } from "@/lib/anchor";
import type { Eligibility } from "@/lib/application";
import type { SectionCopy } from "@/lib/copy";
import {
  blankTechBrand, brandProblems, campaignProblems, firstOf, TB_BRIEF_TYPES, TB_BUDGETS, TB_CONSENT, TB_CREATORS, TB_GOALS, TB_HEARD,
  TB_INDUSTRIES, TB_INTRO, TB_MARKETS, TB_PLATFORMS, TB_TYPES, tbThanks, type TechBrand,
} from "@/lib/tech-brand";
import { encodeFile, postJson } from "@/lib/upload";
import { pixel } from "./pixel";
import { PageA } from "./paths";
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

/** Uploads pass through the website: up to 3 MB, bigger briefs are shared as a link. */
const BRIEF_MAX_MB = 2.9;

/** The optional brief or deck: a PDF, PPTX or DOCX uploaded here, or a link to one. */
function Brief({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [status, setStatus] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const uploaded = /^[\w-]{10,}$/.test(value);
  const upload = async (file?: File) => {
    if (!file) return;
    if (!TB_BRIEF_TYPES.includes(file.type)) return setStatus("Choose a PDF, PPTX or DOCX.");
    if (file.size > BRIEF_MAX_MB * 1024 * 1024) return setStatus("That file is over 3 MB: paste a link to it instead (Google Drive, Dropbox…).");
    setStatus("Uploading…");
    try {
      const enc = await encodeFile(file);
      const { fileId } = await postJson<{ fileId: string }>("/api/forms/upload", { filename: enc.filename, mimeType: enc.mimeType, data: enc.data });
      onChange(fileId);
      setStatus(`✓ ${file.name} uploaded`);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      if (input.current) input.current.value = "";
    }
  };
  return (
    <div className="f full">
      <span className="mono">Brief / deck (optional)</span>
      <div className="opts" style={{ alignItems: "center" }}>
        <button type="button" onClick={() => input.current?.click()}>
          + {uploaded ? "Replace the file" : "Upload a PDF, PPTX or DOCX (up to 3 MB)"}
        </button>
        {uploaded && (
          <button type="button" onClick={() => (onChange(""), setStatus(""))}>
            Remove
          </button>
        )}
        {status && (
          <span className="mono" role="status">
            {status}
          </span>
        )}
      </div>
      {!uploaded && <input aria-label="Link to the brief" value={value} onChange={(e) => onChange(e.target.value)} placeholder="…or paste a link to it" inputMode="url" />}
      <input ref={input} type="file" accept={[".pdf", ".pptx", ".docx", ...TB_BRIEF_TYPES].join(",")} hidden onChange={(e) => upload(e.target.files?.[0])} />
    </div>
  );
}

/** A labelled dropdown. */
function Pick({ id, label, options, value, onChange }: { id: string; label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="f">
      <label className="mono" htmlFor={id}>
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose…</option>
        {options.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </div>
  );
}

/**
 * "Two ways in": the two-level form from Asha's design. Brands: the Tech brand enquiry from Asha's
 * spec (level 1 the brand, level 2 the campaign), checked with the same rules as the server.
 * Creators: the creator application. Any data-tab button on the page opens it on that tab.
 */
export default function Contact({ copy: c, eligibility }: { copy: SectionCopy<"techSite.contact">; eligibility: Eligibility }) {
  const [mode, setMode] = useState<Mode>("brand");
  const [step, setStep] = useState(1);
  const [b, setForm] = useState<TechBrand>(blankTechBrand);
  const setB = (patch: Partial<TechBrand>) => setForm((cur) => ({ ...cur, ...patch }));
  const [honey, setHoney] = useState("");
  // when the page opened (the server turns away a form sent faster than a person can type)
  const startedAt = useRef(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ ref: string; first: string } | null>(null);

  const open = (m: Mode) => {
    setMode(m);
    setStep(1);
    setError("");
  };
  useEffect(() => {
    startedAt.current = Date.now();
    const on = (e: Event) => open((e as CustomEvent<Mode>).detail);
    addEventListener(TAB_EVENT, on);
    // #apply (the old landing page's link, and /tech/creators) opens the creator tab
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the hash is only known in the browser
    if (location.hash === "#apply") open("creator");
    return () => removeEventListener(TAB_EVENT, on);
  }, []);

  const today = new Date().toLocaleDateString("en-CA"); // the browser's own date, as YYYY-MM-DD

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await postJson<{ reference: string }>("/api/forms/tech-brand", { enquiry: b, website_url: honey, elapsed: Date.now() - startedAt.current });
      setDone({ ref: res.reference, first: firstOf(b.contact) });
      // the thank-you is shorter than the form: bring it back into view
      requestAnimationFrame(() => {
        const el = document.getElementById("contact");
        if (el) scrollToSection(el);
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const problems = step === 1 ? brandProblems(b) : campaignProblems(b, new Date(`${today}T12:00:00Z`));
    if (problems.length) return setError(problems.length > 1 ? `${problems[0]} (and ${problems.length - 1} more).` : `${problems[0]}.`);
    setError("");
    if (step === 1) return setStep(2);
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
              <p style={{ color: "var(--body)" }}>{tbThanks(done.first)}</p>
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
                  <p style={{ color: "var(--body)", margin: "-8px 0 22px" }}>{TB_INTRO}</p>
                  <div className="fields">
                    <div className="f">
                      <label className="mono" htmlFor="tb1">Company / brand name *</label>
                      <input id="tb1" value={b.company} onChange={(e) => setB({ company: e.target.value })} autoComplete="organization" required />
                    </div>
                    <div className="f">
                      <label className="mono" htmlFor="tb2">Website *</label>
                      <input id="tb2" value={b.website} onChange={(e) => setB({ website: e.target.value })} placeholder="yourbrand.com" inputMode="url" autoComplete="url" required />
                    </div>
                    <div className="f">
                      <label className="mono" htmlFor="tb3">Contact name *</label>
                      <input id="tb3" value={b.contact} onChange={(e) => setB({ contact: e.target.value })} autoComplete="name" required />
                    </div>
                    <div className="f">
                      <label className="mono" htmlFor="tb4">Role / title *</label>
                      <input id="tb4" value={b.role} onChange={(e) => setB({ role: e.target.value })} autoComplete="organization-title" required />
                    </div>
                    <div className="f">
                      <label className="mono" htmlFor="tb5">Work email *</label>
                      <input id="tb5" type="email" value={b.email} onChange={(e) => setB({ email: e.target.value })} autoComplete="email" required />
                    </div>
                    <div className="f">
                      <label className="mono" htmlFor="tb6">Phone (optional)</label>
                      <input id="tb6" type="tel" value={b.phone} onChange={(e) => setB({ phone: e.target.value })} autoComplete="tel" />
                    </div>
                    <Pick id="tb7" label="Industry *" options={TB_INDUSTRIES} value={b.industry} onChange={(industry) => setB({ industry })} />
                    <Pick id="tb8" label="Country / market *" options={TB_MARKETS} value={b.market} onChange={(market) => setB({ market })} />
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
                      <span className="mono">Campaign goal *</span>
                      <Opts options={TB_GOALS} value={b.goals} onChange={(goals) => setB({ goals })} />
                    </div>
                    <div className="f full">
                      <span className="mono">Campaign type *</span>
                      <Opts options={TB_TYPES} value={b.types} onChange={(types) => setB({ types })} />
                    </div>
                    <div className="f full">
                      <span className="mono">Platforms *</span>
                      <Opts options={TB_PLATFORMS} value={b.platforms} onChange={(platforms) => setB({ platforms })} />
                    </div>
                    <div className="f full">
                      <span className="mono">Creator type (optional)</span>
                      <Opts options={TB_CREATORS} value={b.creators} onChange={(creators) => setB({ creators })} />
                    </div>
                    <div className="f full">
                      <label className="mono" htmlFor="tb9">Target audience (optional)</label>
                      <textarea id="tb9" value={b.audience} onChange={(e) => setB({ audience: e.target.value })} placeholder="Age, region, games or interests." style={{ minHeight: 80 }} />
                    </div>
                    <Pick id="tb10" label="Budget (AUD, excl. GST) *" options={TB_BUDGETS} value={b.budget} onChange={(budget) => setB({ budget })} />
                    <div className="f">
                      <label className="mono" htmlFor="tb11">Ideal start / launch date *</label>
                      <input id="tb11" type="date" min={today} value={b.start} onChange={(e) => setB({ start: e.target.value })} required />
                    </div>
                    <div className="f full">
                      <label className="mono" htmlFor="tb12">Campaign details (optional)</label>
                      <textarea id="tb12" value={b.details} onChange={(e) => setB({ details: e.target.value })} placeholder="Product, key messages, deliverables, anything else." />
                    </div>
                    <Brief value={b.brief} onChange={(brief) => setB({ brief })} />
                    <Pick id="tb13" label="How did you hear about us? *" options={TB_HEARD} value={b.heard} onChange={(heard) => setB({ heard })} />
                    {b.heard === "Other" && (
                      <div className="f">
                        <label className="mono" htmlFor="tb14">Where? *</label>
                        <input id="tb14" value={b.heardOther} onChange={(e) => setB({ heardOther: e.target.value })} required />
                      </div>
                    )}
                    <label className="f full" style={{ display: "flex", gap: 12, alignItems: "flex-start", color: "var(--body)" }}>
                      <input type="checkbox" checked={b.consent} onChange={(e) => setB({ consent: e.target.checked })} style={{ width: 20, height: 20, padding: 0, marginTop: 2, flex: "none" }} required />
                      <span>
                        {TB_CONSENT.replace(/Privacy Policy\.$/, "")}
                        <PageA to="/privacy" target="_blank" style={{ textDecoration: "underline" }}>
                          Privacy Policy
                        </PageA>
                        . *
                      </span>
                    </label>
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
