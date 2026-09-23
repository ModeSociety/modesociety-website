"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteImage } from "@/lib/slots";
import GameFrame, { fmtTime, useBest } from "./GameFrame";

const N = 3;
const BLANK = N * N - 1;
const faster = (a: number, b: number) => a < b;

const neighbours = (i: number) =>
  [i - N, i + N, i % N ? i - 1 : -1, (i + 1) % N ? i + 1 : -1].filter((j) => j >= 0 && j < N * N);

/** Scramble by making random legal moves from the solved state, so it is always solvable. */
function scramble(): number[] {
  const b = Array.from({ length: N * N }, (_, i) => i);
  let blank = BLANK;
  let prev = -1;
  for (let k = 0; k < 160; k++) {
    const opts = neighbours(blank).filter((j) => j !== prev);
    const j = opts[Math.floor(Math.random() * opts.length)];
    [b[blank], b[j]] = [b[j], b[blank]];
    prev = blank;
    blank = j;
  }
  return b.every((t, i) => t === i) ? scramble() : b;
}

/** "Editorial Puzzle": a 3×3 sliding-tile puzzle made from a talent photo. */
export default function Puzzle({ faces }: { faces: SiteImage[] }) {
  const [photo, setPhoto] = useState(0);
  const [board, setBoard] = useState<number[]>(() => Array.from({ length: N * N }, (_, i) => i));
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [doneAt, setDoneAt] = useState<number | null>(null);
  const [peek, setPeek] = useState(false);
  const [best, submitBest] = useBest("ms-puzzle-best", faster);

  const reset = useCallback(
    (nextPhoto?: number) => {
      setPhoto((p) => nextPhoto ?? p);
      setBoard(scramble());
      setMoves(0);
      setStartedAt(null);
      setDoneAt(null);
    },
    [],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- scramble client-side only
    reset(Math.floor(Math.random() * faces.length));
  }, [reset, faces.length]);

  useEffect(() => {
    if (!startedAt || doneAt) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [startedAt, doneAt]);

  const slide = useCallback(
    (pos: number) => {
      if (doneAt) return;
      const blank = board.indexOf(BLANK);
      if (!neighbours(blank).includes(pos)) return;
      const next = [...board];
      [next[blank], next[pos]] = [next[pos], next[blank]];
      setBoard(next);
      setMoves((m) => m + 1);
      const t = Date.now();
      if (!startedAt) {
        setStartedAt(t);
        setNow(t);
      }
      if (next.every((tile, i) => tile === i)) {
        setDoneAt(t);
        submitBest(t - (startedAt ?? t));
      }
    },
    [board, doneAt, startedAt, submitBest],
  );

  const onKey = (e: React.KeyboardEvent) => {
    const blank = board.indexOf(BLANK);
    const map: Record<string, number> = { ArrowUp: blank + N, ArrowDown: blank - N, ArrowLeft: blank + 1, ArrowRight: blank - 1 };
    if (e.key in map) {
      e.preventDefault();
      slide(map[e.key]);
    }
  };

  const img = faces[photo % faces.length];
  const elapsed = startedAt ? (doneAt ?? now) - startedAt : 0;

  return (
    <GameFrame
      game="Editorial Puzzle"
      title={
        <>
          Editorial <span className="font-serif italic tracking-normal">Puzzle</span>
        </>
      }
      description="Every campaign comes together piece by piece. Slide the tiles back into place to rebuild the shot. Click a tile next to the gap, or use the arrow keys."
      stats={[
        { label: "Moves", value: moves },
        { label: "Time", value: fmtTime(elapsed) },
        { label: "Best", value: best ? fmtTime(best) : "—" },
      ]}
      extra={
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            className="btn ghost !border-paper/30 !py-3 !text-paper [&::before]:!bg-paper hover:!text-ink"
            onPointerDown={() => setPeek(true)}
            onPointerUp={() => setPeek(false)}
            onPointerLeave={() => setPeek(false)}
          >
            Hold to peek
          </button>
          <button
            className="btn ghost !border-paper/30 !py-3 !text-paper [&::before]:!bg-paper hover:!text-ink"
            onClick={() => reset((photo + 1) % faces.length)}
          >
            New photo
          </button>
        </div>
      }
      onReset={() => reset()}
      win={
        doneAt
          ? {
              title: (
                <>
                  Solved in {moves} <span className="font-serif italic tracking-normal">moves</span>
                </>
              ),
              body: `${fmtTime(elapsed)} to piece together the shot. We put campaigns together just as carefully.`,
              score: `solved in ${moves} moves (${fmtTime(elapsed)})`,
            }
          : null
      }
    >
      <div className="flex min-h-[480px] items-center justify-center">
        <div
          className="relative aspect-square w-full max-w-[480px] bg-[#1a1a19] outline-none"
          tabIndex={0}
          onKeyDown={onKey}
          aria-label="Sliding puzzle. Use arrow keys to move tiles."
        >
          {board.map((tile, pos) => {
            if (tile === BLANK && !doneAt) return null;
            const row = Math.floor(pos / N);
            const col = pos % N;
            const hr = Math.floor(tile / N);
            const hc = tile % N;
            return (
              <button
                key={tile}
                onClick={() => slide(pos)}
                data-cursor="slide"
                className="absolute overflow-hidden border border-ink/60"
                style={{
                  width: `${100 / N}%`,
                  height: `${100 / N}%`,
                  transform: `translate(${col * 100}%, ${row * 100}%)`,
                  transition: "transform .22s cubic-bezier(.16,1,.3,1)",
                  borderWidth: doneAt ? 0 : 1,
                }}
                aria-label={`Tile ${tile + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt=""
                  draggable={false}
                  className="absolute max-w-none object-cover"
                  style={{ width: `${N * 100}%`, height: `${N * 100}%`, left: `${-hc * 100}%`, top: `${-hr * 100}%` }}
                />
              </button>
            );
          })}
          {peek && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img.src} alt={img.alt} className="absolute inset-0 z-10 h-full w-full object-cover" />
          )}
        </div>
      </div>
    </GameFrame>
  );
}
