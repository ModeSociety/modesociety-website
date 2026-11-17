"use client";

import { aboutProblems, ageOn } from "@/lib/application";
import { Field } from "../StepForm";
import type { StepDef } from "./types";

/** Step 1: About you. Under 18: a parent or guardian's details are required. */
export const about: StepDef = {
  kicker: "About you",
  title: "First, who are you?",
  problems: ({ a }) => aboutProblems(a),
  render: ({ a, set }) => {
    const age = ageOn(a.dob);
    return (
      <>
        <div className="grid gap-8 md:grid-cols-2">
          <Field label="Full legal name *">
            <input className="input" value={a.legalName} onChange={(e) => set({ legalName: e.target.value })} autoComplete="name" placeholder="As on your ID" />
          </Field>
          <Field label="Creator / professional name *">
            <input className="input" value={a.creatorName} onChange={(e) => set({ creatorName: e.target.value })} autoComplete="nickname" placeholder="The name brands know you by" />
          </Field>
          <Field label="Email *">
            <input className="input" type="email" value={a.email} onChange={(e) => set({ email: e.target.value })} autoComplete="email" placeholder="you@email.com" />
          </Field>
          <Field label="Mobile *">
            <input className="input" type="tel" value={a.mobile} onChange={(e) => set({ mobile: e.target.value })} autoComplete="tel" placeholder="0412 345 678 (outside Australia: +country code)" />
          </Field>
          <Field label="Date of birth *">
            <input className="input" type="date" value={a.dob} max={new Date().toISOString().slice(0, 10)} onChange={(e) => set({ dob: e.target.value })} autoComplete="bday" />
          </Field>
        </div>
        {age !== null && age < 18 && (
          <fieldset className="grid gap-6 border border-line p-5 md:grid-cols-3">
            <legend className="px-2 text-[11px] uppercase tracking-[0.18em] text-ink">You&apos;re under 18: a parent or guardian *</legend>
            <Field label="Their name *">
              <input className="input" value={a.guardianName} onChange={(e) => set({ guardianName: e.target.value })} />
            </Field>
            <Field label="Their email *">
              <input className="input" type="email" value={a.guardianEmail} onChange={(e) => set({ guardianEmail: e.target.value })} />
            </Field>
            <Field label="Their phone *">
              <input className="input" type="tel" value={a.guardianPhone} onChange={(e) => set({ guardianPhone: e.target.value })} />
            </Field>
          </fieldset>
        )}
      </>
    );
  },
};
