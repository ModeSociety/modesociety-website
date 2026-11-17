"use client";

import { APP_OPTIONS, discoveryProblems, REFERRALS } from "@/lib/application";
import { Field } from "../StepForm";
import type { StepDef } from "./types";

/** Step 5: how they found us. A referral asks who; Other asks where. */
export const discovery: StepDef = {
  kicker: "Discovery",
  title: "How did you find us?",
  problems: ({ a, side }) => discoveryProblems(a, side),
  render: ({ side, a, set }) => (
    <>
      <Field label={`How did you discover ${APP_OPTIONS[side].name}? *`}>
        <select className="input" value={a.discovery} onChange={(e) => set({ discovery: e.target.value })}>
          <option value="">Choose…</option>
          {APP_OPTIONS[side].discovery.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </Field>
      {REFERRALS.includes(a.discovery) && (
        <Field label="Who referred you? *">
          <input className="input" value={a.referrer} onChange={(e) => set({ referrer: e.target.value })} />
        </Field>
      )}
      {a.discovery === "Other" && (
        <Field label="Where did you hear about us? *">
          <input className="input" value={a.discoveryOther} onChange={(e) => set({ discoveryOther: e.target.value })} />
        </Field>
      )}
    </>
  ),
};
