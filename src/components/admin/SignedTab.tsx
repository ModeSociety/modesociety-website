"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { flagOf, formatCount, placeOf } from "@/lib/enquiries";
import { localDate, nextRenewal, type SignedCreator } from "@/lib/signed";
import type { Side } from "@/lib/side";

/** The last list this browser saw per business, so coming back shows it at once. */
const kept: Partial<Record<Side, SignedCreator[]>> = {};

/** "17 Nov 2026" from a YYYY-MM-DD or an ISO date-time ("—" when there's none). */
export function showDate(v: string | null) {
  const day = v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : v ? localDate(v) : "";
  if (!day) return "—";
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

const nameOf = (s: SignedCreator) => s.application?.title || s.contract.reference;
const contractLabel = (s: SignedCreator) => (s.contract.type ? `${s.contract.type}${s.contract.commission ? ` (${s.contract.commission})` : ""}` : "Not set");

/**
 * Signed Talent: the open business's signed creators (Asha's brief): photo, name, main channel,
 * followers, representation, location, signed date and renewal date, with search and filters.
 * Creators join the list when their lead is marked Signed.
 */
export default function SignedTab({ side, disabled }: { side: Side; disabled: boolean }) {
  const [items, setItems] = useState<SignedCreator[] | null>(kept[side] ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [rep, setRep] = useState("");
  const [platform, setPlatform] = useState("");
  const [country, setCountry] = useState("");
  const [noBio, setNoBio] = useState(false);
  const [open, setOpen] = useState("");

  /** the kept copy first (instant), then a fresh one from the Sheet */
  const load = useCallback(async () => {
    if (disabled) return;
    setError("");
    const get = async (fresh: boolean) => {
      const r = await fetch(`/api/admin/signed?side=${side}${fresh ? "&fresh=1" : ""}`);
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      return d.items as SignedCreator[];
    };
    try {
      if (!kept[side]) setItems((kept[side] = await get(false)));
      setLoading(true);
      setItems((kept[side] = await get(true)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [disabled, side]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on open
    load();
  }, [load]);

  const options = useMemo(() => {
    const all = items || [];
    const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort();
    return {
      platforms: uniq(all.map((s) => s.application?.creator?.platform || "")),
      countries: uniq(all.map((s) => s.application?.creator?.country || "")),
    };
  }, [items]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items || []).filter((s) => {
      const c = s.application?.creator;
      if (rep && s.contract.type !== rep) return false;
      if (platform && c?.platform !== platform) return false;
      if (country && c?.country !== country) return false;
      if (noBio && s.contract.modeEmailInBio) return false;
      if (!q) return true;
      return [nameOf(s), s.contract.reference, s.application?.email, s.contract.dedicatedEmail, ...(s.application?.fields.map((f) => f.value) || [])]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, rep, platform, country, noBio]);

  if (disabled) return <p className="text-ink-2">Connect the Google Sheet backend to see signed talent.</p>;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search signed talent…" aria-label="Search" className="min-w-[220px] flex-1 border border-line bg-white px-3 py-2" />
        <select value={rep} onChange={(e) => setRep(e.target.value)} aria-label="Representation" className="border border-line bg-white px-3 py-2">
          <option value="">All contracts</option>
          <option>Exclusive</option>
          <option>Non-exclusive</option>
        </select>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} aria-label="Platform" className="border border-line bg-white px-3 py-2">
          <option value="">All platforms</option>
          {options.platforms.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Country" className="border border-line bg-white px-3 py-2">
          <option value="">All countries</option>
          {options.countries.map((c) => (
            <option key={c} value={c}>
              {`${flagOf(c)} ${c}`.trim()}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" checked={noBio} onChange={(e) => setNoBio(e.target.checked)} /> No Mode email in bio yet
        </label>
        <button className="chip" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>
      {error && <p className="text-pin">{error}</p>}
      {!items ? (
        <p className="text-ink-2">Loading…</p>
      ) : !list.length ? (
        <p className="border border-line bg-white px-6 py-10 text-center text-ink-2">
          {items.length ? "No signed creators match." : "No signed creators yet. A creator joins this list when their lead is marked Signed."}
        </p>
      ) : (
        <ul className="border border-line bg-white">
          <li className="hidden grid-cols-[40px_minmax(0,1.3fr)_minmax(0,1.3fr)_64px_130px_minmax(0,1fr)_100px_100px] gap-x-4 border-b border-line px-6 py-2 font-mono text-[11px] uppercase tracking-wider text-muted lg:grid">
            <span />
            <span>Name</span>
            <span>Main channel</span>
            <span className="text-right">Followers</span>
            <span>Contract</span>
            <span>Location</span>
            <span>Signed</span>
            <span>Renews</span>
          </li>
          {list.map((s) => (
            <li key={s.contract.reference} className="border-b border-line last:border-b-0">
              <Row s={s} side={side} isOpen={open === s.contract.reference} onToggle={() => setOpen(open === s.contract.reference ? "" : s.contract.reference)} />
            </li>
          ))}
        </ul>
      )}
      <p className="font-mono text-[11px] text-muted">
        {list.length} of {items?.length ?? 0} signed {side === "tech" ? "Tech creators" : "creators"}
      </p>
    </div>
  );
}

/** One signed creator in the list. */
function Row({ s, side, isOpen, onToggle }: { s: SignedCreator; side: Side; isOpen: boolean; onToggle: () => void }) {
  const c = s.application?.creator;
  const renewal = nextRenewal(s.contract);
  return (
    <div
      onClick={(ev) => !(ev.target as Element).closest("a") && onToggle()}
      className="grid cursor-pointer grid-cols-[40px_1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-paper-2/50 md:px-6 lg:grid-cols-[40px_minmax(0,1.3fr)_minmax(0,1.3fr)_64px_130px_minmax(0,1fr)_100px_100px]"
    >
      <span className="h-10 w-10 overflow-hidden rounded-full bg-paper-2">
        {c?.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/admin/enquiries/file/${c.photo}?side=${side}&size=thumb`} alt="" loading="lazy" className="h-full w-full object-cover" />
        )}
      </span>
      <span className="min-w-0">
        <button type="button" aria-expanded={isOpen} className="block max-w-full truncate text-left text-[15px] text-ink hover:underline" onClick={(ev) => (ev.stopPropagation(), onToggle())}>
          {nameOf(s)}
        </button>
        {!s.contract.modeEmailInBio && <span className="block text-[11px] text-pin">No Mode email in bio</span>}
        <span className="block truncate text-[12px] text-muted lg:hidden">
          {[c?.platform, c && formatCount(c.followers), contractLabel(s), c && placeOf(c), renewal && `renews ${showDate(renewal)}`].filter((x) => x && x !== "—").join(" · ")}
        </span>
      </span>
      <span className="hidden min-w-0 truncate text-[14px] lg:block">
        {c?.channelUrl ? (
          <a href={c.channelUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" title={`Open ${c.platform} in a new tab`}>
            <span className="text-muted">{c.platform}</span> {c.channel.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "")} ↗
          </a>
        ) : (
          <span className="text-ink-2">{[c?.platform, c?.channel].filter(Boolean).join(" ") || "—"}</span>
        )}
      </span>
      <span className="hidden text-right font-mono text-[13px] tabular-nums text-ink lg:block">{formatCount(c?.followers ?? null)}</span>
      <span className="hidden lg:block">
        <span className={`rounded-full px-2 py-0.5 text-[11px] ${s.contract.type === "Exclusive" ? "bg-ink text-paper" : s.contract.type ? "border border-line text-ink-2" : "bg-[#f3e3c3] text-[#6b4a12]"}`}>{contractLabel(s)}</span>
      </span>
      <span className="hidden min-w-0 truncate text-[13px] text-ink-2 lg:block">{c ? placeOf(c) : "—"}</span>
      <span className="hidden font-mono text-[12px] text-ink-2 lg:block">{showDate(s.contract.signedAt)}</span>
      <span className="font-mono text-[12px] text-ink-2 max-lg:hidden">{showDate(renewal)}</span>
    </div>
  );
}
