import { privacyPolicy } from "@/lib/privacy";
import type { Side } from "@/lib/side";

/** The business's privacy policy, in that site's look (the talent site's type, or the Tech design). */
export default function PrivacyPolicy({ side }: { side: Side }) {
  const p = privacyPolicy(side);
  if (side === "tech") {
    return (
      <section className="sec legal-page">
        <div className="wrap">
          <span className="mono" style={{ color: "var(--royal)", display: "block", marginBottom: 20 }}>
            Legal
          </span>
          <h1 className="h-l">{p.title}</h1>
          <div className="legal-body">
            <p>{p.intro}</p>
            {p.sections.map((s) => (
              <section key={s.heading}>
                <h2>{s.heading}</h2>
                {s.paras.map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
                {s.list && (
                  <ul>
                    {s.list.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="wrap pb-24 pt-28 md:pb-32 md:pt-36">
      <p className="eyebrow">Legal</p>
      <h1 className="font-display mt-4 text-[clamp(56px,9vw,140px)] leading-[0.86] text-ink">{p.title}</h1>
      <div className="mt-10 grid max-w-3xl gap-8 text-[16px] leading-relaxed text-ink-2">
        <p className="text-[18px] text-ink">{p.intro}</p>
        {p.sections.map((s) => (
          <section key={s.heading} className="grid gap-3">
            <h2 className="font-display text-3xl text-ink md:text-4xl">{s.heading}</h2>
            {s.paras.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
            {s.list && (
              <ul className="grid list-disc gap-2 pl-5">
                {s.list.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
