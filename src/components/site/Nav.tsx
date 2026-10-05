"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { INSTAGRAM_URL, LINKEDIN_URL, MENU } from "@/lib/content";
import Dither from "./Dither";
import Logo from "./Logo";
import { InstagramIcon, LinkedInIcon } from "./Icons";


/** The grey "MENU" keycap from the brand sheet. Hovering presses it like a real key. */
function MenuKey({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} className="keycap" data-cursor="">
      <span className="keycap-face">{open ? "CLOSE" : "MENU"}</span>
    </button>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);

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
      <header className={`fixed inset-x-0 top-0 z-[100] transition-transform duration-500 ${hidden && !open ? "-translate-y-full" : ""}`}>
        <div
          className={`wrap flex h-16 items-center justify-between transition-colors duration-500 md:h-20 ${
            scrolled && !open ? "bg-paper/85 backdrop-blur-md" : ""
          }`}
        >
          <Link href="/" aria-label="Mode Society home" className={`relative z-10 ${open ? "text-white" : "text-ink"}`}>
            <Logo className="h-5 max-w-[52vw] text-[14px] sm:h-6 sm:text-[16px] md:h-7 md:text-[18px] [&>svg]:max-w-full" />
          </Link>
          <div className="relative z-10 flex items-center gap-3 md:gap-4">
            <MenuKey open={open} onClick={() => setOpen((o) => !o)} />
            <Link href="/get-in-touch" className={`btn !py-3 max-sm:!hidden ${open ? "light" : ""}`}>
              Contact us
            </Link>
          </div>
        </div>
      </header>

      {open && (
        <div
          ref={overlay}
          className="dither-bg isolate fixed inset-0 z-[99] flex flex-col justify-between overflow-y-auto px-[var(--gutter)] pb-8 pt-24 text-white"
        >
          <Dither />
          <nav className="flex flex-col gap-1">
            {[{ href: "/", label: "Home" }, ...MENU].map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className="group block overflow-hidden pb-[0.18em] pt-[0.08em] text-[clamp(24px,min(5vw,6.2svh),56px)]"
                onClick={() => setOpen(false)}
              >
                <span
                  className="menu-link font-display inline-block leading-[1.15] transition-transform duration-500 group-hover:translate-x-3"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <sup className="font-serif mr-3 align-top text-sm italic opacity-60">{String(i + 1).padStart(2, "0")}</sup>
                  {l.label}
                </span>
              </Link>
            ))}
          </nav>
          <div className="mt-10 flex items-center gap-4">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram" className="social-icon">
              <InstagramIcon />
            </a>
            {LINKEDIN_URL && (
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-icon">
                <LinkedInIcon />
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
