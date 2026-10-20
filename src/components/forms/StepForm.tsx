"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

export type Step = { title: string; kicker: string; valid: boolean; hint?: string; content: React.ReactNode };

/**
 * A multi-step form presented as "levels" with an XP-style progress bar.
 * Each level slides in; the last level's button submits.
 */
export default function StepForm({
  steps,
  onSubmit,
  submitting,
  error,
  submitLabel = "Submit",
}: {
  steps: Step[];
  onSubmit: () => void;
  submitting: boolean;
  error?: string;
  submitLabel?: string;
}) {
  const [i, setI] = useState(0);
  const [tried, setTried] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const step = steps[i];
  const last = i === steps.length - 1;
  const progress = ((i + (step.valid ? 1 : 0.5)) / steps.length) * 100;

  useEffect(() => {
    if (!panel.current || prefersReducedMotion()) return;
    const t = gsap.fromTo(
      panel.current.querySelectorAll(".step-anim"),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.05 },
    );
    return () => {
      t.kill();
    };
  }, [i]);

  const next = () => {
    if (!step.valid) {
      setTried(true);
      return;
    }
    setTried(false);
    if (last) onSubmit();
    else setI(i + 1);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        next();
      }}
      noValidate
    >
      <div className="mb-10">
        <div className="flex items-center justify-between font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-muted">
          <span>
            Level {i + 1} <span className="opacity-50">/ {steps.length}</span>
          </span>
          <span>{steps.map((s, idx) => (idx < i ? "●" : idx === i ? "◐" : "○")).join(" ")}</span>
        </div>
        <div className="mt-3 h-[3px] w-full overflow-hidden bg-line">
          <div className="h-full bg-ink transition-[width] duration-700 ease-[cubic-bezier(.16,1,.3,1)]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div ref={panel} key={i}>
        <p className="step-anim eyebrow">{step.kicker}</p>
        <h2 className="step-anim font-display mt-3 text-[clamp(40px,4.4vw,68px)] text-ink">{step.title}</h2>
        <div className="step-anim mt-8 grid gap-8">{step.content}</div>
      </div>

      {tried && !step.valid && (
        <p className="mt-6 text-sm text-pin" role="alert">
          {step.hint || "Please complete the required fields to level up."}
        </p>
      )}
      {error && (
        <p className="mt-6 text-sm text-pin" role="alert">
          {error}
        </p>
      )}

      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setI(Math.max(0, i - 1))}
          className={`font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-muted underline-offset-4 hover:underline ${i === 0 ? "invisible" : ""}`}
        >
          ← Back
        </button>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Sending…" : last ? submitLabel : "Next level"} <span className="arrow">→</span>
        </button>
      </div>
    </form>
  );
}

export function Field({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="field">
      <label>
        {label} {optional && <span className="normal-case tracking-normal text-muted">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
  multiple = true,
}: {
  options: readonly T[];
  value: T[];
  onChange: (v: T[]) => void;
  multiple?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            type="button"
            key={o}
            className="chip"
            aria-pressed={on}
            onClick={() => onChange(multiple ? (on ? value.filter((v) => v !== o) : [...value, o]) : on ? [] : [o])}
          >
            {on ? "✓" : "+"} {o}
          </button>
        );
      })}
    </div>
  );
}

export const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
