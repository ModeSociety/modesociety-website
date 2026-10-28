"use client";

import { useEffect, useRef, useState } from "react";
import type { SectionCopy } from "@/lib/copy";
import BrandForm from "./BrandForm";
import PartnerForm from "./PartnerForm";
import TalentForm from "./TalentForm";

export type FormKey = "talent" | "brands" | "partner";

const KEYS: FormKey[] = ["talent", "brands", "partner"];

/** Three cards; picking one opens its form underneath (only one at a time). */
export default function GetInTouch({
  initial,
  partnerTypeHint = "",
  cards: copy,
  intros,
}: {
  initial: FormKey | null;
  partnerTypeHint?: string;
  cards: SectionCopy<"contact.cards">;
  intros: SectionCopy<"site.forms">;
}) {
  // the cards are edited in the admin panel in the order talent, brands, partners
  const CARDS = KEYS.map((key, i) => ({ key, ...(copy.cards[i] ?? { eyebrow: "", title: key, body: "", cta: "" }) }));
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
              className={`group flex min-h-[260px] flex-col justify-between border p-6 text-left transition-all duration-500 ${
                on ? "border-ink bg-ink text-white" : "border-espresso/15 bg-white text-ink hover:-translate-y-1 hover:border-ink"
              }`}
            >
              <span className={`eyebrow ${on ? "!text-white/80" : ""}`}>{c.eyebrow}</span>
              <span>
                <span className="font-display block text-[clamp(34px,3vw,48px)]">{c.title}</span>
                <span className={`mt-2 block text-[15px] ${on ? "text-white/85" : "text-ink-2"}`}>{c.body}</span>
                <span className="mt-5 inline-flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.04em]">
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
              {active === "talent" && <TalentForm intro={intros.talent} />}
              {active === "brands" && <BrandForm intro={intros.brands} />}
              {active === "partner" && <PartnerForm intro={intros.partner} typeHint={partnerTypeHint} />}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
