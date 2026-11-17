"use client";

import { APP_OPTIONS, AUDIENCE_COUNTRIES, contentProblems } from "@/lib/application";
import { Chips, Field } from "../StepForm";
import type { StepDef } from "./types";

/** Step 4: your content. Niches and work types are each site's own lists. */
export const content: StepDef = {
  kicker: "Your content",
  title: "What do you make?",
  problems: ({ a, side }) => contentProblems(a, side),
  render: ({ side, a, set }) => {
    const o = APP_OPTIONS[side];
    return (
      <>
        <Field label={side === "tech" ? "Gaming / content niche * (tick any)" : "Content niche * (tick any)"}>
          <Chips options={o.niches} value={a.niches} onChange={(niches) => set({ niches })} />
        </Field>
        <Field label="Work you are open to * (tick any)">
          <Chips options={o.work} value={a.work} onChange={(work) => set({ work })} />
        </Field>
        <div className="grid gap-8 md:grid-cols-2">
          <Field label="Audience top country" optional>
            <select className="input" value={a.audienceCountry} onChange={(e) => set({ audienceCountry: e.target.value })}>
              <option value="">Choose…</option>
              {AUDIENCE_COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Past brand collaborations" optional>
          <textarea className="input" value={a.collaborations} onChange={(e) => set({ collaborations: e.target.value })} placeholder="Brands you've worked with, and what you made for them." />
        </Field>
        <Field label="Are you currently represented by an agency or manager? *">
          <Chips options={["No", "Yes"]} multiple={false} value={a.represented ? [a.represented] : []} onChange={([v]) => set({ represented: (v as "Yes" | "No") ?? "" })} />
        </Field>
        {a.represented === "Yes" && (
          <Field label="Agency or manager's name *">
            <input className="input" value={a.agency} onChange={(e) => set({ agency: e.target.value })} />
          </Field>
        )}
      </>
    );
  },
};
