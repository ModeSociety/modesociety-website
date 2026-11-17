"use client";

import { useState } from "react";
import { BLOCKED_REGIONS, eligibilityKey, ELIGIBLE_COUNTRIES, parseList, type Eligibility } from "@/lib/application";
import type { Side } from "@/lib/side";
import { postJson } from "@/lib/upload";

/**
 * Where each business can sign creators from: the countries on the application form and the regions
 * blocked within them (Asha's spec). Saved in the Sheet's Settings tab; the form updates within seconds.
 */
export default function ApplicationsTab({
  side,
  saved,
  reload,
  notify,
}: {
  side: Side;
  saved: Eligibility;
  reload: () => Promise<void>;
  notify: (m: string) => void;
}) {
  const [countries, setCountries] = useState(saved.countries.join("\n"));
  const [blocked, setBlocked] = useState(saved.blocked.join("\n"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dirty = countries !== saved.countries.join("\n") || blocked !== saved.blocked.join("\n");

  const save = async (c: string, b: string, msg: string) => {
    setBusy(true);
    setError("");
    try {
      if (!parseList(c).length) throw new Error("Keep at least one country");
      await postJson("/api/admin/settings", { values: { [eligibilityKey(side, "countries")]: parseList(c).join("\n"), [eligibilityKey(side, "blocked")]: parseList(b).join("\n") } });
      await reload();
      notify(msg);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <p className="text-ink-2">
        Who can apply to {side === "tech" ? "ModeSociety Tech" : "Mode Society"}. A creator choosing a country that isn&apos;t listed, or a blocked region,
        sees the red <em>Unable to sign</em> message and can&apos;t continue. One name per line.
      </p>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="field">
          <label htmlFor="el-countries">Countries creators can sign from</label>
          <textarea id="el-countries" className="input min-h-48" value={countries} onChange={(e) => setCountries(e.target.value)} spellCheck={false} />
          <p className="mt-1.5 text-sm text-muted">Australia always shows as the first choice; the others are listed under International.</p>
        </div>
        <div className="field">
          <label htmlFor="el-blocked">Blocked regions</label>
          <textarea id="el-blocked" className="input min-h-48" value={blocked} onChange={(e) => setBlocked(e.target.value)} spellCheck={false} />
          <p className="mt-1.5 text-sm text-muted">States or regions inside those countries (e.g. California), until legal advice says otherwise.</p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button className="btn" disabled={!dirty || busy} onClick={() => save(countries, blocked, "Application lists saved")}>
          {busy ? "Saving…" : "Save lists"}
        </button>
        <button
          className="text-sm text-muted underline underline-offset-4"
          disabled={busy}
          onClick={() => {
            setCountries(ELIGIBLE_COUNTRIES.join("\n"));
            setBlocked(BLOCKED_REGIONS.join("\n"));
            save(ELIGIBLE_COUNTRIES.join("\n"), BLOCKED_REGIONS.join("\n"), "Back to Asha's starting lists");
          }}
        >
          Back to the starting lists
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-pin">{error}</p>}
    </div>
  );
}
