"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteImage } from "@/lib/slots";
import GameFrame from "./GameFrame";

const GOAL = 3;
const THRESHOLD = 110;

function shuffled<T>(list: T[]) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** "The Shortlist": swipe right to cast, left to pass, until three are shortlisted. */
export default function Shortlist({ faces }: { faces: SiteImage[] }) {
  const [deck, setDeck] = useState<SiteImage[]>([]);
  const [index, setIndex] = useState(0);
  const [cast, setCast] = useState<SiteImage[]>([]);
  const [passed, setPassed] = useState(0);
  const top = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; dx: number; dy: number; id: number } | null>(null);
  const flying = useRef(false);

  const reset = useCallback(() => {
    setDeck(shuffled(faces).slice(0, 12));
    setIndex(0);
    setCast([]);
    setPassed(0);
  }, [faces]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shuffle client-side only
    reset();
  }, [reset]);

  const done = cast.length >= GOAL || (deck.length > 0 && index >= deck.length);

  const paint = (dx: number, dy: number, animate = false) => {
    const el = top.current;
    if (!el) return;
    el.style.transition = animate ? "transform .45s cubic-bezier(.16,1,.3,1)" : "none";
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.06}deg)`;
    el.style.setProperty("--cast", String(Math.max(0, Math.min(1, dx / THRESHOLD))));
    el.style.setProperty("--pass", String(Math.max(0, Math.min(1, -dx / THRESHOLD))));
  };

  const decide = useCallback(
    (dir: 1 | -1) => {
      if (flying.current || done) return;
      const card = deck[index];
      if (!card) return;
      flying.current = true;
      paint(dir * (window.innerWidth * 0.7), -40, true);
      setTimeout(() => {
        if (dir === 1) setCast((c) => [...c, card]);
        else setPassed((p) => p + 1);
        setIndex((i) => i + 1);
        flying.current = false;
      }, 320);
    },
    [deck, index, done],
  );

  // New top card starts centred.
  useEffect(() => {
    paint(0, 0);
  }, [index]);

  const onDown = (e: React.PointerEvent) => {
    if (flying.current) return;
    drag.current = { x: e.clientX, y: e.clientY, dx: 0, dy: 0, id: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    d.dx = e.clientX - d.x;
    d.dy = (e.clientY - d.y) * 0.4;
    paint(d.dx, d.dy);
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (Math.abs(d.dx) > THRESHOLD) decide(d.dx > 0 ? 1 : -1);
    else paint(0, 0, true);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") decide(1);
    if (e.key === "ArrowLeft") decide(-1);
  };

  const seen = cast.length + passed;
  const visible = deck.slice(index, index + 3);

  return (
    <GameFrame
      game="The Shortlist"
      title={
        <>
          The <span className="font-serif italic tracking-normal">Shortlist</span>
        </>
      }
      description="You're the casting director. Swipe right to cast, left to pass (or use the buttons or arrow keys). Shortlist three faces for your campaign."
      stats={[
        { label: "Cast", value: `${cast.length}/${GOAL}` },
        { label: "Passed", value: passed },
        { label: "Seen", value: seen },
      ]}
      extra={
        <div className="mt-8 flex items-center gap-3">
          <span className="text-sm text-paper/50">Shortlist</span>
          <div className="flex gap-2">
            {Array.from({ length: GOAL }).map((_, i) => (
              <span key={i} className="h-14 w-11 overflow-hidden border border-paper/20 bg-paper/5">
                {cast[i] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cast[i].src} alt="" className="h-full w-full object-cover" />
                )}
              </span>
            ))}
          </div>
        </div>
      }
      onReset={reset}
      resetLabel="New deck"
      win={
        done
          ? {
              title: cast.length >= GOAL ? "Shortlist locked in." : `You cast ${cast.length}.`,
              body:
                cast.length >= GOAL
                  ? "Decisive. That's exactly how we cast, with fit over follower count. Let's do it for real."
                  : "Picky, we like it. Tell us what you're looking for and we'll find the right faces.",
              score: `shortlisted ${cast.length} of ${seen}`,
            }
          : null
      }
    >
      <div className="flex min-h-[520px] flex-col items-center justify-center gap-8 outline-none" tabIndex={0} onKeyDown={onKey}>
        <div className="relative h-[420px] w-[300px] max-w-[80vw]">
          {visible
            .map((img, k) => ({ img, k }))
            .reverse()
            .map(({ img, k }) => (
              <div
                key={`${index + k}-${img.src}`}
                ref={k === 0 ? top : undefined}
                className="polaroid !absolute inset-x-0 mx-auto select-none"
                data-cursor={k === 0 ? "swipe" : undefined}
                style={{
                  ["--w" as string]: "300px",
                  maxWidth: "80vw",
                  zIndex: 10 - k,
                  transform: k === 0 ? undefined : `translateY(${k * 14}px) scale(${1 - k * 0.05}) rotate(${k % 2 ? 2 : -2}deg)`,
                  opacity: k === 2 ? 0.6 : 1,
                  cursor: k === 0 ? "grab" : undefined,
                  touchAction: "none",
                }}
                onPointerDown={k === 0 ? onDown : undefined}
                onPointerMove={k === 0 ? onMove : undefined}
                onPointerUp={k === 0 ? onUp : undefined}
                onPointerCancel={k === 0 ? onUp : undefined}
              >
                <span className="pin" />
                <div className="photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} draggable={false} />
                  {k === 0 && (
                    <>
                      <span
                        className="font-display absolute left-4 top-6 -rotate-12 border-4 border-[var(--brass)] px-3 py-1 text-2xl text-[var(--brass)]"
                        style={{ opacity: "var(--cast, 0)" }}
                      >
                        CAST
                      </span>
                      <span
                        className="font-display absolute right-4 top-6 rotate-12 border-4 border-pin px-3 py-1 text-2xl text-pin"
                        style={{ opacity: "var(--pass, 0)" }}
                      >
                        PASS
                      </span>
                    </>
                  )}
                </div>
                <div className="caption">
                  <span>No. {String(index + k + 1).padStart(2, "0")}</span>
                  <span className="opacity-60">{deck.length - index - k} left</span>
                </div>
              </div>
            ))}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => decide(-1)} className="grid h-14 w-14 place-items-center rounded-full border border-paper/30 text-xl transition hover:border-pin hover:text-pin" aria-label="Pass">
            ✕
          </button>
          <span className="text-xs uppercase tracking-[0.18em] text-paper/40">Pass · Cast</span>
          <button onClick={() => decide(1)} className="grid h-14 w-14 place-items-center rounded-full border border-paper/30 text-xl transition hover:border-[var(--brass)] hover:text-[var(--brass)]" aria-label="Cast">
            ★
          </button>
        </div>
      </div>
    </GameFrame>
  );
}
