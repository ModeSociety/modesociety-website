"use client";

import { useEffect, useRef, useState } from "react";

const fileUrl = (id: string) => `/api/admin/enquiries/file/${id}`;
const ZOOM = 2.5;
const LENS = 300; // the zoom window, in px

/** Where the zoom window sits: beside the cursor, flipped to the other side or clamped so it stays on screen. */
function lensBox(x: number, y: number) {
  const gap = 24;
  const left = x + gap + LENS > innerWidth ? x - gap - LENS : x + gap;
  const top = Math.min(Math.max(8, y - LENS / 2), innerHeight - LENS - 8);
  return { left: Math.max(8, left), top };
}

type Hover = { id: string; x: number; y: number; px: number; py: number; w: number; h: number };

/**
 * One lead's photos and screenshots. The grid shows small kept thumbnails; on a computer, a window
 * beside the cursor shows a zoomed view of the part under it (from the full file, loaded on first
 * hover). A click opens the image large inside the panel.
 */
export default function LeadImages({ ids, label }: { ids: string[]; label: string }) {
  const [hover, setHover] = useState<Hover | null>(null);
  const [shown, setShown] = useState<number | null>(null);
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- only known in the browser
    setCanHover(matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {ids.map((id, i) => (
          <Thumb
            key={id}
            id={id}
            n={i + 1}
            label={label}
            onHover={canHover ? (h) => setHover(h && { ...h, id }) : undefined}
            onOpen={() => {
              setHover(null);
              setShown(i);
            }}
          />
        ))}
      </div>
      {hover && <Lens hover={hover} />}
      {shown !== null && <Viewer ids={ids} index={shown} label={label} onClose={() => setShown(null)} />}
    </>
  );
}

function Thumb({
  id,
  n,
  label,
  onHover,
  onOpen,
}: {
  id: string;
  n: number;
  label: string;
  onHover?: (h: Omit<Hover, "id"> | null) => void;
  onOpen: () => void;
}) {
  const [broken, setBroken] = useState(false);
  const src = fileUrl(id);
  if (broken)
    return (
      <a href={src} target="_blank" rel="noreferrer" className="grid aspect-[3/4] place-items-center border border-line bg-paper-2 text-sm text-ink-2 underline">
        File {n} ↗
      </a>
    );
  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      className="block aspect-[3/4] cursor-zoom-in overflow-hidden border border-line bg-paper-2"
      title="Open large"
      onClick={(e) => {
        // a plain click opens it here; Ctrl/⌘-click still opens the file in a new tab
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onOpen();
      }}
      onMouseMove={(e) => {
        if (!onHover) return;
        const r = e.currentTarget.getBoundingClientRect();
        onHover({ x: e.clientX, y: e.clientY, px: (e.clientX - r.left) / r.width, py: (e.clientY - r.top) / r.height, w: r.width, h: r.height });
      }}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${src}?size=thumb`}
        alt={`${label} ${n}`}
        loading="lazy"
        decoding="async"
        onError={() => setBroken(true)}
        className="h-full w-full object-cover object-top"
      />
    </a>
  );
}

/**
 * The zoom window: the full image, enlarged, positioned so the point under the cursor is in the middle.
 * The thumbnail crops to the top of the image (object-top), so the cursor's place maps onto the full
 * image's visible part the same way.
 */
function Lens({ hover }: { hover: Hover }) {
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const loaded = useRef("");
  useEffect(() => {
    if (loaded.current === hover.id) return;
    loaded.current = hover.id;
    setNatural(null); // reset while the next image loads
    const img = new Image();
    img.onload = () => loaded.current === hover.id && setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = fileUrl(hover.id);
  }, [hover.id]);

  const { left, top } = lensBox(hover.x, hover.y);
  let style: React.CSSProperties = {};
  if (natural) {
    // the thumbnail shows the image scaled to cover its box, aligned to the top
    const cover = Math.max(hover.w / natural.w, hover.h / natural.h);
    const shownW = natural.w * cover;
    const offsetX = (shownW - hover.w) / 2;
    const bgW = shownW * ZOOM;
    const bgH = natural.h * cover * ZOOM;
    const cx = (offsetX + hover.px * hover.w) * ZOOM;
    const cy = hover.py * hover.h * ZOOM;
    style = {
      backgroundImage: `url(${fileUrl(hover.id)})`,
      backgroundSize: `${bgW}px ${bgH}px`,
      backgroundPosition: `${LENS / 2 - cx}px ${LENS / 2 - cy}px`,
    };
  }
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-50 overflow-hidden rounded-lg border border-line bg-paper-2 bg-no-repeat shadow-2xl"
      style={{ left, top, width: LENS, height: LENS, ...style }}
    >
      {!natural && <span className="grid h-full place-items-center text-xs text-muted">Loading…</span>}
    </div>
  );
}

/**
 * The image large, over the panel, in the same window. A click outside the image, the × button or
 * Esc closes it. A file that isn't an image (a PDF) shows a link to open it instead.
 */
function Viewer({ ids, index, label, onClose }: { ids: string[]; index: number; label: string; onClose: () => void }) {
  const id = ids[index];
  const [failed, setFailed] = useState("");
  const close = useRef<HTMLButtonElement>(null);
  // the latest onClose, so the set-up below runs once per opening (not on every render)
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      before?.focus();
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${label} ${index + 1} of ${ids.length}`}
      className="fixed inset-0 z-[60] grid place-items-center bg-[#0b0b0b]/85 p-4 backdrop-blur-sm md:p-10"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button
        ref={close}
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
      >
        ×
      </button>
      {failed === id ? (
        <a href={fileUrl(id)} target="_blank" rel="noreferrer" className="rounded-lg bg-white px-6 py-4 text-ink underline">
          Open {label.toLowerCase()} {index + 1} ↗
        </a>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={id}
          src={fileUrl(id)}
          alt={`${label} ${index + 1}`}
          onError={() => setFailed(id)}
          className="max-h-[86vh] max-w-full rounded-md object-contain shadow-2xl"
        />
      )}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 font-mono text-[12px] text-white/80">
        {index + 1} / {ids.length} ·{" "}
        <a href={fileUrl(id)} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          open original ↗
        </a>
      </p>
    </div>
  );
}
