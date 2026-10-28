"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteImage } from "@/lib/slots";
import { embedFor } from "@/lib/video";

/**
 * A landscape intro film. From the Drive folder it plays muted on a loop as a preview while on
 * screen, and "Play with sound" restarts it with sound and controls. A YouTube or Vimeo link
 * shows its thumbnail (or a gradient) and loads the player only when someone presses play.
 */
export default function IntroVideo({
  media,
  url = "",
  label,
  className = "",
  buttonClassName = "",
}: {
  media?: SiteImage;
  url?: string;
  label: string;
  className?: string;
  buttonClassName?: string;
}) {
  const embed = embedFor(url);
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || playing) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { rootMargin: "200px 0px" });
    io.observe(v);
    return () => io.disconnect();
  }, [playing]);

  const button = (onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={`absolute bottom-4 left-4 inline-flex items-center gap-3 rounded-full px-5 py-3 text-[14px] font-medium shadow-lg transition-transform hover:scale-[1.03] md:bottom-6 md:left-6 ${buttonClassName}`}
    >
      <span aria-hidden className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-current" />
      Play with sound
    </button>
  );

  if (embed) {
    return (
      <div className={`relative aspect-video overflow-hidden ${className}`}>
        {playing ? (
          <iframe src={embed.src} title={label} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
        ) : (
          <>
            {embed.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={embed.poster} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_80%_at_30%_30%,rgba(120,150,255,0.55),transparent),linear-gradient(135deg,#1b2a7a,#6a5ae0)]" />
            )}
            {button(() => setPlaying(true))}
          </>
        )}
      </div>
    );
  }

  if (!media) return null;
  if (media.type !== "video") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={media.src} alt={media.alt || label} loading="lazy" className={`aspect-video w-full object-cover ${className}`} />;
  }
  return (
    <div className={`relative aspect-video overflow-hidden bg-black ${className}`}>
      <video
        ref={ref}
        src={media.src}
        muted={!playing}
        loop={!playing}
        controls={playing}
        playsInline
        preload="metadata"
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {!playing &&
        button(() => {
          const v = ref.current;
          if (!v) return;
          setPlaying(true);
          v.muted = false;
          v.currentTime = 0;
          v.play().catch(() => {});
        })}
    </div>
  );
}
