"use client";

import { firstNameOf, GROWTH_GUIDE, thankYouMessage, type Application } from "@/lib/application";
import type { Side } from "@/lib/side";

/** After submitting: Asha's thank-you with the creator's first name, and the site's Creator Growth Guide. */
export default function ThankYou({ side, a, reference }: { side: Side; a: Application; reference: string }) {
  return (
    <div className="grid gap-6" role="status">
      <h2 className="font-display text-[clamp(36px,4.2vw,64px)] text-ink">Application sent.</h2>
      <p className="max-w-2xl text-[clamp(17px,1.4vw,20px)] leading-relaxed text-ink-2">{thankYouMessage(firstNameOf(a))}</p>
      <a href={GROWTH_GUIDE[side]} download className="btn w-fit">
        Download the Creator Growth Guide <span className="arrow">↓</span>
      </a>
      <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted">Reference {reference} · we&apos;ve emailed you a copy</p>
    </div>
  );
}
