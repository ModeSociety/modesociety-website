"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export type Stat = { label: string; value: React.ReactNode };
export type Win = { title: React.ReactNode; body: string; score: string };

export const fmtTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function bookHref(game: string, score: string) {
  return `/work-with-us?from=game&game=${encodeURIComponent(game)}&score=${encodeURIComponent(score)}`;
}

/** Personal best kept in localStorage. `better(a, b)` says whether a beats b. */
export function useBest(key: string, better: (a: number, b: number) => boolean) {
  const [best, setBest] = useState<number | null>(null);
  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(key));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is browser-only
      if (v) setBest(v);
    } catch {
      /* ignore */
    }
  }, [key]);
  const submit = useCallback(
    (v: number) => {
      setBest((cur) => {
        if (cur !== null && !better(v, cur)) return cur;
        try {
          localStorage.setItem(key, String(v));
        } catch {
          /* ignore */
        }
        return v;
      });
    },
    [key, better],
  );
  return [best, submit] as const;
}

/** Shared layout for every homepage game: copy + stats on the left, the board on the right. */
export default function GameFrame({
  game,
  eyebrow = "A little game",
  title,
  description,
  stats,
  extra,
  onReset,
  resetLabel = "Reshuffle",
  win,
  children,
}: {
  game: string;
  eyebrow?: string;
  title: React.ReactNode;
  description: string;
  stats: Stat[];
  extra?: React.ReactNode;
  onReset?: () => void;
  resetLabel?: string;
  win?: Win | null;
  children: React.ReactNode;
}) {
  return (
    <section className="relative bg-ink py-24 text-paper md:py-32">
      <div className="wrap grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="eyebrow !text-paper/50">{eyebrow}</p>
          <h2 className="font-display mt-4 text-[clamp(30px,4vw,58px)]">{title}</h2>
          <p className="mt-5 max-w-sm text-paper/70">{description}</p>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-paper/15 pt-6 text-sm">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="eyebrow !text-paper/40">{s.label}</dt>
                <dd className="font-display mt-2 text-2xl tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
          {extra}
          {onReset && (
            <button
              onClick={onReset}
              className="mt-8 text-[11px] uppercase tracking-[0.18em] text-paper/60 underline underline-offset-4 hover:text-paper"
            >
              {resetLabel}
            </button>
          )}
        </div>

        <div className="relative md:col-span-8">
          {children}
          {win && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-ink/85 backdrop-blur-sm">
              <div className="px-6 text-center">
                <p className="eyebrow !text-paper/50">{game}</p>
                <p className="font-display mt-4 text-[clamp(26px,3.6vw,50px)]">{win.title}</p>
                <p className="mx-auto mt-4 max-w-md text-paper/70">{win.body}</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link href={bookHref(game, win.score)} className="btn light">
                    Book your cast <span className="arrow">→</span>
                  </Link>
                  {onReset && (
                    <button onClick={onReset} className="btn ghost !border-paper/40 !text-paper [&::before]:!bg-paper hover:!text-ink">
                      Play again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
