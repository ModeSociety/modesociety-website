"use client";

import { useRef } from "react";
import { responsive } from "@/lib/img";
import { PLATFORMS, compact, parseFollowers, totalFollowers, type RosterMember } from "@/lib/tech";
import CountUp from "./CountUp";
import { SampleTag } from "./ui";

/**
 * One creator: photo, name and @, type and niche, total followers and each channel
 * (linked when there's a URL). Tilts toward the cursor with a glare.
 */
export default function RosterCard({
  m,
  sample = false,
  compactLayout = false,
  heading: H = "h3",
}: {
  m: RosterMember;
  sample?: boolean;
  compactLayout?: boolean;
  heading?: "h2" | "h3";
}) {
  const ref = useRef<HTMLElement>(null);
  const total = totalFollowers(m);
  const channels = PLATFORMS.filter((p) => m.platforms[p.id]);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--tx", `${(-y * 6).toFixed(2)}deg`);
    el.style.setProperty("--ty", `${(x * 8).toFixed(2)}deg`);
  };
  const reset = () => {
    ref.current?.style.setProperty("--tx", "0deg");
    ref.current?.style.setProperty("--ty", "0deg");
  };

  return (
    <article
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="t-panel group flex h-full flex-col p-3 transition-transform duration-300 ease-out"
      style={{ transform: "perspective(900px) rotateX(var(--tx, 0deg)) rotateY(var(--ty, 0deg))" }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-tsurface2">
        {m.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            {...responsive(m.photo, "(max-width: 767px) 50vw, 25vw", 828)}
            alt={`${m.name}${m.handle ? ` (@${m.handle})` : ""}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div aria-hidden className="grid h-full w-full place-items-center bg-[radial-gradient(80%_70%_at_50%_20%,rgba(75,111,245,0.35),transparent_70%),repeating-linear-gradient(135deg,rgba(255,255,255,0.025)_0_10px,transparent_10px_20px)]">
            <span className="tech-display -mt-[22%] text-[64px] text-t/25">{m.name.slice(0, 1)}</span>
          </div>
        )}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-tground to-transparent" />
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <div>
            <span className="tech-display block text-[clamp(32px,3vw,40px)] text-taccent">{total ? <CountUp value={total} /> : "—"}</span>
            <span className="tech-mono text-[10px] uppercase text-t2">Total followers</span>
          </div>
          {sample && <SampleTag />}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <p className="tech-mono text-[10px] uppercase text-t3">
          {m.type}
          {m.region ? ` · ${m.region}` : ""}
        </p>
        <H className="tech-display mt-1 text-[30px] text-t">{m.name}</H>
        {m.handle && <p className="tech-mono text-[12px] text-taccent">@{m.handle}</p>}
        {m.niche && !compactLayout && <p className="mt-2 text-[14px] text-t2">{m.niche}</p>}
        {channels.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {channels.map((p) => {
              const c = m.platforms[p.id]!;
              const inner = (
                <>
                  {p.label}
                  {c.followers && <span className="text-t">{compact(parseFollowers(c.followers))}</span>}
                </>
              );
              const cls =
                "tech-mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] uppercase text-t2 shadow-[inset_0_0_0_1px_rgba(10,18,56,0.14)]";
              return (
                <li key={p.id}>
                  {c.url && !sample ? (
                    <a href={c.url} target="_blank" rel="noreferrer" className={`${cls} transition-colors hover:text-t hover:shadow-[inset_0_0_0_1px_rgba(62,94,241,0.6)]`} aria-label={`${m.name} on ${p.label}`}>
                      {inner}
                    </a>
                  ) : (
                    <span className={cls}>{inner}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </article>
  );
}

