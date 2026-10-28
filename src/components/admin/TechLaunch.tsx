"use client";

import { useState } from "react";
import { postJson } from "@/lib/upload";

/**
 * ModeSociety Tech's launch switch. Until it's launched the public sees /tech as one landing
 * page; "Preview" shows this browser the full site (Next's draft mode) so it can be checked first.
 */
export default function TechLaunch({ launched, reload, notify }: { launched: boolean; reload: () => Promise<void>; notify: (m: string) => void }) {
  const [busy, setBusy] = useState(false);
  const set = async (on: boolean) => {
    const ask = on
      ? "Launch ModeSociety Tech? Everyone will see the full site: For brands, For creators, Our talent and Contact."
      : "Take ModeSociety Tech back to the landing page only? The other Tech pages will send visitors to /tech.";
    if (!confirm(ask)) return;
    setBusy(true);
    try {
      await postJson("/api/admin/settings", { values: { techLaunched: String(on) } });
      await reload();
      notify(on ? "ModeSociety Tech is live" : "ModeSociety Tech is back to the landing page");
    } catch (err) {
      notify((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={`mb-10 flex flex-wrap items-center justify-between gap-4 border p-5 ${launched ? "border-line bg-white" : "border-[#3e5ef1]/40 bg-[#3e5ef1]/[0.05]"}`}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-[#3e5ef1]">ModeSociety Tech · {launched ? "Live" : "Landing page only"}</p>
        <p className="mt-1 text-sm text-ink-2">
          {launched
            ? "The full Tech site is public."
            : "Visitors see one landing page at /tech (hero, intro film, what we run and both enquiry forms). Preview the full site in this browser while you build it, and launch it when it's ready."}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <a href="/api/admin/preview?to=/tech" target="_blank" className="chip">
          {launched ? "View /tech ↗" : "Preview the full site ↗"}
        </a>
        <button className={launched ? "text-sm text-ink-2 underline underline-offset-4" : "btn !py-3"} disabled={busy} onClick={() => set(!launched)}>
          {busy ? "Saving…" : launched ? "Back to landing page only" : "Launch the full site"}
        </button>
      </div>
    </div>
  );
}
