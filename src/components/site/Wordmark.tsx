"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import type { FooterStyle } from "@/lib/slots";
import { useLogoSvg } from "./Logo";

const WORD = "MODESOCIETY";
const SHAPES = "path,polygon,polyline,rect,circle,ellipse,line,text,use";

/**
 * Splits an inline SVG logo into per-letter groups: the top-level drawable children
 * (descending through single wrapper <g>s). Each becomes <g.ltr><g.rise>…</g></g>.
 */
function letteriseSvg(svg: SVGSVGElement): SVGGElement[] {
  let parent: Element = svg;
  for (;;) {
    const kids = Array.from(parent.children).filter((k) => !/^(defs|style|title|desc|metadata)$/i.test(k.tagName));
    if (kids.length === 1 && kids[0].tagName.toLowerCase() === "g") parent = kids[0];
    else break;
  }
  const items = Array.from(parent.children).filter((k) => k.matches(`g,${SHAPES}`));
  const ns = "http://www.w3.org/2000/svg";
  return items.map((item) => {
    const ltr = document.createElementNS(ns, "g");
    const rise = document.createElementNS(ns, "g");
    ltr.setAttribute("class", "ltr");
    rise.setAttribute("class", "rise spin");
    for (const g of [ltr, rise]) {
      g.style.transformBox = "fill-box";
      g.style.transformOrigin = "50% 100%";
    }
    item.replaceWith(ltr);
    rise.appendChild(item);
    ltr.appendChild(rise);
    return ltr;
  });
}

/**
 * The giant footer logo. Fills its container width, letters rise in on scroll,
 * then react to the cursor per the admin setting (magnetic / swing / static).
 */
export default function Wordmark({ style }: { style: FooterStyle }) {
  const svg = useLogoSvg();
  const box = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);

  // Text fallback: size the word to fill the container exactly.
  useLayoutEffect(() => {
    if (svg) return;
    const b = box.current;
    const w = word.current;
    if (!b || !w) return;
    const fit = () => {
      w.style.fontSize = "100px";
      const natural = w.scrollWidth;
      if (natural) w.style.fontSize = `${(100 * b.clientWidth) / natural}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [svg]);

  useEffect(() => {
    const root = box.current!;
    let letters: Element[];
    if (svg) {
      const el = root.querySelector("svg");
      if (!el) return;
      el.setAttribute("overflow", "visible");
      // effect re-runs (style change) must not wrap the letters twice
      const done = el.querySelectorAll(".ltr");
      letters = done.length ? Array.from(done) : letteriseSvg(el);
    } else {
      letters = Array.from(root.querySelectorAll(".ltr"));
    }
    const rises = letters.map((l) => l.querySelector(".rise") as HTMLElement | SVGElement);
    const reduced = prefersReducedMotion();

    const intro = reduced
      ? null
      : gsap.from(rises, {
          y: (_i: number, t: Element) => (t as HTMLElement).getBoundingClientRect().height * 1.1,
          opacity: 0,
          ease: "expo.out",
          stagger: 0.04,
          duration: 1.2,
          scrollTrigger: { trigger: root, start: "top 95%" },
        });

    if (style === "static" || reduced) {
      return () => {
        intro?.revert();
      };
    }

    const state = letters.map(() => ({ y: 0, s: 1, a: 0, v: 0 }));
    const p = { x: -9999, y: -9999, vx: 0, inside: false };
    let centres: { x: number; w: number; h: number }[] = [];
    const measure = () => {
      const r = root.getBoundingClientRect();
      centres = letters.map((l) => {
        const b = l.getBoundingClientRect();
        return { x: b.left - r.left + b.width / 2, w: b.width, h: b.height };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    let last = performance.now();
    let raf = 0;

    const move = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const x = e.clientX - r.left;
      p.vx = x - p.x;
      p.x = x;
      p.y = e.clientY - r.top;
      p.inside = p.y > -r.height * 1.2 && p.y < r.height * 1.4;
    };
    const click = (e: MouseEvent) => {
      const el = (e.target as Element).closest(".ltr");
      const i = el ? letters.indexOf(el) : -1;
      if (i < 0) return;
      if (style === "swing") state[i].v += (Math.random() > 0.5 ? 1 : -1) * 9;
      const spin = el!.querySelector(".spin") as HTMLElement | SVGElement | null;
      spin?.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(-1)" }, { transform: "scaleX(1)" }], {
        duration: 900,
        easing: "cubic-bezier(.16,1,.3,1)",
      });
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      letters.forEach((el, i) => {
        const c = centres[i];
        if (!c) return;
        const reach = Math.max(c.w, 40) * 2.2;
        const d = Math.abs(p.x - c.x);
        const f = p.inside && d < reach ? 1 - d / reach : 0;
        const st = state[i];
        const node = el as HTMLElement | SVGElement;
        if (style === "magnetic") {
          const ty = -f * f * c.h * 0.22;
          const ts = 1 + f * f * 0.12;
          st.y += (ty - st.y) * Math.min(dt * 10, 1);
          st.s += (ts - st.s) * Math.min(dt * 10, 1);
          node.style.transformOrigin = "50% 100%";
          node.style.transform = `translateY(${st.y}px) scaleY(${st.s})`;
        } else {
          // swing: damped pendulum hanging from the letter's top edge
          st.v += (-30 * st.a - 1.6 * st.v + (f > 0 ? p.vx * 0.9 * f : 0)) * dt;
          st.a += st.v * dt;
          st.a = Math.max(-0.6, Math.min(0.6, st.a));
          node.style.transformOrigin = "50% 0%";
          node.style.transform = `rotate(${st.a}rad)`;
        }
      });
      p.vx *= 0.8;
      raf = requestAnimationFrame(tick);
    };

    addEventListener("pointermove", move, { passive: true });
    root.addEventListener("click", click);
    raf = requestAnimationFrame(tick);
    return () => {
      ro.disconnect();
      removeEventListener("pointermove", move);
      root.removeEventListener("click", click);
      cancelAnimationFrame(raf);
      letters.forEach((l) => ((l as HTMLElement).style.transform = ""));
      intro?.revert();
    };
  }, [style, svg]);

  return (
    <div ref={box} className="relative w-full select-none text-white" aria-hidden data-cursor={style === "static" ? undefined : "play"}>
      {svg ? (
        <div className="w-full [&>svg]:block [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div ref={word} className="font-display flex w-max whitespace-nowrap leading-[1.12]" style={{ fontSize: "100px" }}>
          {WORD.split("").map((c, i) => (
            <span key={i} className="ltr inline-block" style={{ willChange: "transform" }}>
              <span className="reveal-line">
                <span className="rise spin inline-block">{c}</span>
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
