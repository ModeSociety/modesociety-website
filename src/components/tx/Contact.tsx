"use client";

import { useEffect, useState } from "react";
import { isEmail } from "@/components/forms/StepForm";
import type { SectionCopy } from "@/lib/copy";
import { PLATFORMS, TECH_APPLY_AS, TECH_BUDGETS, TECH_CATEGORY_OPTIONS, TECH_FORMAT_OPTIONS, TECH_REGIONS, TECH_TIMELINES } from "@/lib/tech";
import { postJson } from "@/lib/upload";
import { pixel } from "./pixel";
import { TAB_EVENT } from "./TxShell";

type Mode = "brand" | "creator";
type Channel = { platform: string; handle: string; followers: string };

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
export default function Contact({ copy: c }: { copy: SectionCopy<"techSite.contact"> }) {
  const [mode, setMode] = useState<Mode>("brand");
  const [step, setStep] = useState(1);
  const [b, setB] = useState({ brand: "", website: "", name: "", email: "", about: "", budget: "", timeline: "" });
  const [categories, setCategories] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [cr, setCr] = useState({ name: "", handle: "", email: "", as: "", niche: "", region: "", notes: "" });
  const [channels, setChannels] = useState<Channel[]>([{ platform: "Twitch", handle: "", followers: "" }]);
  const [adult, setAdult] = useState(false);
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

  const filled = channels.filter((x) => x.handle.trim());
  const ok1 = mode === "brand" ? Boolean(b.brand.trim() && b.name.trim()) && isEmail(b.email) : Boolean(cr.name.trim() && cr.as) && isEmail(cr.email);
  const ok2 = mode === "brand" ? b.about.trim().length > 10 : filled.length > 0 && adult;
  const need1 = mode === "brand" ? "Brand name, your name and a valid email are needed." : "Your name, a valid email and what you're applying as are needed.";
  const need2 = mode === "brand" ? "Tell us a little about the campaign." : "Add at least one channel with your handle, and confirm you're 18 or over.";

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const res =
        mode === "brand"
          ? await postJson<{ reference: string }>("/api/forms/tech-brand", { fields: { ...b, categories, formats }, website_url: honey })
          : await postJson<{ reference: string }>("/api/forms/tech-creator", { fields: { ...cr, channels: filled, adult }, website_url: honey });
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

  const setCh = (i: number, k: keyof Channel, v: string) => setChannels(channels.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

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

          {done ? (
            <div className="form rv in" role="status">
              <span className="mono" style={{ color: "var(--royal)" }}>
                Received · {done.ref}
              </span>
              <h3>Thanks!</h3>
              <p style={{ color: "var(--body)" }}>{done.mode === "brand" ? c.brandThanks : c.creatorThanks}</p>
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

              {step === 1 && mode === "creator" && (
                <div className="panel">
                  <span className="mono" style={{ color: "var(--royal)" }}>
                    {c.level1}
                  </span>
                  <h3>{c.level1Title}</h3>
                  <div className="fields">
                    <div className="f">
                      <label className="mono" htmlFor="tc1">Name *</label>
                      <input id="tc1" value={cr.name} onChange={(e) => setCr({ ...cr, name: e.target.value })} autoComplete="name" required />
                    </div>
                    <div className="f">
                      <label className="mono" htmlFor="tc2">Your @ (optional)</label>
                      <input id="tc2" value={cr.handle} onChange={(e) => setCr({ ...cr, handle: e.target.value })} />
                    </div>
                    <div className="f full">
                      <label className="mono" htmlFor="tc3">Email *</label>
                      <input id="tc3" type="email" value={cr.email} onChange={(e) => setCr({ ...cr, email: e.target.value })} autoComplete="email" required />
                    </div>
                    <div className="f full">
                      <span className="mono">Applying as *</span>
                      <Opts options={TECH_APPLY_AS} value={cr.as ? [cr.as as (typeof TECH_APPLY_AS)[number]] : []} onChange={(v) => setCr({ ...cr, as: v[0] || "" })} single />
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

              {step === 2 && mode === "creator" && (
                <div className="panel">
                  <span className="mono" style={{ color: "var(--royal)" }}>
                    {c.level2}
                  </span>
                  <h3>{c.creatorLevel2}</h3>
                  <div className="fields">
                    {channels.map((ch, i) => (
                      <div key={i} className="f full chan">
                        <span className="mono">Channel {channels.length > 1 ? i + 1 : ""}</span>
                        <div className="chan-row">
                          <select aria-label="Platform" value={ch.platform} onChange={(e) => setCh(i, "platform", e.target.value)}>
                            {PLATFORMS.map((p) => (
                              <option key={p.id}>{p.label}</option>
                            ))}
                          </select>
                          <input aria-label="Handle or link" value={ch.handle} onChange={(e) => setCh(i, "handle", e.target.value)} placeholder="@handle or URL" />
                          <input aria-label="Followers" value={ch.followers} onChange={(e) => setCh(i, "followers", e.target.value)} placeholder="Followers, e.g. 18K" />
                          {channels.length > 1 && (
                            <button type="button" className="back" onClick={() => setChannels(channels.filter((_, j) => j !== i))} aria-label="Remove this channel">
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {channels.length < 6 && (
                      <div className="f full">
                        <div className="opts">
                          <button
                            type="button"
                            onClick={() =>
                              setChannels([...channels, { platform: PLATFORMS.find((p) => !channels.some((x) => x.platform === p.label))?.label || "YouTube", handle: "", followers: "" }])
                            }
                          >
                            + Add a channel
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="f">
                      <label className="mono" htmlFor="tc4">Games or niche (optional)</label>
                      <input id="tc4" value={cr.niche} onChange={(e) => setCr({ ...cr, niche: e.target.value })} placeholder="e.g. FPS, PC builds, mobile" />
                    </div>
                    <div className="f">
                      <label className="mono" htmlFor="tc5">Where you&apos;re based (optional)</label>
                      <select id="tc5" value={cr.region} onChange={(e) => setCr({ ...cr, region: e.target.value })}>
                        <option value="">Choose…</option>
                        {TECH_REGIONS.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </div>
                    <div className="f full">
                      <label className="mono" htmlFor="tc6">Anything you&apos;d like us to know (optional)</label>
                      <textarea id="tc6" value={cr.notes} onChange={(e) => setCr({ ...cr, notes: e.target.value })} placeholder="Brands you've worked with, what you're looking for…" />
                    </div>
                    <label className="f full adult">
                      <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
                      <span>I&apos;m 18 or over (for a team: every member is).</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="actions">
                <button type="button" className="back" style={{ visibility: step === 1 ? "hidden" : "visible" }} onClick={() => setStep(1)}>
                  {c.back}
                </button>
                <button type="submit" className="pill" disabled={busy}>
                  <span>{busy ? "Sending…" : step === 1 ? c.next : mode === "brand" ? c.brandSend : c.creatorSend}</span> <span className="ac">→</span>
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
