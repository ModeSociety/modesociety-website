"use client";

import { useEffect, useRef, useState } from "react";
import IntroVideo from "@/components/site/IntroVideo";
import type { SectionCopy } from "@/lib/copy";
import { drivePlayer, embedFor } from "@/lib/video";

/** The built-in welcome film: a lighter cut for phones, and the frame shown before it loads. */
const BUILT_IN: Record<string, { phone: string; poster: string }> = {
  "/tech/welcome-1080.mp4": { phone: "/tech/welcome-720.mp4", poster: "/tech/welcome-poster.jpg" },
};

/**
 * The welcome film under the hero, in a frosted glass frame with the design's pixel corners. A video
 * file plays muted on a loop while on screen (not for people who prefer less motion); the button plays
 * it from the start with sound and controls. A YouTube or Vimeo link loads its player on play, and a
 * Google Drive link plays in Drive's own player.
 */
export default function Film({ copy: c }: { copy: SectionCopy<"techSite.film"> }) {
  const url = c.videoUrl.trim();
  const file = /^\/[\w./-]+\.(mp4|webm|mov)$/i.test(url) || /^https?:\/\/[^\s]+\.(mp4|webm|mov)(\?|$)/i.test(url) ? url : null;
  const built = file ? BUILT_IN[file] : undefined;
  const drive = !file && drivePlayer(url);
  const embed = !file && !drive && embedFor(url);
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || playing || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { rootMargin: "200px 0px" });
    io.observe(v);
    return () => io.disconnect();
  }, [playing]);

  if (!file && !drive && !embed) return null;
  const label = c.label || "Welcome to ModeSociety Tech";

  return (
    <section className="film" aria-label={label}>
      <div className="wrap">
        {c.label && <span className="mono film-label">{c.label}</span>}
        <div className="frame rv">
          {file ? (
            <div className="screen-v">
              <video ref={ref} muted={!playing} loop={!playing} controls={playing} playsInline preload="metadata" poster={built?.poster} aria-label={label}>
                {built && <source src={built.phone} media="(max-width: 760px)" type="video/mp4" />}
                <source src={file} type="video/mp4" />
              </video>
              {!playing && (
                <button
                  type="button"
                  className="pill play"
                  onClick={() => {
                    const v = ref.current;
                    if (!v) return;
                    setPlaying(true);
                    v.muted = false;
                    v.currentTime = 0;
                    v.play().catch(() => {});
                  }}
                >
                  {c.play} <span className="ac">▶</span>
                </button>
              )}
            </div>
          ) : drive ? (
            <div className="screen-v">
              <iframe src={drive} title={label} allow="autoplay; fullscreen" allowFullScreen loading="lazy" />
            </div>
          ) : (
            <IntroVideo url={url} label={label} className="screen-v" buttonClassName="bg-[#C8FF2E] text-[#0D1240]" />
          )}
        </div>
      </div>
    </section>
  );
}
