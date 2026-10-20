"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { INSTAGRAM_URL, MENU } from "@/lib/content";
import Logo from "./Logo";

const INLINE = MENU.filter((m) => m.href !== "/get-in-touch");

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    let last = scrollY;
    const onScroll = () => {
      const y = scrollY;
      setScrolled(y > 40);
      setHidden(y > 200 && y > last);
      last = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-[transform,background-color] duration-500 ${hidden && !open ? "-translate-y-full" : ""} ${
          scrolled && !open ? "bg-paper/85 backdrop-blur-md" : ""
        }`}
      >
        <div className="wrap flex h-16 items-center justify-between md:h-20">
          <Link href="/" aria-label="Mode Society home" className={`relative z-10 ${open ? "text-white" : "text-ink"}`}>
            <Logo className="h-9 max-w-[52vw] text-[14px] md:h-11 md:text-[18px] [&>svg]:max-w-full" />
          </Link>
          <nav className="hidden items-center gap-5 xl:flex 2xl:gap-7">
            {INLINE.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`link-underline font-mono text-[11.5px] font-medium uppercase tracking-[0.04em] ${pathname === l.href ? "bg-[length:100%_1px]" : ""}`}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/get-in-touch" className="btn !py-3">
              Contact us <span className="arrow">↗</span>
            </Link>
          </nav>
          <button
            className={`relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-[6px] xl:hidden ${open ? "text-white" : ""}`}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span className={`h-px w-6 bg-current transition-transform duration-500 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
            <span className={`h-px w-6 bg-current transition-transform duration-500 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[99] flex flex-col overflow-y-auto bg-ink px-[var(--gutter)] pb-8 pt-20 text-white">
          <div className="flex justify-between border-t border-white/30 pt-3 font-mono text-[11px] uppercase tracking-[0.04em] text-white/70">
            <span>Index</span>
            <span>Melbourne → worldwide</span>
          </div>
          <nav className="mt-4 flex flex-1 flex-col">
            {[{ href: "/", label: "Home" }, ...MENU].map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className="group block overflow-hidden border-b border-white/15 py-[0.12em] text-[clamp(30px,min(10.5vw,5.6svh),64px)]"
                onClick={() => setOpen(false)}
              >
                <span className="menu-link flex items-baseline justify-between gap-4" style={{ animationDelay: `${i * 45}ms` }}>
                  <span className="font-display leading-[1.05] transition-transform duration-500 group-hover:translate-x-2">{l.label}</span>
                  <span className="font-mono text-[11px] text-white/60">({String(i + 1).padStart(2, "0")})</span>
                </span>
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex items-end justify-between font-mono text-[12px] uppercase tracking-[0.04em] text-white/80">
            <Link href="/get-in-touch">Make an enquiry →</Link>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              Instagram ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
}
