"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import type { SiteImage } from "@/lib/slots";
import GameFrame, { fmtTime, useBest } from "./GameFrame";

type Card = { id: number; face: number; matched: boolean };

function deal(pairs: number): Card[] {
  const faces = Array.from({ length: pairs }, (_, i) => [i, i]).flat();
  for (let i = faces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [faces[i], faces[j]] = [faces[j], faces[i]];
  }
  return faces.map((face, id) => ({ id, face, matched: false }));
}

const faster = (a: number, b: number) => a < b;

/** "The Casting Call": a memory match game. Matched faces become the visitor's cast. */
export default function Memory({ faces }: { faces: SiteImage[] }) {
  const pairs = Math.min(6, faces.length);
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [doneAt, setDoneAt] = useState<number | null>(null);
  const [best, submitBest] = useBest("ms-casting-best", faster);
  const board = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setCards(deal(pairs));
    setOpen([]);
    setMoves(0);
    setStartedAt(null);
    setDoneAt(null);
  }, [pairs]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shuffle client-side only so SSR markup stays deterministic
    reset();
  }, [reset]);

  useEffect(() => {
    if (!startedAt || doneAt) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [startedAt, doneAt]);

  const flip = (idx: number) => {
    const c = cards[idx];
    if (!c || c.matched || open.includes(idx) || open.length === 2 || doneAt) return;
    if (!startedAt) {
      // eslint-disable-next-line react-hooks/purity -- runs in a click handler, not during render
      const t = Date.now();
      setStartedAt(t);
      setNow(t);
    }
    const next = [...open, idx];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next;
    if (cards[a].face === cards[b].face) {
      setTimeout(() => {
        const updated = cards.map((x, i) => (i === a || i === b ? { ...x, matched: true } : x));
        setCards(updated);
        setOpen([]);
        const els = board.current?.querySelectorAll<HTMLElement>(`[data-idx="${a}"], [data-idx="${b}"]`);
        if (els) gsap.fromTo(els, { scale: 1.08 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" });
        if (updated.every((x) => x.matched)) {
          const end = Date.now();
          setDoneAt(end);
          submitBest(end - (startedAt ?? end));
        }
      }, 450);
    } else {
      setTimeout(() => setOpen([]), 900);
    }
  };

  const elapsed = startedAt ? (doneAt ?? now) - startedAt : 0;
  const matchedFaces = useMemo(() => Array.from(new Set(cards.filter((c) => c.matched).map((c) => c.face))), [cards]);

  if (pairs < 2) return null;

  return (
    <GameFrame
      game="Casting Call"
      title={
        <>
          The Casting <span className="font-serif italic tracking-normal">Call</span>
        </>
      }
      description="Casting is all about the right match. Flip the cards and pair up the faces. Every pair you find joins your cast."
      stats={[
        { label: "Time", value: fmtTime(elapsed) },
        { label: "Moves", value: moves },
        { label: "Best", value: best ? fmtTime(best) : "—" },
      ]}
      extra={
        <div className="mt-8 flex items-center gap-3">
          <span className="text-sm text-paper/50">Your cast</span>
          <div className="flex -space-x-3">
            {Array.from({ length: pairs }).map((_, i) => {
              const f = matchedFaces[i];
              return (
                <span key={i} className="h-10 w-10 overflow-hidden rounded-full border-2 border-ink bg-paper/10">
                  {f !== undefined && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={faces[f].src} alt="" className="h-full w-full object-cover" />
                  )}
                </span>
              );
            })}
          </div>
        </div>
      }
      onReset={reset}
      win={
        doneAt
          ? {
              title: (
                <>
                  {fmtTime(elapsed)} <span className="font-serif italic tracking-normal">in</span> {moves} moves
                </>
              ),
              body: "Nicely cast. Now let us find the real thing for your brand.",
              score: `${fmtTime(elapsed)} in ${moves} moves`,
            }
          : null
      }
    >
      <div ref={board} className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:gap-3">
        {cards.map((c, i) => {
          const shown = c.matched || open.includes(i);
          return (
            <button
              key={c.id}
              data-idx={i}
              data-cursor={shown ? "" : "flip"}
              onClick={() => flip(i)}
              className={`flip aspect-[4/5] ${shown ? "flipped" : ""}`}
              aria-label={shown ? `Card ${i + 1}, face ${c.face + 1}` : `Card ${i + 1}, face down`}
            >
              <div className="flip-inner">
                <div className="flip-face grid place-items-center border border-paper/15 bg-[#1a1a19] transition-colors hover:border-paper/40">
                  <span className="font-display text-sm tracking-tight text-paper/70 md:text-lg">MS</span>
                  <span className="font-serif absolute bottom-2 right-3 text-xs italic text-paper/30">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className={`flip-face flip-back overflow-hidden ${c.matched ? "ring-2 ring-[var(--brass)]" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={faces[c.face].src} alt={faces[c.face].alt} className="h-full w-full object-cover" loading="lazy" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </GameFrame>
  );
}
