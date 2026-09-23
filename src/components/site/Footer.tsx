"use client";

import Link from "next/link";
import { useState } from "react";
import type { FooterStyle } from "@/lib/slots";
import Wordmark from "./Wordmark";

const EMAIL = "pr@modesociety.com.au";

export default function Footer({ style }: { style: FooterStyle }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="wrap grid gap-14 pb-10 pt-24 md:grid-cols-12 md:pt-32">
        <div className="md:col-span-7">
          <p className="eyebrow !text-paper/50">Let&apos;s connect</p>
          <h2 className="font-display mt-6 text-[clamp(34px,5.4vw,84px)]">
            Tell us your vision.
            <br />
            <span className="font-serif italic tracking-normal">We&apos;ll cast it.</span>
          </h2>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/work-with-us" className="btn light">
              For brands <span className="arrow">→</span>
            </Link>
            <Link href="/apply-to-be-a-creator" className="btn ghost !border-paper/40 !text-paper hover:!text-ink [&::before]:!bg-paper">
              For talent <span className="arrow">→</span>
            </Link>
          </div>
        </div>
        <div className="grid content-end gap-8 text-sm md:col-span-4 md:col-start-9">
          <button onClick={copy} className="group text-left" data-cursor={copied ? "copied" : "copy"}>
            <span className="eyebrow !text-paper/50">Email</span>
            <span className="mt-2 block text-xl md:text-2xl">
              <span className="link-underline">{EMAIL}</span>
            </span>
            <span className={`mt-1 block text-xs text-paper/50 transition-opacity ${copied ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              {copied ? "Copied to clipboard ✓" : "Click to copy"}
            </span>
          </button>
          <div>
            <span className="eyebrow !text-paper/50">Social</span>
            <a href="https://instagram.com/modesocietyagency" target="_blank" rel="noreferrer" className="mt-2 block text-xl md:text-2xl">
              <span className="link-underline">@modesocietyagency</span> ↗
            </a>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-paper/60">
            <Link href="/about" className="link-underline">About</Link>
            <Link href="/work-with-us" className="link-underline">Work with us</Link>
            <Link href="/apply-to-be-a-creator" className="link-underline">Apply as talent</Link>
            <Link href="/contact" className="link-underline">Contact</Link>
          </nav>
        </div>
      </div>
      <div className="wrap pb-6">
        <Wordmark style={style} />
      </div>
      <div className="wrap">
        <div className="flex flex-wrap justify-between gap-2 border-t border-paper/10 py-6 text-xs text-paper/40">
          <span>© {new Date().getFullYear()} Mode Society — Australian boutique talent agency.</span>
          <span>UGC · Influencers · Models · Streamers · Content creators</span>
        </div>
      </div>
    </footer>
  );
}
