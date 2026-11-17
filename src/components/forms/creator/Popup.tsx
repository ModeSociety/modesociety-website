"use client";

import { useEffect, useRef } from "react";

/** A pop-up over the form (the representation info, the application terms): Esc, × or a click outside closes it. */
export default function Popup({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
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
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        data-lenis-prevent
        className="relative max-h-[86vh] w-full max-w-2xl overflow-y-auto bg-paper p-6 text-ink shadow-2xl outline-none md:p-10"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center text-2xl text-ink-2 hover:text-ink">
          ×
        </button>
        <h2 className="font-display pr-10 text-3xl md:text-4xl">{title}</h2>
        <div className="mt-6 grid gap-6 text-[15px] leading-relaxed text-ink-2">{children}</div>
      </div>
    </div>
  );
}
