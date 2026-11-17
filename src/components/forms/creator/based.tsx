"use client";

import { APP_OPTIONS, basedProblems, locationBlocked, NOT_LISTED, regionsFor, unableToSign, type Based } from "@/lib/application";
import { Chips, Field } from "../StepForm";
import type { StepDef } from "./types";

const BASED: Based[] = ["Australia", "International"];

/**
 * Step 1b: Where you're based. Australia, or an eligible country (the list is set in the admin panel;
 * the last option is "My country isn't listed"). A blocked location shows Asha's red "Unable to
 * sign" message under the field and keeps Next disabled. UAE creators need their permit number.
 */
export const based: StepDef = {
  kicker: "Where you're based",
  title: "Where are you based?",
  problems: ({ a, el }) => basedProblems(a, el),
  render: ({ side, a, set, el }) => {
    const country = a.based === "Australia" ? "Australia" : a.country;
    const regions = regionsFor(country);
    const blocked = locationBlocked(a, el);
    const international = el.countries.filter((c) => c !== "Australia");
    return (
      <>
        <Field label="Where are you based? *">
          <Chips
            options={BASED}
            multiple={false}
            value={a.based ? [a.based] : []}
            onChange={([b]) => set({ based: b ?? "", country: b === "Australia" ? "Australia" : "", region: "", uaePermit: "" })}
          />
        </Field>
        {a.based && (
          <div className="grid gap-8 md:grid-cols-2">
            <Field label="Country of residence *">
              {a.based === "Australia" ? (
                <input className="input" value="Australia" readOnly aria-readonly />
              ) : (
                <select className="input" value={a.country} onChange={(e) => set({ country: e.target.value, region: "", uaePermit: "" })}>
                  <option value="">Choose…</option>
                  {international.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                  <option>{NOT_LISTED}</option>
                </select>
              )}
            </Field>
            {country && country !== NOT_LISTED && (
              <Field label="State / region *">
                {regions ? (
                  <select className="input" value={a.region} onChange={(e) => set({ region: e.target.value })}>
                    <option value="">Choose…</option>
                    {regions.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                ) : (
                  <input className="input" value={a.region} onChange={(e) => set({ region: e.target.value })} placeholder="e.g. Tokyo, Greater London, Dubai" />
                )}
              </Field>
            )}
          </div>
        )}
        {blocked && (
          <p role="alert" className="border border-[#c62828] bg-[#fdecea] p-4 text-[15px] leading-relaxed text-[#8e1b1b]">
            {unableToSign(APP_OPTIONS[side].name)}
          </p>
        )}
        {country === "United Arab Emirates" && !blocked && (
          <Field label="UAE Advertiser Permit number *">
            <input className="input" value={a.uaePermit} onChange={(e) => set({ uaePermit: e.target.value })} />
          </Field>
        )}
        {country === "United Arab Emirates" && !blocked && (
          <p className="-mt-5 text-sm text-muted">UAE law requires creators to hold a UAE Media Council Advertiser Permit to post paid or promotional content.</p>
        )}
      </>
    );
  },
};
