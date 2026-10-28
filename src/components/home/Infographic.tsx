"use client";

import { useEffect, useRef, useState } from "react";
import Accent from "@/components/site/Accent";
import { SectionHead } from "@/components/site/Editorial";
import { INFOGRAPHIC } from "@/lib/content";
import type { SectionCopy } from "@/lib/copy";

type Row = { label: string; mode: string; inHouse: string };
/** "$5.2" → 5.2, "1000+" → 1000, "2 weeks" → 2: the bar length comes from the first number in the text. */
const num = (v: string) => parseFloat(String(v).replace(/,/g, "").match(/-?\d+(\.\d+)?/)?.[0] ?? "0") || 0;

/* Two series, validated against the white panel: Mode Society vs an in-house marketer. */
const MODE = "#A3242B";
const IN_HOUSE = "#A9822F";
const SERIES = [
  { key: "mode" as const, label: "With Mode Society", color: MODE },
  { key: "inHouse" as const, label: "In-house marketer", color: IN_HOUSE },
];

function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-5 text-sm text-ink-2">
      {SERIES.map((s) => (
        <span key={s.key} className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: s.color }} /> {s.label}
        </span>
      ))}
    </div>
  );
}

/** Sales index over six months: two lines that draw in, with a crosshair tooltip. */
function SalesLine({ on }: { on: boolean }) {
  const { months, mode, inHouse } = INFOGRAPHIC.salesLift;
  const [hover, setHover] = useState<number | null>(null);
  const W = 560;
  const H = 260;
  const pad = { l: 40, r: 70, t: 16, b: 30 };
  const max = Math.ceil(Math.max(...mode, ...inHouse) / 50) * 50;
  const min = 50;
  const x = (i: number) => pad.l + (i / (months.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const ticks = [50, 100, 150, 200].filter((t) => t <= max);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Sales index over six months: Mode Society campaigns grow faster than in-house marketing"
        onPointerMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (months.length - 1));
          setHover(Math.min(months.length - 1, Math.max(0, i)));
        }}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#ead9d2" strokeWidth={1} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#9a6b6c">
              {t}
            </text>
          </g>
        ))}
        {months.map((m, i) => (
          <text key={m} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#9a6b6c">
            {m.replace("Month ", "M")}
          </text>
        ))}
        {SERIES.map((s) => {
          const vals = s.key === "mode" ? mode : inHouse;
          return (
            <g key={s.key}>
              <path
                d={path(vals)}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinecap="round"
                pathLength={1}
                style={{ strokeDasharray: 1, strokeDashoffset: on ? 0 : 1, transition: "stroke-dashoffset 1.8s cubic-bezier(.65,0,.35,1)" }}
              />
              {/* direct label at the line end */}
              <text
                x={x(vals.length - 1) + 8}
                y={y(vals[vals.length - 1]) + 4}
                fontSize="12"
                fill="#5e1a1c"
                style={{ opacity: on ? 1 : 0, transition: "opacity .6s 1.6s" }}
              >
                {s.key === "mode" ? "Mode" : "In-house"}
              </text>
            </g>
          );
        })}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#5e1a1c" strokeOpacity={0.35} strokeWidth={1} />
            {SERIES.map((s) => {
              const v = (s.key === "mode" ? mode : inHouse)[hover];
              return <circle key={s.key} cx={x(hover)} cy={y(v)} r={5} fill={s.color} stroke="#fff" strokeWidth={2} />;
            })}
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 border border-espresso/15 bg-white px-3 py-2 text-xs shadow-md"
          style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > months.length / 2 ? "-110%" : "10%"})` }}
        >
          <div className="mb-1 font-semibold text-ink">{months[hover]}</div>
          {SERIES.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-ink-2">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: s.color }} />
              {s.label}: <strong className="text-ink">{(s.key === "mode" ? mode : inHouse)[hover]}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** One pair of bars per metric; each metric keeps its own scale (no shared/dual axis). */
function MetricBars({ on, rows }: { on: boolean; rows: Row[] }) {
  const [tip, setTip] = useState<string | null>(null);
  return (
    <div className="grid gap-6">
      {rows.map((m) => {
        const max = Math.max(num(m.mode), num(m.inHouse)) || 1;
        return (
          <div key={m.label}>
            <div className="mb-2 text-sm font-medium text-ink">{m.label}</div>
            <div className="grid gap-[2px]">
              {SERIES.map((s, k) => {
                const v = s.key === "mode" ? m.mode : m.inHouse;
                const id = `${m.label}-${s.key}`;
                return (
                  <div
                    key={s.key}
                    className="group flex items-center gap-3 py-0.5"
                    onPointerEnter={() => setTip(id)}
                    onPointerLeave={() => setTip(null)}
                    tabIndex={0}
                    aria-label={`${s.label}: ${v}`}
                  >
                    <div className="h-[14px] flex-1">
                      <div
                        className="h-full rounded-r-[4px]"
                        style={{
                          width: on ? `${Math.max((num(v) / max) * 100, 2)}%` : "0%",
                          background: s.color,
                          opacity: tip && tip !== id ? 0.45 : 1,
                          transition: `width 1.2s cubic-bezier(.16,1,.3,1) ${k * 0.12}s, opacity .2s`,
                        }}
                      />
                    </div>
                    <span className="w-14 text-right text-sm tabular-nums text-ink-2">{v}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Share of spend that actually reaches creators, as one ring per series. */
function SpendRing({ series, on }: { series: (typeof SERIES)[number]; on: boolean }) {
  const parts = INFOGRAPHIC.budget[series.key];
  const toCreators = parts.find((p) => /creators/i.test(p.label))?.value ?? 0;
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <figure className="flex flex-col items-center text-center">
      <svg viewBox="0 0 140 140" className="w-[min(40vw,170px)]" role="img" aria-label={`${series.label}: ${toCreators}% of spend reaches creators`}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="#f1e6e1" strokeWidth="14" />
        <circle
          cx="70"
          cy="70"
          r={R}
          fill="none"
          stroke={series.color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={on ? C * (1 - toCreators / 100) : C}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1)" }}
        />
        <text x="70" y="76" textAnchor="middle" fontSize="26" fontWeight="700" fill="#7f090d">
          {toCreators}%
        </text>
      </svg>
      <figcaption className="mt-3 max-w-[18ch] text-sm text-ink-2">
        <span className="font-medium text-ink">{series.label}</span>
        <br />
        of the budget goes to creators &amp; content
      </figcaption>
    </figure>
  );
}

/** "How sourcing the right people boosts sales and ROI vs. an in-house marketer." */
export default function Infographic({ index, copy }: { index?: string; copy: SectionCopy<"site.numbers"> }) {
  const [ref, on] = useInView<HTMLElement>();
  const { salesLift } = INFOGRAPHIC;
  const roi = copy.rows.filter((r) => r.label.trim());
  return (
    <section ref={ref} className="py-20 md:py-28">
      <div className="wrap">
        <SectionHead index={index} label={copy.label} meta={copy.meta} className="mb-8" />
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-[clamp(52px,7.4vw,120px)] text-ink">
              <Accent text={copy.heading} />
            </h2>
            {copy.intro && <p className="mt-3 max-w-xl text-ink-2">{copy.intro}</p>}
          </div>
          <Legend />
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-12">
          <div className="border border-espresso/15 bg-white p-6 lg:col-span-7">
            <h3 className="font-medium text-ink">{copy.chartTitle}</h3>
            <p className="mb-4 text-sm text-muted">{copy.chartNote}</p>
            <SalesLine on={on} />
          </div>
          <div className="border border-espresso/15 bg-white p-6 lg:col-span-5">
            <h3 className="mb-5 font-medium text-ink">{copy.barsTitle}</h3>
            <MetricBars on={on} rows={roi} />
          </div>
          <div className="grid grid-cols-2 gap-6 border border-espresso/15 bg-white p-6 lg:col-span-12 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <div className="col-span-2 lg:col-span-1">
              <h3 className="font-medium text-ink">{copy.moneyTitle}</h3>
              <p className="mt-2 max-w-md text-sm text-ink-2">{copy.moneyText}</p>
            </div>
            {SERIES.map((s) => (
              <SpendRing key={s.key} series={s} on={on} />
            ))}
          </div>
        </div>

        <details className="mt-6 text-sm text-ink-2">
          <summary className="cursor-pointer underline underline-offset-4">View the figures as a table</summary>
          <table className="mt-3 w-full max-w-2xl border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="py-2 pr-4">Measure</th>
                <th className="py-2 pr-4">With Mode Society</th>
                <th className="py-2">In-house marketer</th>
              </tr>
            </thead>
            <tbody>
              {roi.map((m, i) => (
                <tr key={`${m.label}-${i}`} className="border-b border-line/60">
                  <td className="py-2 pr-4">{m.label}</td>
                  <td className="py-2 pr-4 tabular-nums">{m.mode}</td>
                  <td className="py-2 tabular-nums">{m.inHouse}</td>
                </tr>
              ))}
              <tr className="border-b border-line/60">
                <td className="py-2 pr-4">Sales index at month 6</td>
                <td className="py-2 pr-4 tabular-nums">{salesLift.mode.at(-1)}</td>
                <td className="py-2 tabular-nums">{salesLift.inHouse.at(-1)}</td>
              </tr>
            </tbody>
          </table>
        </details>
        {copy.note && <p className="mt-4 text-xs text-muted">{copy.note}</p>}
      </div>
    </section>
  );
}
