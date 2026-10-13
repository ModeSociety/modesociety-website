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
          <nav className="hidden items-center gap-6 xl:flex">
            {INLINE.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`link-underline text-[12px] uppercase tracking-[0.14em] ${pathname === l.href ? "bg-[length:100%_1px]" : ""}`}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/get-in-touch" className="btn !py-3">
              Contact us
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
        <div className="fixed inset-0 z-[99] flex flex-col justify-between overflow-y-auto bg-ink px-[var(--gutter)] pb-10 pt-24 text-white">
          <nav className="flex flex-col gap-1">
            {[{ href: "/", label: "Home" }, ...MENU].map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className="block overflow-hidden pb-[0.18em] pt-[0.08em] text-[clamp(26px,min(8vw,6.2svh),56px)]"
                onClick={() => setOpen(false)}
              >
                <span className="menu-link font-display flex items-start leading-[1.15]" style={{ animationDelay: `${i * 50}ms` }}>
                  <span className="font-serif mr-3 mt-[0.2em] text-sm italic opacity-60">{String(i + 1).padStart(2, "0")}</span>
                  <span>{l.label}</span>
                </span>
              </Link>
            ))}
          </nav>
          <div className="mt-10 flex items-end justify-between text-sm opacity-80">
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
