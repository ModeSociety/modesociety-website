"use client";

import { useEffect, useRef, useState } from "react";
import Popup from "@/components/forms/creator/Popup";
import { CONTRACT_TYPES, contractTypeOf, type ContractType } from "@/lib/contract";
import type { Enquiry } from "@/lib/enquiries";
import { postJson } from "@/lib/upload";

/** NSW Fair Trading's information for performers (the sheet NSW creators get before a contract). */
const NSW_SHEET = "https://www.nsw.gov.au/business-and-economy/running-a-business/industry-specific-business-requirements/working-as-a-performer-or-performer-representative-nsw/entertainment-industry-agreements";

const when = (iso: string) => (iso ? new Date(iso).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" }) : "");

/**
 * A creator lead's contract (SP-32, SP-115, SP-116): Send contract (through PandaDoc, filled from the
 * application, Asha's signature already on it), the NSW sheet tick that has to come first for NSW
 * creators, and, while it's unsigned, one reminder or Void.
 */
export default function ContractBox({ e, onDone, onRefresh }: { e: Enquiry; onDone: (message: string) => Promise<void>; onRefresh: () => Promise<void> }) {
  const k = e.contract;
  // a contract is sent in the background: until the lead shows the result, check back every few seconds
  const [waiting, setWaiting] = useState(false);
  const stateAtSend = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!waiting) return;
    if (k?.state !== stateAtSend.current) {
      setWaiting(false); // the lead now shows the result
      return;
    }
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started > 120_000) setWaiting(false);
      else onRefresh();
    }, 4000);
    return () => clearInterval(timer);
  }, [waiting, k?.state, onRefresh]);
  const [asking, setAsking] = useState(false);
  const [type, setType] = useState<ContractType | "">(contractTypeOf(e.creator?.representation ?? ""));
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const nsw = (e.creator?.tags ?? []).some((t) => t.startsWith("NSW"));
  const out = k?.state === "sent";
  const name = e.fields.find((f) => f.label === "Full Name")?.value || e.title;

  // while the Send dialog is open, the contract is made ready in PandaDoc, so Send takes a couple of seconds
  useEffect(() => {
    if (!asking || !type) return;
    postJson("/api/admin/contracts", { action: "prepare", kind: e.kind, reference: e.reference, type }).catch(() => {});
  }, [asking, type, e.kind, e.reference]);

  const run = async (action: string, extra: Record<string, unknown>, done: string) => {
    setBusy(action);
    setError("");
    try {
      const r = await postJson<{ queued?: boolean }>("/api/admin/contracts", { action, kind: e.kind, reference: e.reference, ...extra });
      setAsking(false);
      if (r.queued) {
        stateAtSend.current = k?.state;
        setWaiting(true);
        done = `Sending the contract to ${name} in the background…`;
      }
      await onDone(done);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy("");
    }
  };

  if (e.status === "Signed" || k?.state === "completed") {
    return k?.link ? (
      <a href={k.link} target="_blank" rel="noreferrer" className="link-underline w-fit text-ink-2">
        Signed contract in PandaDoc ↗
      </a>
    ) : null;
  }

  return (
    <div className="grid gap-3 border border-line bg-white p-3">
      <span className="eyebrow">Contract</span>
      {nsw && (
        <div className="grid gap-2 text-[13px]">
          <p className="text-ink-2">
            NSW creator: send them the{" "}
            <a href={NSW_SHEET} target="_blank" rel="noreferrer" className="underline underline-offset-2">
              NSW Fair Trading information for performers ↗
            </a>{" "}
            before the contract.
          </p>
          {k?.nswSheetSent ? (
            <p className="text-muted">✓ Sheet sent ({k.nswSheetSent.split(" · ")[0]}, {when(k.nswSheetSent.split(" · ")[1] ?? "")})</p>
          ) : (
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-0.5" disabled={Boolean(busy)} onChange={(ev) => ev.target.checked && run("nswSheet", {}, "Noted: the NSW sheet was sent")} />
              <span>Information for Performers sheet sent</span>
            </label>
          )}
        </div>
      )}
      {out ? (
        <div className="grid gap-2 text-[13px]">
          <p className="text-ink">
            {k?.type} contract sent {when(k?.sentAt ?? "")}: waiting for their signature.
          </p>
          <a href={k?.link} target="_blank" rel="noreferrer" className="w-fit underline underline-offset-2">
            Open in PandaDoc ↗
          </a>
          {k?.remindedAt ? (
            <p className="text-muted">Reminder sent {when(k.remindedAt)}</p>
          ) : (
            <button type="button" className="chip w-fit" disabled={Boolean(busy)} onClick={() => run("remind", {}, "PandaDoc sent them a reminder")}>
              {busy === "remind" ? "Sending…" : "Resend reminder"}
            </button>
          )}
          <button
            type="button"
            className="w-fit text-pin underline underline-offset-4"
            disabled={Boolean(busy)}
            onClick={() => confirm(`Void the contract sent to ${name}? They won't be able to sign it, and the lead goes back to Reviewing.`) && run("void", {}, "Contract voided: the lead is back in Reviewing")}
          >
            {busy === "void" ? "Voiding…" : "Void contract"}
          </button>
        </div>
      ) : (
        <>
          {waiting ? (
            <p className="text-[13px] text-ink">Sending through PandaDoc… this lead updates by itself when it&apos;s out (usually 10 to 20 seconds).</p>
          ) : k?.state?.startsWith("failed") ? (
            <p className="text-[13px] text-pin">The last send didn&apos;t go out: {k.state.replace(/^failed:\s*/, "")}</p>
          ) : (
            k?.state && <p className="text-[12px] text-muted">The last contract was {k.state}.</p>
          )}
          <button type="button" className="btn !justify-start" disabled={(nsw && !k?.nswSheetSent) || Boolean(busy) || waiting} onClick={() => setAsking(true)}>
            Send contract <span className="arrow">→</span>
          </button>
          {nsw && !k?.nswSheetSent && <p className="text-[12px] text-muted">Tick that the NSW sheet was sent first.</p>}
        </>
      )}
      {error && !asking && <p className="text-[13px] text-pin">{error}</p>}
      {asking && (
        <Popup title="Send contract" onClose={() => !busy && setAsking(false)}>
          <label className="grid gap-1.5">
            <span className="eyebrow">Contract</span>
            <select value={type} onChange={(ev) => setType(ev.target.value as ContractType)} className="border border-line bg-white px-3 py-2 text-ink">
              <option value="">Choose…</option>
              {CONTRACT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          {type && (
            <p className="text-ink">
              Send the {type} contract to {name} at {e.email}?
            </p>
          )}
          <p className="text-[13px]">
            It&apos;s filled in from their application and already signed by Asha. They check their details, add their payment details and sign in
            PandaDoc; the lead moves to Contract sent.
          </p>
          {error && <p className="text-pin">{error}</p>}
          <div className="flex gap-3">
            <button type="button" className="btn" disabled={!type || Boolean(busy)} onClick={() => run("send", { type }, `${type} contract sent to ${name}`)}>
              {busy === "send" ? "Sending…" : "Send"} <span className="arrow">→</span>
            </button>
            <button type="button" className="underline underline-offset-4" disabled={Boolean(busy)} onClick={() => setAsking(false)}>
              Cancel
            </button>
          </div>
        </Popup>
      )}
    </div>
  );
}
