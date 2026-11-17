"use client";

import { useState } from "react";
import { agreementsProblems, APP_OPTIONS, TERMS_VERSION } from "@/lib/application";
import { APPLICATION_TERMS } from "@/lib/application-terms";
import { postJson } from "@/lib/upload";
import Popup from "./Popup";
import type { StepDef, StepProps, SubmitProps } from "./types";

const TERMS_LINK = "Application Terms and Privacy Collection Notice";

function Tick({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-relaxed text-ink">
      <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[var(--ink)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

function Agreements({ side, a, set }: StepProps) {
  const [terms, setTerms] = useState(false);
  const o = APP_OPTIONS[side];
  const toggle = (t: string, on: boolean) => set({ agreements: on ? [...new Set([...a.agreements, t])] : a.agreements.filter((x) => x !== t) });
  const t = APPLICATION_TERMS[side];
  return (
    <>
      <div className="grid gap-4">
        {o.agreements.map((text) => (
          <Tick key={text} checked={a.agreements.includes(text)} onChange={(on) => toggle(text, on)}>
            {text.includes(TERMS_LINK) ? (
              <>
                {text.split(TERMS_LINK)[0]}
                <button type="button" className="underline underline-offset-2" onClick={(e) => (e.preventDefault(), setTerms(true))}>
                  {TERMS_LINK}
                </button>
                {text.split(TERMS_LINK)[1]}
              </>
            ) : (
              text
            )}{" "}
            *
          </Tick>
        ))}
        <div className="mt-2 border-t border-line pt-4">
          <Tick checked={a.tips} onChange={(tips) => set({ tips })}>
            {o.tipsLabel} <span className="text-muted">(optional)</span>
          </Tick>
        </div>
      </div>
      {terms && (
        <Popup title="Application Terms & Privacy Collection Notice" onClose={() => setTerms(false)}>
          <p>{t.intro}</p>
          {t.sections.map((s, n) => (
            <section key={s.heading}>
              <h3 className="font-medium text-ink">
                {n + 1}. {s.heading}
              </h3>
              {s.paras.map((p) => (
                <p key={p} className="mt-2">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <p className="font-mono text-[11px] text-muted">Version {TERMS_VERSION}</p>
        </Popup>
      )}
    </>
  );
}

/** Sends the application (the server checks every step again and records the consent). */
function Submit({ side, a, ready, startedAt, clearDraft, onDone }: SubmitProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [honey, setHoney] = useState("");
  return (
    <div className="grid justify-items-end gap-2">
      <input className="honeypot" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} aria-hidden />
      <button
        type="button"
        className="btn"
        disabled={!ready || busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const r = await postJson<{ reference: string }>("/api/forms/creator", { side, application: a, website_url: honey, elapsed: Date.now() - startedAt });
            clearDraft();
            onDone?.(r.reference, a);
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Sending…" : "Submit application"} <span className="arrow">→</span>
      </button>
      {error && (
        <p className="max-w-md text-right text-sm text-pin" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Step 7: the five required agreements, the optional email tips, and Submit. */
export const agreements: StepDef = {
  kicker: "Agreements",
  title: "Nearly there.",
  problems: ({ a, side }) => agreementsProblems(a, side),
  render: (p) => <Agreements {...p} />,
  submit: (p) => <Submit {...p} />,
};
