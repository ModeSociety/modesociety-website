"use client";

import Link from "next/link";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

type Page = { key: string; body: React.ReactNode };

const PAGES: Page[] = [
  {
    key: "cover",
    body: (
      <>
        <p className="notepad-title">
          Not your
          <br />
          average
          <br />
          talent
          <br />
          agency.
        </p>
        <p className="notepad-small">Fashion · Beauty · Gaming · Lifestyle</p>
      </>
    ),
  },
  {
    key: "what",
    body: (
      <>
        <p className="notepad-small">What we do</p>
        <ul className="notepad-list">
          <li>Influencer campaigns</li>
          <li>UGC content</li>
          <li>Event guest lists</li>
          <li>Funding</li>
        </ul>
      </>
    ),
  },
  {
    key: "fit",
    body: (
      <>
        <p className="notepad-title">
          Fit over
          <br />
          follower
          <br />
          count.
        </p>
        <p className="notepad-small">Creators your customers actually trust.</p>
      </>
    ),
  },
  {
    key: "cta",
    body: (
      <>
        <p className="notepad-title">
          Let&apos;s work
          <br />
          together.
        </p>
        <div className="mt-4 flex flex-col items-start gap-2">
          <Link href="/work-with-us" className="btn !px-4 !py-2.5 !text-[10px]">
            For brands →
          </Link>
          <Link href="/apply-to-be-a-creator" className="btn ghost !px-4 !py-2.5 !text-[10px]">
            For talent →
          </Link>
        </div>
      </>
    ),
  },
];

/**
 * The "Not your average talent agency." notepad. Pages flip up like a top-bound pad:
 * click to flip, and once `autoFlip` is on (after the polaroids drop) it pages itself.
 */
const Notepad = forwardRef<HTMLDivElement, { autoFlip: boolean }>(function Notepad({ autoFlip }, ref) {
  const [page, setPage] = useState(0);
  const next = useCallback(() => setPage((p) => (p + 1) % PAGES.length), []);

  useEffect(() => {
    if (!autoFlip || prefersReducedMotion()) return;
    const t = setInterval(next, 3800);
    return () => clearInterval(t);
  }, [autoFlip, next]);

  return (
    <div ref={ref} className="notepad" data-cursor="flip" onClick={next} role="button" tabIndex={0} aria-label="Flip the notepad page"
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), next())}
    >
      <span className="notepad-rings" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="notepad-ring" style={{ left: `${[8, 14, 20, 76, 82, 88][i]}%` }} />
        ))}
      </span>
      <span className="notepad-clip notepad-clip-left" aria-hidden />
      <span className="notepad-clip notepad-clip-right" aria-hidden />
      <span className="notepad-tape" aria-hidden />
      <div className="notepad-stack">
        {PAGES.map((p, i) => {
          // pages before the current one are flipped up and over the rings
          const flipped = i < page;
          return (
            <div
              key={p.key}
              className={`notepad-page ${flipped ? "flipped" : ""}`}
              style={{ zIndex: PAGES.length - i }}
              aria-hidden={i !== page}
            >
              <div className="notepad-page-inner">{p.body}</div>
            </div>
          );
        })}
      </div>
      <span className="notepad-hint">{page + 1} / {PAGES.length}</span>
    </div>
  );
});

export default Notepad;
