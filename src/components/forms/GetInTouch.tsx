"use client";

import { useEffect, useRef, useState } from "react";
import BrandForm from "./BrandForm";
import PartnerForm from "./PartnerForm";
import TalentForm from "./TalentForm";

export type FormKey = "talent" | "brands" | "partner";

const CARDS: { key: FormKey; eyebrow: string; title: string; body: string; cta: string }[] = [
  { key: "talent", eyebrow: "For talent", title: "Want us to represent you?", body: "Models, influencers, UGC creators and streamers.", cta: "Apply now" },
  { key: "brands", eyebrow: "For brands", title: "Looking for an external PR team?", body: "Influencer campaigns, UGC, guest lists, funding and AI campaigns.", cta: "Book a call" },
  { key: "partner", eyebrow: "Partner with us", title: "Want to work together?", body: "Referrals, affiliates, co-marketing and cross-promotion.", cta: "Send" },
];

/** Three cards; picking one opens its form underneath (only one at a time). */
export default function GetInTouch({ initial, partnerTypeHint = "" }: { initial: FormKey | null; partnerTypeHint?: string }) {
  const [active, setActive] = useState<FormKey | null>(initial);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initial) setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
  }, [initial]);

  const pick = (k: FormKey) => {
    setActive(k);
    const url = new URL(location.href);
    url.searchParams.set("form", k);
    history.replaceState(null, "", url);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <section className="wrap pb-10">
      <div className="grid gap-4 md:grid-cols-3" role="tablist" aria-label="Who are you?">
        {CARDS.map((c) => {
          const on = active === c.key;
          return (
            <button
              key={c.key}
              role="tab"
              aria-selected={on}
              onClick={() => pick(c.key)}
              className={`group flex min-h-[230px] flex-col justify-between rounded-[6px] border p-6 text-left transition-all duration-500 ${
                on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:-translate-y-1 hover:border-ink"
              }`}
              data-cursor="open"
            >
              <span className={`eyebrow ${on ? "!text-white/80" : ""}`}>{c.eyebrow}</span>
              <span>
                <span className="font-display block text-[clamp(20px,1.9vw,28px)]">{c.title}</span>
                <span className={`mt-2 block text-[15px] ${on ? "text-white/85" : "text-ink-2"}`}>{c.body}</span>
                <span className="mt-5 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em]">
                  {c.cta} <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div ref={formRef} className="scroll-mt-24">
        {active && (
          <div key={active} className="mt-12 grid gap-10 md:grid-cols-12" role="tabpanel">
            <div className="md:col-span-8 md:col-start-3">
              {active === "talent" && <TalentForm />}
              {active === "brands" && <BrandForm />}
              {active === "partner" && <PartnerForm typeHint={partnerTypeHint} />}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
