"use client";

import { useState } from "react";
import { REPRESENTATIONS, representationInfo, representationProblems } from "@/lib/application";
import { Chips } from "../StepForm";
import Popup from "./Popup";
import type { StepDef, StepProps } from "./types";

function Representation({ side, a, set }: StepProps) {
  const [info, setInfo] = useState(false);
  return (
    <>
      <div className="field">
        <label className="flex items-center gap-2">
          How do you want to be represented? *
          <button
            type="button"
            onClick={() => setInfo(true)}
            aria-label="What's the difference?"
            className="grid h-6 w-6 place-items-center rounded-full border border-ink text-[12px] normal-case text-ink hover:bg-ink hover:text-paper"
          >
            i
          </button>
        </label>
        <Chips options={REPRESENTATIONS} multiple={false} value={a.representation ? [a.representation] : []} onChange={([r]) => set({ representation: r ?? "" })} />
      </div>
      <p className="text-sm text-muted">This decides which contract we send you if we&apos;d like to sign you.</p>
      {a.represented === "Yes" && a.representation === "Exclusive (20% commission)" && (
        <p className="border-l-2 border-pin bg-paper-2 p-4 text-[15px] text-ink-2">Exclusive representation requires that you are not signed with another agency.</p>
      )}
      {info && (
        <Popup title="Exclusive or non-exclusive?" onClose={() => setInfo(false)}>
          {representationInfo(side).map((s) => (
            <section key={s.heading}>
              <h3 className="font-medium text-ink">{s.heading}</h3>
              {s.intro && <p className="mt-2">{s.intro}</p>}
              <ul className="mt-2 grid list-disc gap-1 pl-5">
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </section>
          ))}
        </Popup>
      )}
    </>
  );
}

/** Step 6: exclusive (20%) or non-exclusive (30%), with Asha's explanation behind the (i) button. */
export const representation: StepDef = {
  kicker: "Representation",
  title: "How would you like to work with us?",
  problems: ({ a }) => representationProblems(a),
  render: (p) => <Representation {...p} />,
};
