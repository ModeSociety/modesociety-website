"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteImage } from "@/lib/slots";
import GameFrame, { fmtTime, useBest } from "./GameFrame";

const PER_ROLL = 3;
const DEVELOPED_AT = 0.55;
const faster = (a: number, b: number) => a < b;

/** One undeveloped polaroid: rub the canvas "emulsion" away to reveal the photo. */
function Print({ image, index, onStart, onDeveloped }: { image: SiteImage; index: number; onStart: () => void; onDeveloped: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);
  const strokes = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const paint = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
      const g = c.getContext("2d")!;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const grad = g.createLinearGradient(0, 0, r.width, r.height);
      grad.addColorStop(0, "#f2ede2");
      grad.addColorStop(0.6, "#ddd4c3");
      grad.addColorStop(1, "#cfc4b0");
      g.fillStyle = grad;
      g.fillRect(0, 0, r.width, r.height);
      for (let k = 0; k < 900; k++) {
        g.fillStyle = `rgba(90,70,40,${Math.random() * 0.06})`;
        g.fillRect(Math.random() * r.width, Math.random() * r.height, 1.5, 1.5);
      }
      g.fillStyle = "rgba(60,50,35,.55)";
      g.font = "italic 17px Georgia, serif";
      g.textAlign = "center";
      g.fillText("rub to develop", r.width / 2, r.height / 2);
    };
    paint();
  }, [image.src]);

  const rub = (e: React.PointerEvent) => {
    if (done) return;
    if (e.pointerType !== "mouse" && e.buttons === 0) return;
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    const p = { x: e.clientX - r.left, y: e.clientY - r.top };
    const g = c.getContext("2d")!;
    g.globalCompositeOperation = "destination-out";
    g.lineCap = "round";
    g.lineJoin = "round";
    g.lineWidth = Math.max(28, r.width * 0.16);
    g.beginPath();
    const from = last.current ?? p;
    g.moveTo(from.x, from.y);
    g.lineTo(p.x, p.y);
    g.stroke();
    last.current = p;
    if (!started.current) {
      started.current = true;
      onStart();
    }
    if (++strokes.current % 8 === 0) {
      const { data } = g.getImageData(0, 0, c.width, c.height);
      let clear = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += 4 * 24) {
        total++;
        if (data[i] < 40) clear++;
      }
      if (clear / total > DEVELOPED_AT) {
        setDone(true);
        onDeveloped();
      }
    }
  };

  return (
    <div className="polaroid !relative !w-full" style={{ transform: `rotate(${[-3, 2, -1.5][index % 3]}deg)` }}>
      <span className="pin" style={{ ["--pin-color" as string]: ["#c3362b", "#b08d57", "#1b1b1b"][index % 3] }} />
      <div className="photo" data-cursor={done ? undefined : "rub"}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          draggable={false}
          style={{
            filter: done ? "none" : "sepia(1) contrast(.75) brightness(1.25)",
            transition: "filter 1.6s ease",
          }}
        />
        <canvas
          ref={canvas}
          className="absolute inset-0 h-full w-full touch-none"
          style={{ opacity: done ? 0 : 1, transition: "opacity 1.2s ease" }}
          onPointerMove={rub}
          onPointerDown={(e) => {
            last.current = null;
            rub(e);
          }}
          onPointerLeave={() => (last.current = null)}
        />
      </div>
      <div className="caption">
        <span>{done ? "Developed" : "Undeveloped"}</span>
        <span className="opacity-60">No. {String(index + 1).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

/** "Darkroom": develop each roll of polaroids by rubbing them. */
export default function Darkroom({ faces }: { faces: SiteImage[] }) {
  const rolls = Math.max(1, Math.ceil(Math.min(faces.length, 6) / PER_ROLL));
  const total = Math.min(faces.length, rolls * PER_ROLL);
  const [roll, setRoll] = useState(0);
  const [developed, setDeveloped] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [doneAt, setDoneAt] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);
  const [best, submitBest] = useBest("ms-darkroom-best", faster);

  useEffect(() => {
    if (!startedAt || doneAt) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [startedAt, doneAt]);

  const reset = useCallback(() => {
    setRoll(0);
    setDeveloped(0);
    setStartedAt(null);
    setDoneAt(null);
    setNonce((n) => n + 1);
  }, []);

  const onStart = useCallback(() => {
    setStartedAt((s) => {
      if (s) return s;
      const t = Date.now();
      setNow(t);
      return t;
    });
  }, []);

  const onDeveloped = useCallback(() => {
    setDeveloped((d) => d + 1);
  }, []);

  // Advance to the next roll / finish once every print on this roll is developed.
  useEffect(() => {
    const needed = Math.min(total, (roll + 1) * PER_ROLL);
    if (developed < needed || developed === 0) return;
    if (developed >= total) {
      const t = Date.now();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to the last print developing
      setDoneAt(t);
      if (startedAt) submitBest(t - startedAt);
      return;
    }
    const timer = setTimeout(() => setRoll((r) => r + 1), 1400);
    return () => clearTimeout(timer);
  }, [developed, roll, total, startedAt, submitBest]);

  const prints = faces.slice(roll * PER_ROLL, roll * PER_ROLL + PER_ROLL);
  const elapsed = startedAt ? (doneAt ?? now) - startedAt : 0;

  return (
    <GameFrame
      game="Darkroom"
      title={
        <>
          The <span className="font-serif italic tracking-normal">Darkroom</span>
        </>
      }
      description="Every good shot starts undeveloped. Rub each polaroid to bring the photo through, then finish the roll as fast as you can."
      stats={[
        { label: "Developed", value: `${developed}/${total}` },
        { label: "Time", value: fmtTime(elapsed) },
        { label: "Best", value: best ? fmtTime(best) : "—" },
      ]}
      extra={<p className="mt-8 text-sm text-paper/50">Roll {roll + 1} of {rolls}</p>}
      onReset={reset}
      resetLabel="New roll"
      win={
        doneAt
          ? {
              title: (
                <>
                  Roll developed <span className="font-serif italic tracking-normal">in</span> {fmtTime(elapsed)}
                </>
              ),
              body: "Picture perfect. Now let's put real faces in front of your brand.",
              score: `developed ${total} prints in ${fmtTime(elapsed)}`,
            }
          : null
      }
    >
      <div key={`${nonce}-${roll}`} className="grid min-h-[480px] grid-cols-2 items-center gap-6 sm:grid-cols-3 md:gap-8">
        {prints.map((img, i) => (
          <Print key={`${nonce}-${roll}-${i}`} image={img} index={roll * PER_ROLL + i} onStart={onStart} onDeveloped={onDeveloped} />
        ))}
      </div>
    </GameFrame>
  );
}
