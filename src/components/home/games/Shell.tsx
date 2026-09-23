"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteImage } from "@/lib/slots";
import GameFrame, { useBest } from "./GameFrame";

type Phase = "idle" | "show" | "shuffle" | "pick" | "right" | "wrong";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const higher = (a: number, b: number) => a > b;

function pickThree(faces: SiteImage[]) {
  const a = [...faces].sort(() => Math.random() - 0.5);
  return a.slice(0, 3);
}

/** "Eye on the Talent": follow the starred polaroid while the cards shuffle. */
export default function Shell({ faces }: { faces: SiteImage[] }) {
  const [cards, setCards] = useState<SiteImage[]>(faces.slice(0, 3));
  const [slots, setSlots] = useState([0, 1, 2]); // slots[card] = position
  const [target, setTarget] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [faceUp, setFaceUp] = useState<boolean[]>([true, true, true]);
  const [level, setLevel] = useState(1);
  const [speed, setSpeed] = useState(500);
  const [moving, setMoving] = useState<number[]>([]);
  const [best, submitBest] = useBest("ms-shell-best", higher);
  const run = useRef(0);

  useEffect(() => () => void (run.current += 1), []);

  const play = useCallback(
    async (lvl: number) => {
      const id = ++run.current;
      const alive = () => run.current === id;
      const nextCards = pickThree(faces);
      const t = Math.floor(Math.random() * 3);
      const dur = Math.max(170, 520 - (lvl - 1) * 55);
      setCards(nextCards);
      setTarget(t);
      setSlots([0, 1, 2]);
      setSpeed(dur);
      setFaceUp([true, true, true]);
      setPhase("show");
      await sleep(1500);
      if (!alive()) return;
      setFaceUp([false, false, false]);
      await sleep(650);
      if (!alive()) return;
      setPhase("shuffle");
      let pos = [0, 1, 2];
      const swaps = 3 + lvl * 2;
      for (let s = 0; s < swaps; s++) {
        const a = Math.floor(Math.random() * 3);
        const b = (a + 1 + Math.floor(Math.random() * 2)) % 3;
        const ca = pos.indexOf(a);
        const cb = pos.indexOf(b);
        pos = pos.map((p, card) => (card === ca ? b : card === cb ? a : p));
        setMoving([ca, cb]);
        setSlots(pos);
        await sleep(dur + 40);
        if (!alive()) return;
      }
      setMoving([]);
      setPhase("pick");
    },
    [faces],
  );

  const choose = (card: number) => {
    if (phase !== "pick") return;
    const correct = card === target;
    setFaceUp((f) => f.map((v, i) => v || i === card || (!correct && i === target)));
    if (correct) {
      setPhase("right");
      submitBest(level);
      setTimeout(() => {
        setLevel((l) => l + 1);
        play(level + 1);
      }, 1300);
    } else {
      setPhase("wrong");
    }
  };

  const restart = () => {
    setLevel(1);
    play(1);
  };

  const streak = phase === "wrong" ? level - 1 : level - (phase === "right" ? 0 : 1);
  const status: Record<Phase, string> = {
    idle: "Press start, then watch the starred polaroid.",
    show: "Remember the starred one…",
    shuffle: "Keep your eye on it…",
    pick: "Where did it go? Pick a card.",
    right: "Spot on! Next level…",
    wrong: "Not quite.",
  };

  return (
    <GameFrame
      game="Eye on the Talent"
      eyebrow="A little game"
      title={
        <>
          Eye on the <span className="font-serif italic tracking-normal">Talent</span>
        </>
      }
      description="A good agent never loses track of their talent. Watch the starred polaroid, follow it through the shuffle, then pick it out. Every level is faster."
      stats={[
        { label: "Level", value: level },
        { label: "Streak", value: Math.max(0, streak) },
        { label: "Best", value: best ?? "—" },
      ]}
      onReset={phase === "idle" ? undefined : restart}
      resetLabel="Start over"
      win={
        phase === "wrong"
          ? {
              title: level - 1 > 0 ? `Streak of ${level - 1}` : "Lost in the crowd",
              body: "Tracking talent is our job, not yours. Let us keep an eye on the right faces for your brand.",
              score: `reached level ${level}`,
            }
          : null
      }
    >
      <div className="flex min-h-[480px] flex-col justify-center gap-10">
        <p className="font-serif text-center text-2xl italic text-paper/80" aria-live="polite">
          {status[phase]}
        </p>
        <div className="relative mx-auto aspect-[3/1.45] w-full max-w-[760px]">
          {cards.map((img, card) => (
            <button
              key={card}
              onClick={() => choose(card)}
              disabled={phase !== "pick"}
              data-cursor={phase === "pick" ? "pick" : undefined}
              className={`flip absolute top-0 w-[30%] ${faceUp[card] ? "" : "flipped"}`}
              style={{
                left: `${slots[card] * 35}%`,
                aspectRatio: "4 / 5",
                transition: `left ${speed}ms cubic-bezier(.65,0,.35,1), transform ${speed}ms`,
                transform: moving.includes(card) ? `translateY(${moving[0] === card ? -18 : 18}px) scale(1.03)` : undefined,
                zIndex: moving[0] === card ? 3 : 1,
              }}
              aria-label={`Card ${slots[card] + 1}`}
            >
              {/* front = photo, back = card back (reuses .flip where "flipped" shows the back face) */}
              <div className="flip-inner">
                <div className="flip-face overflow-hidden bg-paper p-[6%] pb-[14%] shadow-[0_20px_40px_-20px_rgba(0,0,0,.8)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} className="h-full w-full object-cover" draggable={false} />
                  {card === target && (phase !== "shuffle" && phase !== "pick") && (
                    <span className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-[var(--brass)] text-lg text-ink shadow">★</span>
                  )}
                </div>
                <div className="flip-face flip-back grid place-items-center border border-paper/15 bg-[#1a1a19]">
                  <span className="font-display text-lg text-paper/70">MS</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          {phase === "idle" && (
            <button className="btn light" onClick={restart}>
              Start <span className="arrow">→</span>
            </button>
          )}
        </div>
      </div>
    </GameFrame>
  );
}
