"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import VideoOrbit from "@/components/home/VideoOrbit";
import { prefersReducedMotion } from "@/lib/gsap";
import type { ServiceDetail } from "@/lib/content";
import type { SiteImage } from "@/lib/slots";
import StepIcon from "./StepIcon";

const TITLE_MS = 500; // title fades in before the first step
const STEP_MS = 750; // each step takes the highlight for this long

/**
 * One service at a time. Its "How it works" steps play in like a stepper:
 * each step appears and takes the burgundy highlight, then settles to an outline as the
 * next arrives; the call to action follows the last step. Arrows (or a swipe) change service.
 */
function Stepper({ service, play }: { service: ServiceDetail; play: boolean }) {
  // phase: -1 hidden · 0 title · 1..n step k active · n+1 all settled + CTA
  const n = service.steps.length;
  const [phase, setPhase] = useState(-1);

  useEffect(() => {
    if (!play) return;
    if (prefersReducedMotion()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced motion: show the finished state straight away
      setPhase(n + 1);
      return;
    }
    setPhase(0);
    const timers = Array.from({ length: n + 1 }, (_, k) => setTimeout(() => setPhase(k + 1), TITLE_MS + k * STEP_MS));
    return () => timers.forEach(clearTimeout);
  }, [play, n, service.id]);

  return (
    <div>
      <p className={`eyebrow transition-opacity duration-500 ${phase >= 0 ? "opacity-100" : "opacity-0"}`}>How it works</p>
      <h2
        className={`font-display mt-3 text-[clamp(52px,6vw,96px)] text-ink transition-all duration-700 ${
          phase >= 0 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        {service.title}
      </h2>

      <ol className="mt-8 grid">
        {service.steps.map((step, k) => {
          const shown = phase >= k + 1;
          const active = phase === k + 1;
          return (
            <li key={step.name} className="grid grid-cols-[minmax(150px,auto)_1fr] gap-x-5 md:grid-cols-[180px_1fr]">
              <div className="flex flex-col items-center">
                <span
                  className={`flex w-full items-center justify-center gap-2 border px-4 py-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.04em] transition-all duration-500 ${
                    active ? "border-ink bg-ink text-white" : "border-ink/70 bg-transparent text-ink"
                  } ${shown ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
                >
                  <StepIcon name={step.icon} />
                  {step.name}
                </span>
                {k < n - 1 && (
                  <span className="flex h-7 flex-col items-center" aria-hidden>
                    <span
                      className="w-px flex-1 origin-top bg-ink/40 transition-transform duration-500"
                      style={{ transform: `scaleY(${phase >= k + 2 ? 1 : 0})` }}
                    />
                    <span className={`-mt-1 text-[10px] leading-none text-ink/50 transition-opacity duration-300 ${phase >= k + 2 ? "opacity-100" : "opacity-0"}`}>
                      ▼
                    </span>
                  </span>
                )}
              </div>
              <div className={`pt-1 transition-all duration-700 ${shown ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`}>
                <span className="block text-[11px] font-semibold tracking-[0.14em] text-ink/70">{String(k + 1).padStart(2, "0")}</span>
                <span className={`block text-[15px] leading-snug transition-colors duration-500 ${active ? "text-ink" : "text-ink-2"}`}>{step.text}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className={`mt-10 flex flex-wrap gap-3 transition-all duration-700 ${phase > n ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
        {service.cta.label && (
          <Link href={service.cta.href} className="btn">
            {service.cta.label} <span className="arrow">→</span>
          </Link>
        )}
        {service.more && (
          <a href={service.more.href} target="_blank" rel="noreferrer" className="btn ghost">
            {service.more.label}
          </a>
        )}
      </div>
    </div>
  );
}

function Arrow({ dir, onClick, big = false }: { dir: -1 | 1; onClick: () => void; big?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir > 0 ? "Next service" : "Previous service"}
      className={`grid shrink-0 place-items-center border border-ink text-ink transition-colors duration-300 hover:bg-ink hover:text-white ${
        big ? "h-16 w-16 text-2xl" : "h-12 w-12 text-lg"
      }`}
    >
      {dir > 0 ? "→" : "←"}
    </button>
  );
}

export default function ServicesShowcase({ services, media }: { services: ServiceDetail[]; media: SiteImage[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [inView, setInView] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = useCallback(
    (d: 1 | -1) => {
      setDir(d);
      setIndex((i) => (i + d + services.length) % services.length);
    },
    [services.length],
  );

  return (
    <section className="wrap grid gap-12 pb-24 md:grid-cols-12 md:items-start md:pb-32">
      {/* the pinwheel stays put while the services change beside it */}
      <div className="md:sticky md:top-28 md:col-span-5">
        <VideoOrbit items={media} />
      </div>

      <div
        ref={panel}
        className="relative md:col-span-7 md:col-start-6 md:pl-6"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        onPointerDown={(e) => e.pointerType !== "mouse" && (swipe.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const s = swipe.current;
          swipe.current = null;
          if (!s) return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(dx < 0 ? 1 : -1);
        }}
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label="Our services"
      >
        <div className="flex items-start gap-6">
          <div className="min-h-[640px] min-w-0 flex-1 overflow-hidden" aria-live="polite">
            <div key={services[index].id} className="animate-[svc-in_.6s_cubic-bezier(.16,1,.3,1)_both]" style={{ ["--from" as string]: `${dir * 40}px` }}>
              <Stepper service={services[index]} play={inView} />
            </div>
          </div>
          {/* the main control: an arrow on the right to move to the next service */}
          <div className="hidden flex-col items-center gap-3 self-center md:flex">
            <Arrow dir={1} onClick={() => go(1)} big />
            <Arrow dir={-1} onClick={() => go(-1)} />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-espresso/15 pt-5">
          <div className="flex flex-wrap gap-x-5 gap-y-2" role="tablist" aria-label="Choose a service">
            {services.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === index}
                onClick={() => {
                  setDir(i > index ? 1 : -1);
                  setIndex(i);
                }}
                className={`font-mono text-[12px] font-medium uppercase tracking-[0.04em] transition-colors ${i === index ? "text-ink underline underline-offset-[6px]" : "text-muted hover:text-ink"}`}
              >
                {s.title}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 gap-2 md:hidden">
            <Arrow dir={-1} onClick={() => go(-1)} />
            <Arrow dir={1} onClick={() => go(1)} />
          </div>
        </div>
      </div>
    </section>
  );
}
