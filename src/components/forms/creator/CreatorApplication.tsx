"use client";

import { useEffect, useRef, useState } from "react";
import { blankApplication, DEFAULT_ELIGIBILITY, type Application, type Eligibility, type StepId } from "@/lib/application";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import type { Side } from "@/lib/side";
import { STEPS, type StepProps } from "./steps";
import ThankYou from "./ThankYou";

/** The answers kept in this browser while the form is unfinished (photos are not kept). */
const draftKey = (side: Side) => `ms-apply-${side}`;
type Draft = { a: Application; step: number };

function readDraft(side: Side): Draft | null {
  try {
    const raw = localStorage.getItem(draftKey(side));
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft;
    return { a: { ...blankApplication(), ...d.a, photos: [], profileThumb: "", screenshots: [] }, step: Math.max(0, Math.min(Number(d.step) || 0, STEPS.length - 1)) };
  } catch {
    return null;
  }
}

/**
 * The creator application, which is also the onboarding form: one section per step with a progress
 * bar. Next stays disabled until the step's required answers are valid (the problems are listed under
 * it). The answers are kept in this browser if it closes, except photos, which must be added again.
 */
export default function CreatorApplication({
  side,
  eligibility = DEFAULT_ELIGIBILITY,
  onDone,
}: {
  side: Side;
  eligibility?: Eligibility;
  onDone?: (reference: string, a: Application) => void;
}) {
  const [a, setA] = useState<Application>(blankApplication);
  const [i, setI] = useState(0);
  const [restored, setRestored] = useState(false);
  // saving waits until the saved answers have been read back, so a blank form never overwrites them
  const [loaded, setLoaded] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [sent, setSent] = useState<{ reference: string; a: Application } | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);

  // pick up where this browser left off
  useEffect(() => {
    const d = readDraft(side);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the saved draft is only known in the browser
    setLoaded(true);
    if (!d) return;
    setA(d.a);
    setI(d.step);
    setRestored(true);
  }, [side]);
  // save after every change (photos excluded)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(draftKey(side), JSON.stringify({ a: { ...a, photos: [], profileThumb: "", screenshots: [] }, step: i }));
    } catch {
      /* storage blocked: the form still works, it just isn't kept */
    }
  }, [a, i, side, loaded]);

  useEffect(() => {
    if (!panel.current || prefersReducedMotion()) return;
    const t = gsap.fromTo(panel.current.querySelectorAll(".step-anim"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.05 });
    return () => {
      t.kill();
    };
  }, [i]);

  const step = STEPS[i];
  if (sent) return <ThankYou side={side} a={sent.a} reference={sent.reference} />;
  if (!step) return null; // no steps yet
  const props: StepProps = { side, a, el: eligibility, set: (patch) => setA((cur) => ({ ...cur, ...patch })) };
  const problems = step.problems(props);
  const last = i === STEPS.length - 1;
  const go = (n: number) => {
    setI(n);
    top.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  };

  return (
    <div ref={top} className="scroll-mt-28">
      <div className="mb-10">
        <div className="flex items-center justify-between font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-muted">
          <span>
            Step {i + 1} <span className="text-muted">/ {STEPS.length}</span> · {step.kicker}
          </span>
          <span aria-hidden>{STEPS.map((_, idx) => (idx < i ? "●" : idx === i ? "◐" : "○")).join(" ")}</span>
        </div>
        <div
          className="mt-3 h-[3px] w-full overflow-hidden bg-line"
          role="progressbar"
          aria-label="Application progress"
          aria-valuemin={0}
          aria-valuemax={STEPS.length}
          aria-valuenow={i + (problems.length ? 0 : 1)}
        >
          <div className="h-full bg-ink transition-[width] duration-700 ease-[cubic-bezier(.16,1,.3,1)]" style={{ width: `${((i + (problems.length ? 0.5 : 1)) / STEPS.length) * 100}%` }} />
        </div>
        {restored && i > 0 && (
          <p className="mt-3 text-sm text-muted">
            Welcome back: your answers were kept in this browser{a.photos.length ? "" : " (add your photos again)"}.{" "}
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => {
                setA(blankApplication());
                setI(0);
                setRestored(false);
              }}
            >
              Start again
            </button>
          </p>
        )}
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (problems.length) return;
          if (!last) go(i + 1);
        }}
      >
        <div ref={panel} key={i}>
          <h2 className="step-anim font-display text-[clamp(36px,4.2vw,64px)] text-ink">{step.title}</h2>
          <div className="step-anim mt-8 grid gap-8">{step.render(props)}</div>
        </div>

        {problems.length > 0 && (
          <ul className="mt-6 grid gap-1 text-sm text-ink-2" aria-live="polite">
            {problems.map((p) => (
              <li key={p}>· {p}</li>
            ))}
          </ul>
        )}

        <div className="mt-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => go(Math.max(0, i - 1))}
            className={`font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-muted underline-offset-4 hover:underline ${i === 0 ? "invisible" : ""}`}
          >
            ← Back
          </button>
          {!last && (
            <button type="submit" className="btn" disabled={problems.length > 0}>
              Next <span className="arrow">→</span>
            </button>
          )}
          {last && step.submit?.({ ...props, ready: problems.length === 0, startedAt, clearDraft: () => localStorage.removeItem(draftKey(side)), onDone: (reference, done) => {
            setSent({ reference, a: done });
            top.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
            onDone?.(reference, done);
          } })}
        </div>
      </form>
    </div>
  );
}

export type { StepId };
