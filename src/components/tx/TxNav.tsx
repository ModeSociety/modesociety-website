"use client";

import { useEffect, useRef, useState } from "react";
import type { SectionCopy } from "@/lib/copy";
import { TxA, useTechPaths } from "./paths";

/**
 * The frosted bar: logo and name, the 20-segment scroll "XP" meter (hidden on phones), and the
 * keycap MENU button that opens one frosted glass screen. The menu closes with ×, a click on the
 * backdrop, Esc, or any link. There is no Talent / Tech switch (Asha's design).
 */
export default function TxNav({ words }: { words: SectionCopy<"techSite.nav"> }) {
  const [open, setOpen] = useState(false);
  const [lit, setLit] = useState(0);
  const [down, setDown] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const f = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
      setLit(Math.round(f * 20));
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        button.current?.focus();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  const press = () => {
    setDown(true);
    setTimeout(() => setDown(false), 140);
    setOpen((o) => !o);
  };

  const paths = useTechPaths();
  // the home page's sections, then the Services page
  const links: [string, string][] = [
    [paths.section("#who"), words.whoLink],
    [paths.section("#campaigns"), words.campaignsLink],
    [paths.section("#services"), words.runLink],
    [paths.section("#contact"), words.contactLink],
    [paths.section("#faq"), words.faqLink],
    [paths.page("/services"), words.servicesLink],
  ].filter(([, label]) => label.trim()) as [string, string][];

  return (
    <>
      <header className="nav" id="nav">
        <div className="bar">
          <TxA className="brand" to="#top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tech/logom-gradient.png" alt="" />
            <span>
              {words.brand} <b>{words.brandAccent}</b>
            </span>
          </TxA>
          <div className="xpm" aria-hidden="true">
            <span className="mono">{words.xp}</span>
            <div className="seg">
              {Array.from({ length: 20 }, (_, i) => (
                <i key={i} className={i < lit ? "on" : ""} />
              ))}
            </div>
          </div>
          <button ref={button} className={`key ${down ? "down" : ""}`} aria-expanded={open} aria-controls="menu" onClick={press}>
            <span className="ico">
              <i />
              <i />
              <i />
            </span>
            {words.menu}
          </button>
        </div>
      </header>

      <div
        className={`menu ${open ? "open" : ""}`}
        id="menu"
        aria-hidden={!open}
        onClick={(e) => {
          if (e.target === e.currentTarget || (e.target as Element).closest("a,[data-close]")) setOpen(false);
        }}
      >
        <section className="screen" aria-label={words.menuTitle}>
          <div className="scr-top">
            <span className="mono">{words.menuTitle}</span>
            <button className="scr-x" data-close aria-label="Close menu" tabIndex={open ? 0 : -1}>
              &times;
            </button>
          </div>
          <nav className="scr-nav">
            {links.map(([href, label], i) => (
              <a key={href} className="lnk" href={href} tabIndex={open ? 0 : -1}>
                <small>{String(i + 1).padStart(2, "0")}</small>
                {label}
              </a>
            ))}
          </nav>
          <div className="scr-foot">
            <div className="row2">
              <TxA className="pill sm" to="#contact" data-tab="brand" tabIndex={open ? 0 : -1}>
                {words.brandButton} <span className="ac">→</span>
              </TxA>
              <TxA className="pill sm dark" to={paths.onHome ? "#contact" : "#apply"} data-tab="creator" tabIndex={open ? 0 : -1}>
                {words.creatorButton} <span className="ac">→</span>
              </TxA>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
