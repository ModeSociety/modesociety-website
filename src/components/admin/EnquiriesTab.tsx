"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { postJson } from "@/lib/upload";
import { ENQUIRY_KINDS, ENQUIRY_STATUSES, type Enquiry, type EnquiryKind } from "@/lib/enquiries";
import type { SideFilter } from "@/lib/side";

type Items = Record<EnquiryKind, Enquiry[]>;
/** an enquiry type, or "declined": every declined enquiry, wherever it came from */
type View = EnquiryKind | "declined";

const STATUS_STYLE: Record<string, string> = {
  New: "bg-ink text-white",
  Reviewing: "bg-[#f3e3c3] text-[#6b4a12]",
  Contacted: "bg-paper-2 text-ink-2",
  "Signed / Booked": "bg-[#dcebe2] text-[#2f6b4f]",
  Declined: "bg-paper-2 text-muted line-through",
};

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
}

function StatusPill({ status }: { status: string }) {
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLE[status] || "bg-paper-2 text-ink-2"}`}>{status}</span>;
}

/** Plain text with any web addresses made clickable. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a key={i} href={p} target="_blank" rel="noreferrer" className="break-all underline underline-offset-2">
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/** A talent screenshot from Drive, shown through the admin-only route; PDFs fall back to a link. */
function Shot({ id, n }: { id: string; n: number }) {
  const [broken, setBroken] = useState(false);
  const src = `/api/admin/enquiries/file/${id}`;
  if (broken)
    return (
      <a href={src} target="_blank" rel="noreferrer" className="grid aspect-[3/4] place-items-center border border-line bg-paper-2 text-sm text-ink-2 underline">
        File {n} ↗
      </a>
    );
  return (
    <a href={src} target="_blank" rel="noreferrer" className="block aspect-[3/4] overflow-hidden border border-line bg-paper-2" title="Open full size">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`Screenshot ${n}`} loading="lazy" onError={() => setBroken(true)} className="h-full w-full object-cover object-top" />
    </a>
  );
}

function Detail({ e, onStatus, onDelete, saving }: { e: Enquiry; onStatus: (s: string) => void; onDelete?: () => void; saving: boolean }) {
  const subject = encodeURIComponent(`Mode Society — ${e.kind === "talent" ? "your application" : "your enquiry"} (${e.reference})`);
  return (
    <div className="grid gap-8 border-t border-line bg-paper-2/40 px-4 py-6 md:grid-cols-[1fr_240px] md:px-6">
      <div className="min-w-0">
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {e.fields.map((f) => (
            <div key={f.label} className={f.value.length > 80 || f.value.includes("\n") ? "sm:col-span-2" : ""}>
              <dt className="eyebrow">{f.label}</dt>
              <dd className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-ink">
                <Linkified text={f.value} />
              </dd>
            </div>
          ))}
        </dl>
        {e.files.length > 0 && (
          <div className="mt-8">
            <p className="eyebrow mb-3">Engagement screenshots ({e.files.length})</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
              {e.files.map((id, i) => (
                <Shot key={id} id={id} n={i + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
      <aside className="grid content-start gap-4 text-sm">
        <label className="grid gap-1.5">
          <span className="eyebrow">Status</span>
          <select
            value={e.status}
            disabled={saving}
            onChange={(ev) => onStatus(ev.target.value)}
            className="border border-line bg-white px-3 py-2 text-[15px] text-ink"
          >
            {ENQUIRY_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        {e.email && (
          <a href={`mailto:${e.email}?subject=${subject}`} className="btn !justify-start">
            Email {e.kind === "talent" ? e.title.split(" ")[0] : e.subtitle.split(" ")[0] || "them"} <span className="arrow">→</span>
          </a>
        )}
        {e.folderUrl && (
          <a href={e.folderUrl} target="_blank" rel="noreferrer" className="link-underline w-fit text-ink-2">
            Application folder in Drive ↗
          </a>
        )}
        {onDelete && (
          <button onClick={onDelete} disabled={saving} className="w-fit text-pin underline underline-offset-4">
            Delete permanently
          </button>
        )}
        <p className="font-mono text-[11px] text-muted">
          Ref {e.reference || "—"} · {new Date(e.submittedAt).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </aside>
    </div>
  );
}

/**
 * Talent applications, brand call bookings and partnership enquiries, read from the
 * Google Sheet. Status changes are written back to the Sheet.
 */
export default function EnquiriesTab({
  disabled,
  sheetUrl,
  notify,
  side = "all",
}: {
  disabled: boolean;
  sheetUrl?: string;
  notify: (m: string) => void;
  side?: SideFilter;
}) {
  const kinds = ENQUIRY_KINDS.filter((k) => side === "all" || k.side === side);
  const [items, setItems] = useState<Items | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<View>(kinds[0].id);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState("");
  const [saving, setSaving] = useState("");

  const load = useCallback(async () => {
    if (disabled) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/admin/enquiries", { cache: "no-store" });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      setItems(d.items);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [disabled]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on open
    load();
  }, [load]);

  // declined enquiries leave their own list for the Declined view, where they can be deleted
  const declined = useMemo(
    () =>
      kinds
        .flatMap((k) => (items?.[k.id] || []).filter((e) => e.status === "Declined"))
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [items, kinds],
  );
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = kind === "declined" ? declined : (items?.[kind] || []).filter((e) => e.status !== "Declined");
    return pool.filter(
      (e) =>
        (kind === "declined" || status === "all" || (status === "open" ? e.status !== "Signed / Booked" : e.status === status)) &&
        (!q || [e.title, e.subtitle, e.email, e.reference, ...e.fields.map((f) => f.value)].join(" ").toLowerCase().includes(q)),
    );
  }, [items, kind, status, query, declined]);
  const kindLabel = (k: EnquiryKind) => ENQUIRY_KINDS.find((x) => x.id === k)!.label;

  const setEnquiryStatus = async (e: Enquiry, next: string) => {
    const prev = e.status;
    const patch = (s: string) =>
      setItems((cur) => cur && { ...cur, [e.kind]: cur[e.kind].map((x) => (x.reference === e.reference ? { ...x, status: s } : x)) });
    patch(next); // show it straight away; undo if the Sheet write fails
    setSaving(e.reference);
    try {
      await postJson("/api/admin/enquiries", { kind: e.kind, reference: e.reference, status: next });
      if (next === "Declined") {
        setOpen("");
        notify(`${e.title} moved to Declined`);
      } else if (prev === "Declined") {
        setOpen("");
        notify(`${e.title} moved back to ${kindLabel(e.kind)}`);
      } else notify(`Marked ${next.toLowerCase()}`);
    } catch (err) {
      patch(prev);
      notify((err as Error).message);
    } finally {
      setSaving("");
    }
  };

  const remove = async (list: Enquiry[]) => {
    if (!list.length) return;
    const ask =
      list.length === 1
        ? `Delete ${list[0].title}'s ${list[0].kind === "talent" || list[0].kind === "techCreators" ? "application" : "enquiry"} for good? It's removed from the Sheet${list[0].files.length || list[0].folderUrl ? ", and their screenshots go to the Drive bin" : ""}.`
        : `Delete all ${list.length} declined enquiries for good? They're removed from the Sheet, and any talent screenshots go to the Drive bin.`;
    if (!confirm(ask)) return;
    const gone = new Set<string>();
    for (const e of list) {
      setSaving(e.reference);
      try {
        await postJson("/api/admin/enquiries", { kind: e.kind, reference: e.reference }, "DELETE");
        gone.add(`${e.kind}:${e.reference}`);
      } catch (err) {
        notify((err as Error).message);
        break;
      }
    }
    setSaving("");
    setOpen("");
    setItems((cur) => cur && (Object.fromEntries(Object.entries(cur).map(([k, v]) => [k, v.filter((x) => !gone.has(`${x.kind}:${x.reference}`))])) as Items));
    if (gone.size) notify(gone.size === 1 ? "Deleted" : `${gone.size} enquiries deleted`);
  };

  if (disabled) return <p className="text-muted">Connect the backend to see enquiries.</p>;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Enquiry type">
          {kinds.map((k) => {
            const fresh = items?.[k.id].filter((e) => e.status === "New").length || 0;
            const count = items ? items[k.id].filter((e) => e.status !== "Declined").length : "–";
            return (
              <button
                key={k.id}
                onClick={() => {
                  setKind(k.id);
                  setOpen("");
                }}
                className="chip"
                aria-pressed={kind === k.id}
              >
                {k.label}
                <span className="text-[12px] opacity-70">{count}</span>
                {fresh > 0 && <span className="rounded-full bg-red px-1.5 text-[11px] font-semibold text-white">{fresh} new</span>}
              </button>
            );
          })}
          <button
            onClick={() => {
              setKind("declined");
              setOpen("");
            }}
            className="chip"
            aria-pressed={kind === "declined"}
          >
            Declined
            <span className="text-[12px] opacity-70">{items ? declined.length : "–"}</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search names, emails, answers…"
            className="w-56 border border-line bg-white px-3 py-2"
          />
          {kind !== "declined" && (
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-line bg-white px-3 py-2" aria-label="Filter by status">
              <option value="all">All statuses</option>
              <option value="open">Still open</option>
              {ENQUIRY_STATUSES.filter((s) => s !== "Declined").map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          )}
          <button className="chip" onClick={load} disabled={loading}>
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
          {sheetUrl && (
            <a className="chip" href={sheetUrl} target="_blank" rel="noreferrer">
              ▦ Sheet
            </a>
          )}
        </div>
      </div>

      {error && <p className="mb-4 border-l-2 border-pin bg-paper-2 p-4 text-sm text-ink-2">Couldn&apos;t load enquiries: {error}</p>}
      {!items && !error && <p className="text-muted">Loading enquiries…</p>}

      {items && kind === "declined" && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-2">
          <p>Everything marked Declined, from every form. Change its status to move it back, or delete it for good.</p>
          {declined.length > 1 && (
            <button className="text-pin underline underline-offset-4" disabled={Boolean(saving)} onClick={() => remove(declined)}>
              Delete all {declined.length} declined
            </button>
          )}
        </div>
      )}

      {items && (
        <ul className="border border-line bg-white">
          {list.length === 0 && (
            <li className="p-8 text-center text-muted">
              {kind === "declined"
                ? declined.length
                  ? "Nothing matches that search."
                  : "Nothing declined. Enquiries you mark Declined move here."
                : items[kind].some((e) => e.status !== "Declined")
                  ? "Nothing matches that search or filter."
                  : `No ${kindLabel(kind).toLowerCase()} yet.`}
            </li>
          )}
          {list.map((e) => {
            const isOpen = open === e.reference;
            return (
              <li key={e.reference || e.submittedAt} className="border-b border-line last:border-b-0">
                <button
                  onClick={() => setOpen(isOpen ? "" : e.reference)}
                  aria-expanded={isOpen}
                  className={`grid w-full grid-cols-[64px_1fr_auto] items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-paper-2/50 md:grid-cols-[90px_1fr_1fr_auto] md:px-6 ${
                    e.status === "New" ? "font-medium" : ""
                  }`}
                >
                  <span className="font-mono text-[12px] text-muted">{when(e.submittedAt)}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] text-ink">{e.title}</span>
                    <span className="block truncate text-[13px] text-muted md:hidden">{e.subtitle || e.email}</span>
                  </span>
                  <span className="hidden min-w-0 truncate text-[14px] text-ink-2 md:block">
                    {kind === "declined" && <span className="text-muted">{kindLabel(e.kind)} · </span>}
                    {e.subtitle}
                    {e.subtitle && e.email ? " · " : ""}
                    {e.email}
                  </span>
                  <StatusPill status={e.status} />
                </button>
                {isOpen && (
                  <Detail
                    e={e}
                    saving={saving === e.reference}
                    onStatus={(s) => setEnquiryStatus(e, s)}
                    onDelete={e.status === "Declined" ? () => remove([e]) : undefined}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted">
        Read from the Google Sheet (one tab per form). Status changes are saved there too; a declined enquiry stays in its tab, marked Declined, until
        it&apos;s deleted here.
      </p>
    </div>
  );
}
