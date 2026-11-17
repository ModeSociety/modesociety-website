"use client";

import { ADDRESS_TYPES, addressProblems } from "@/lib/application";
import { Chips, Field } from "../StepForm";
import type { StepDef } from "./types";

/** Step 1c: where brands send PR packages. State and country come from Where you're based. */
export const address: StepDef = {
  kicker: "Postal address",
  title: "Where should PR packages go?",
  problems: ({ a }) => addressProblems(a),
  render: ({ a, set }) => {
    const country = a.based === "Australia" ? "Australia" : a.country;
    return (
      <>
        <p className="text-[15px] leading-relaxed text-ink-2">
          Where should brands send your PR packages? This is kept securely on file and is only shared with brands sending you product. Note: some couriers
          can&apos;t deliver to PO Boxes.
        </p>
        <Field label="Address type *">
          <Chips options={ADDRESS_TYPES} multiple={false} value={a.addressType ? [a.addressType] : []} onChange={([t]) => set({ addressType: t ?? "" })} />
        </Field>
        <div className="grid gap-8 md:grid-cols-2">
          <Field label="Address line 1 *">
            <input
              className="input"
              value={a.address1}
              onChange={(e) => set({ address1: e.target.value })}
              autoComplete="address-line1"
              placeholder={a.addressType === "PO Box or parcel locker" ? "PO Box 123" : "12 Example Street"}
            />
          </Field>
          <Field label="Address line 2" optional>
            <input className="input" value={a.address2} onChange={(e) => set({ address2: e.target.value })} autoComplete="address-line2" placeholder="Unit, building" />
          </Field>
          <Field label="Suburb / city *">
            <input className="input" value={a.suburb} onChange={(e) => set({ suburb: e.target.value })} autoComplete="address-level2" />
          </Field>
          <Field label="Postcode / ZIP *">
            <input
              className="input"
              value={a.postcode}
              onChange={(e) => set({ postcode: e.target.value })}
              autoComplete="postal-code"
              inputMode={country === "Australia" || country === "United States" ? "numeric" : "text"}
            />
          </Field>
          <Field label="State / region">
            <input className="input" value={a.region} readOnly aria-readonly />
          </Field>
          <Field label="Country">
            <input className="input" value={country} readOnly aria-readonly />
          </Field>
        </div>
      </>
    );
  },
};
