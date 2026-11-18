import type { SectionCopy } from "@/lib/copy";
import { pixel } from "./pixel";

/**
 * ModeSociety Tech's House rules page (18 Nov 2026, Asha: "get ready for house rules bits"): the rules
 * behind the home page's House rules section, the published no-go sponsors (the same list as that
 * section and the brand form's tick) and how to raise a concern. Words in Pages & text.
 */
export default function TxHouseRules({ copy: c, nogo }: { copy: SectionCopy<"techSite.houseRules">; nogo: string[] }) {
  const rules = c.rules.filter((r) => r.title.trim());
  return (
    <section className="sec legal-page">
      <div className="wrap">
        <span className="mono" style={{ color: "var(--royal)", display: "block", marginBottom: 20 }}>
          {c.label}
        </span>
        <h1 className="h-l">{pixel(c.heading)}</h1>
        <div className="legal-body">
          {c.intro.trim() && <p>{c.intro}</p>}
          <ol className="hr-rules">
            {rules.map((r, i) => (
              <li key={i} className="rv">
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <h2>{r.title}</h2>
                {r.body.trim() && <p>{r.body}</p>}
              </li>
            ))}
          </ol>
          {nogo.length > 0 && (
            <section id="no-go">
              <h2>{c.nogoTitle}</h2>
              {c.nogoIntro.trim() && <p>{c.nogoIntro}</p>}
              <div className="hr-nogo">
                {nogo.map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </section>
          )}
          {c.contact.trim() && (
            <section>
              <p>{c.contact}</p>
            </section>
          )}
          {c.updated.trim() && <p className="mono" style={{ fontSize: 11, color: "var(--body)", marginTop: 34 }}>{c.updated}</p>}
        </div>
      </div>
    </section>
  );
}
