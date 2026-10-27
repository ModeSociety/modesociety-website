"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SideSwitch from "@/components/site/SideSwitch";
import { TECH_MENU } from "@/lib/tech";
import { Wordmark } from "./Mark";

export default function TechNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 30);
    onScroll();
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
        className={`fixed inset-x-0 top-0 z-[100] transition-[background-color,box-shadow] duration-500 ${
          scrolled || open ? "bg-[#07080c]/80 shadow-[0_1px_0_rgba(233,236,241,0.08)] backdrop-blur-xl" : ""
        }`}
      >
        <div className="wrap flex h-16 items-center justify-between gap-6 md:h-[72px]">
          <Link href="/tech" aria-label="ModeSociety Tech home" className="relative z-10 text-white">
            <Wordmark className="h-[18px] w-auto md:h-[22px]" />
          </Link>
          <nav className="hidden items-center gap-7 xl:flex">
            {TECH_MENU.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className={`text-[14px] transition-colors hover:text-white ${pathname === l.href ? "text-white" : "text-[#aab2c0]"}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 xl:flex">
            <SideSwitch current="tech" tone="tech" />
            <Link href="/tech/contact?as=brand" className="btn !py-2.5">
              Brand enquiry
            </Link>
            <Link href="/tech/contact?as=creator" className="btn ghost !py-2.5">
              Apply to sign
            </Link>
          </div>
          <button
            className="relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-[6px] text-white xl:hidden"
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
        <div className="fixed inset-0 z-[99] flex flex-col overflow-y-auto bg-[#07080c]/95 px-[var(--gutter)] pb-8 pt-24 backdrop-blur-xl xl:hidden">
          <nav className="flex flex-col">
            {[{ href: "/tech", label: "Home" }, ...TECH_MENU].map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block overflow-hidden border-b border-white/10 py-3"
              >
                <span className="menu-link tech-display flex items-baseline justify-between text-[clamp(38px,11vw,64px)] text-white" style={{ animationDelay: `${i * 45}ms` }}>
                  {l.label}
                  <span className="tech-mono text-[11px] font-normal text-[#8c95a5]">0{i + 1}</span>
                </span>
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tech/contact?as=brand" className="btn">
              Brand enquiry
            </Link>
            <Link href="/tech/contact?as=creator" className="btn ghost">
              Apply to sign
            </Link>
          </div>
          <div className="mt-auto pt-10">
            <p className="tech-mono mb-3 text-[11px] uppercase text-[#8c95a5]">Also from Mode Society</p>
            <SideSwitch current="tech" tone="tech" />
          </div>
        </div>
      )}
    </>
  );
}
