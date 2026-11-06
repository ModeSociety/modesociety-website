"use client";

import { Suspense, useEffect, useState } from "react";
import NavProgress from "@/components/site/NavProgress";
import Tracker from "@/components/site/Tracker";
import type { SectionCopy } from "@/lib/copy";

/** Asks the contact form to open on a tab (any element with data-tab="brand|creator" sends it). */
export const TAB_EVENT = "tx:tab";

/**
 * Wraps the Tech page (Asha's v3.5 design): the boot-style loader, scroll reveals (.rv → .in), the hero
 * logo parallax, and the data-tab buttons that open the form on the right tab. Everything stays put for
 * people who prefer less motion.
 */
export default function TxShell({ words, children }: { words: SectionCopy<"techSite.nav">; children: React.ReactNode }) {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  // loader: a block progress bar, then the page (skipped inside the admin's preview frame)
  useEffect(() => {
    const root = document.querySelector(".tx");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.top !== window.self || reduce) {
      root?.classList.add("ready");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- straight through, no loader
      setDone(true);
      return;
    }
    let p = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      p = Math.min(100, p + 5 + Math.random() * 10);
      setPct(p);
      if (p < 100) t = setTimeout(tick, 40);
      else
        t = setTimeout(() => {
          setDone(true);
          root?.classList.add("ready");
        }, 160);
    };
    tick();
    return () => clearTimeout(t);
  }, []);

  // reveals, parallax and the form tabs
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 },
    );
    const watch = () =>
      document.querySelectorAll(".tx .rv:not(.in)").forEach((el, i) => {
        (el as HTMLElement).style.transitionDelay = `${(i % 4) * 70}ms`;
        io.observe(el);
      });
    watch();
    // blocks added or redrawn later (the page builder's preview) get their reveals too
    const mo = new MutationObserver(watch);
    mo.observe(document.querySelector(".tx main") ?? document.body, { childList: true, subtree: true });

    const onMove = (e: MouseEvent) => {
      const logo = document.getElementById("logo3d");
      if (!logo) return;
      const dx = e.clientX / innerWidth - 0.5;
      const dy = e.clientY / innerHeight - 0.5;
      logo.style.transform = `translate(${dx * -28}px,${dy * -18}px)`;
    };
    if (!reduce) addEventListener("mousemove", onMove);

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-tab]");
      const tab = el?.getAttribute("data-tab");
      if (tab === "brand" || tab === "creator") dispatchEvent(new CustomEvent(TAB_EVENT, { detail: tab }));
    };
    document.addEventListener("click", onClick);

    return () => {
      io.disconnect();
      mo.disconnect();
      removeEventListener("mousemove", onMove);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      <Suspense>
        <NavProgress className="bg-[linear-gradient(90deg,var(--royal),var(--aqua),var(--lime))]" />
      </Suspense>
      <Tracker />
      <div className={`loader ${done ? "done" : ""}`} aria-hidden="true">
        <div className="box">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tech/logom-gradient.png" alt="" />
          <div className="row mono">
            <span>{words.loading}</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="bar">
            <i style={{ width: `${pct}%` }} />
          </div>
          <div className="row mono">
            <span>{words.loaderLeft}</span>
            <span>{words.loaderRight}</span>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
