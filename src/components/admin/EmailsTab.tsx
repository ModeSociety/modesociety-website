"use client";

import { useEffect, useState } from "react";
import { postJson } from "@/lib/upload";
import { EMAIL_FIELDS, cleanEmails, type EmailRole, type EmailSettings } from "@/lib/emails";
import type { Side } from "@/lib/side";

/** Where the open side's form emails go, and the address applicants reply to. Saved in the Sheet. */
export default function EmailsTab({ side, disabled, notify }: { side: Side; disabled: boolean; notify: (m: string) => void }) {
  const [saved, setSaved] = useState<EmailSettings | null>(null);
  const [draft, setDraft] = useState<Record<EmailRole, string> | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (disabled) return;
    fetch("/api/admin/emails")
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) throw new Error(d.error);
        setSaved(d.emails);
      })
      .catch((e) => setError((e as Error).message));
  }, [disabled]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the open side's saved values
    if (saved) setDraft({ ...saved[side] });
  }, [saved, side]);

  if (disabled) return <p className="text-muted">Connect the backend to manage email addresses.</p>;
  if (!draft || !saved) return <p className="text-muted">{error || "Loading…"}</p>;
  const dirty = EMAIL_FIELDS.some((f) => draft[f.role] !== saved[side][f.role]);
  const problems = EMAIL_FIELDS.map((f) => cleanEmails(side, f.role, draft[f.role])).flatMap((r) => ("error" in r ? [r.error] : []));

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await postJson("/api/admin/emails", { side, values: draft });
      const next = structuredClone(saved);
      for (const f of EMAIL_FIELDS) next[side][f.role] = (cleanEmails(side, f.role, draft[f.role]) as { value: string }).value;
      setSaved(next);
      notify("Email addresses saved");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <p className="text-ink-2">
        {side === "tech"
          ? "ModeSociety Tech's form emails. They never go to a Mode Society inbox."
          : "Mode Society's form emails."}{" "}
        Separate several addresses with commas. Changes apply to the next form sent.
      </p>
      <div className="mt-8 grid gap-6">
        {EMAIL_FIELDS.map((f) => (
          <div key={f.role} className="field">
            <label htmlFor={`em-${f.role}`}>{f.label}</label>
            <input
              id={`em-${f.role}`}
              className="input"
              type={f.many ? "text" : "email"}
              value={draft[f.role]}
              onChange={(e) => setDraft({ ...draft, [f.role]: e.target.value })}
              spellCheck={false}
            />
            <p className="mt-1.5 text-sm text-muted">{f.hint}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button className="btn" disabled={!dirty || busy || problems.length > 0} onClick={save}>
          {busy ? "Saving…" : "Save addresses"}
        </button>
        {dirty && !problems.length && <span className="text-sm text-muted">Unsaved changes</span>}
      </div>
      {problems.length > 0 && <p className="mt-3 text-sm text-pin">{problems[0]}</p>}
      {error && <p className="mt-3 text-sm text-pin">{error}</p>}
    </div>
  );
}
