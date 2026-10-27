"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { responsive } from "@/lib/img";
import { PLATFORMS, compact, parseFollowers, totalFollowers, type RosterMember } from "@/lib/tech";
import CountUp from "./CountUp";
import Decode from "./Decode";
import { SampleTag } from "./ui";

/**
 * The roster as a "character select" screen: one creator large, with their channels as
 * stat bars, and a grid of the others to pick from (hover, tap or the arrow keys).
 * It cycles on its own until someone picks.
 */
export default function CharacterSelect({ members, sample }: { members: RosterMember[]; sample: boolean }) {
  const list = members.slice(0, 8);
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const m = list[i] ?? list[0];

  // biggest single channel on the roster, so the bars compare creators fairly
  const maxChannel = Math.max(1, ...list.flatMap((x) => Object.values(x.platforms).map((p) => parseFollowers(p?.followers))));

  useEffect(() => {
    if (!auto || list.length < 2 || prefersReducedMotion()) return;
    const el = root.current;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (el) io.observe(el);
    const t = setInterval(() => visible && !document.hidden && setI((n) => (n + 1) % list.length), 4200);
    return () => {
      clearInterval(t);
      io.disconnect();
    };
  }, [auto, list.length]);

  const pick = (n: number) => {
    setAuto(false);
    setI((n + list.length) % list.length);
  };
  const onKey = (e: React.KeyboardEvent) => {
    const cols = 2;
    const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
    if (d) {
      e.preventDefault();
      pick(i + d);
    }
  };
  if (!m) return null;
  const channels = PLATFORMS.filter((p) => m.platforms[p.id]);

  return (
    <div ref={root} className="grid gap-3 lg:grid-cols-12" onKeyDown={onKey}>
      {/* the selected creator */}
      <div className="t-panel relative grid overflow-hidden md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:col-span-8" aria-live="polite">
        <div key={`p-${m.id}`} className="relative aspect-[4/5] overflow-hidden bg-[#141824] md:aspect-auto md:min-h-[460px] animate-[cs-in_.5s_cubic-bezier(.16,1,.3,1)_both]">
          {m.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...responsive(m.photo, "(max-width: 767px) 100vw, 30vw", 1080)} alt={`${m.name}${m.handle ? ` (@${m.handle})` : ""}`} className="h-full w-full object-cover" />
          ) : (
            <div aria-hidden className="grid h-full w-full place-items-center bg-[radial-gradient(80%_70%_at_50%_25%,rgba(75,111,245,0.45),transparent_70%),repeating-linear-gradient(135deg,rgba(255,255,255,0.03)_0_10px,transparent_10px_20px)]">
              <span className="tech-display text-[160px] text-white/20">{m.name.slice(0, 1)}</span>
            </div>
          )}
          {/* scanline sweep on change */}
          <div aria-hidden className="pointer-events-none absolute inset-0 animate-[cs-scan_.7s_ease-out_both] bg-[linear-gradient(180deg,transparent,rgba(137,178,253,0.35)_50%,transparent)] bg-[length:100%_30%] bg-no-repeat" />
          <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.18)_0_1px,transparent_1px_3px)] mix-blend-multiply" />
          <span className="tech-mono absolute left-4 top-4 rounded-full bg-[#3e5ef1] px-2.5 py-1 text-[10px] uppercase text-white">P1 · Selected</span>
          {sample && (
            <span className="absolute right-4 top-4">
              <SampleTag />
            </span>
          )}
        </div>

        <div className="flex flex-col p-6 md:p-8">
          <p className="tech-mono text-[11px] uppercase text-[#8c95a5]">
            {m.type}
            {m.region ? ` · ${m.region}` : ""}
          </p>
          <h3 className="tech-display mt-2 text-[clamp(48px,5.4vw,84px)] text-white">
            <Decode key={m.id} text={m.name} immediate />
          </h3>
          {m.handle && <p className="tech-mono text-[13px] text-[#89b2fd]">@{m.handle}</p>}
          {m.niche && <p className="mt-3 text-[15px] text-[#aab2c0]">{m.niche}</p>}

          <div className="mt-7 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
            <span className="tech-mono text-[11px] uppercase text-[#8c95a5]">Power level · total followers</span>
            <span className="tech-wide text-[clamp(34px,3.4vw,52px)] leading-none text-[#a9c6ff]">
              <CountUp key={m.id} value={totalFollowers(m)} />
            </span>
          </div>

          <ul className="mt-5 grid gap-3">
            {channels.map((p, k) => {
              const c = m.platforms[p.id]!;
              const n = parseFollowers(c.followers);
              const inner = (
                <>
                  <span className="tech-mono flex justify-between text-[11px] uppercase text-[#aab2c0]">
                    <span>{p.label}</span>
                    <span className="text-white">{compact(n)}</span>
                  </span>
                  <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-white/[0.07]">
                    <span
                      key={`${m.id}-${p.id}`}
                      className="block h-full origin-left rounded-full bg-[linear-gradient(90deg,#3e5ef1,#a9c6ff)] shadow-[0_0_12px_rgba(137,178,253,0.6)] animate-[cs-bar_.9s_cubic-bezier(.16,1,.3,1)_both]"
                      style={{ width: `${Math.max(4, (n / maxChannel) * 100)}%`, animationDelay: `${k * 80}ms` }}
                    />
                  </span>
                </>
              );
              return (
                <li key={p.id}>
                  {c.url && !sample ? (
                    <a href={c.url} target="_blank" rel="noreferrer" className="block transition-opacity hover:opacity-80" aria-label={`${m.name} on ${p.label}: ${compact(n)} followers`}>
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-auto flex flex-wrap gap-3 pt-8">
            <Link href="/tech/contact?as=brand" className="btn !py-2.5">
              Book {m.name.split(" ")[0]} <span className="arrow">→</span>
            </Link>
            <Link href="/tech/talent" className="btn ghost !py-2.5">
              Full roster
            </Link>
          </div>
        </div>
      </div>

      {/* select grid */}
      <div className="lg:col-span-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="tech-mono text-[11px] uppercase text-[#8c95a5]">Select creator</p>
          <p className="tech-mono hidden text-[10.5px] uppercase text-[#6c7484] md:block">← → ↑ ↓</p>
        </div>
        <div role="group" aria-label="Select a creator" className="grid grid-cols-4 gap-2 lg:grid-cols-2">
          {list.map((x, n) => {
            const on = n === i;
            return (
              <button
                key={x.id}
                aria-pressed={on}
                aria-label={`Show ${x.name}`}
                onMouseEnter={() => pick(n)}
                onFocus={() => pick(n)}
                onClick={() => pick(n)}
                className={`group relative aspect-square overflow-hidden rounded-[14px] bg-[#141824] text-left transition-[transform,box-shadow] duration-300 ${
                  on ? "scale-[1.03] shadow-[0_0_0_2px_#89b2fd,0_0_28px_rgba(137,178,253,0.45)]" : "shadow-[inset_0_0_0_1px_rgba(233,236,241,0.12)] hover:shadow-[inset_0_0_0_1px_rgba(137,178,253,0.6)]"
                }`}
              >
                {x.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img {...responsive(x.photo, "120px", 384)} alt="" className={`h-full w-full object-cover transition duration-500 ${on ? "" : "opacity-60 grayscale group-hover:opacity-90"}`} loading="lazy" />
                ) : (
                  <span aria-hidden className="tech-display grid h-full w-full place-items-center bg-[radial-gradient(70%_70%_at_50%_30%,rgba(75,111,245,0.3),transparent)] text-[42px] text-white/30">
                    {x.name.slice(0, 1)}
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07080c] to-transparent px-2 pb-1.5 pt-5">
                  <span className="tech-mono block truncate text-[10px] uppercase text-white">{x.name}</span>
                </span>
                {on && <span className="tech-mono absolute left-1.5 top-1.5 rounded bg-[#3e5ef1] px-1 text-[9px] text-white">P1</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
