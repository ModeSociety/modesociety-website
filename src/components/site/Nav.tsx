"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import type { SiteImage } from "@/lib/slots";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/work-with-us", label: "For brands" },
  { href: "/apply-to-be-a-creator", label: "For talent" },
  { href: "/contact", label: "Contact" },
];

export function Wordmark({ logo, className = "" }: { logo?: SiteImage; className?: string }) {
  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo.src} alt={logo.alt || "Mode Society"} className={`h-7 w-auto ${className}`} />;
  }
  return <span className={`font-display text-[15px] tracking-tight md:text-[17px] ${className}`}>MODE SOCIETY</span>;
}

export default function Nav({ logo }: { logo?: SiteImage }) {
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
    if (!open || !overlay.current) return;
    const tween = gsap.from(overlay.current.querySelectorAll(".menu-link"), {
      yPercent: 110,
      duration: 0.9,
      ease: "expo.out",
      stagger: 0.06,
    });
    return () => {
      tween.revert();
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-transform duration-500 ${hidden && !open ? "-translate-y-full" : ""}`}
      >
        <div
          className={`wrap flex h-16 items-center justify-between transition-colors duration-500 md:h-20 ${
            scrolled && !open ? "bg-paper/80 backdrop-blur-md" : ""
          }`}
        >
          <Link href="/" aria-label="Mode Society home" className="relative z-10">
            <Wordmark logo={logo} className={open ? "text-paper" : ""} />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`link-underline text-[12px] uppercase tracking-[0.18em] ${pathname === l.href ? "bg-[length:100%_1px]" : ""}`}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/work-with-us" className="btn !py-3">
              Get in touch
            </Link>
          </nav>
          <button
            className={`relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-[6px] md:hidden ${open ? "text-paper" : ""}`}
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
        <div ref={overlay} className="fixed inset-0 z-[99] flex flex-col justify-between bg-ink px-[var(--gutter)] pb-10 pt-28 text-paper">
          <nav className="flex flex-col gap-2">
            {[{ href: "/", label: "Home" }, ...LINKS].map((l, i) => (
              <Link key={l.href} href={l.href} className="reveal-line">
                <span className="menu-link font-display text-[11vw] leading-[1.2]">
                  <sup className="font-serif mr-3 align-top text-sm italic opacity-50">0{i + 1}</sup>
                  {l.label}
                </span>
              </Link>
            ))}
          </nav>
          <div className="flex items-end justify-between text-sm opacity-70">
            <a href="mailto:pr@modesociety.com.au">pr@modesociety.com.au</a>
            <a href="https://instagram.com/modesocietyagency" target="_blank" rel="noreferrer">
              Instagram ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
}
