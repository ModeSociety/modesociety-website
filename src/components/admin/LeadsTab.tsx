"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { postJson } from "@/lib/upload";
import { CLOSED_STATUSES, ENQUIRY_KINDS, statusesFor, type Enquiry, type EnquiryKind } from "@/lib/enquiries";
import { parseChannels } from "@/lib/channels";
import type { Side } from "@/lib/side";

type Items = Record<EnquiryKind, Enquiry[]>;

/** The last list this browser saw, so coming back to Leads (or switching side) shows it at once. */
let kept: Items | null = null;
let early: Promise<Items | null> | null = null;

/**
 * Starts loading the website's kept copy as soon as the panel opens, alongside the sign-in check,
 * so the list is ready when the Leads tab appears. A signed-out visitor just gets null.
 */
export function prefetchLeads() {
  if (kept || early) return;
  // (no cache option: a "no-cache" request header makes Next skip its kept copy; the API already sends no-store)
  early = fetch("/api/admin/enquiries")
    .then((r) => r.json())
    .then((d) => (d.ok ? (kept = d.items as Items) : null))
    .catch(() => null)
    .finally(() => {
      early = null;
    });
}

const STATUS_STYLE: Record<string, string> = {
  New: "bg-ink text-white",
  Reviewing: "bg-[#f3e3c3] text-[#6b4a12]",
  Contacted: "bg-paper-2 text-ink-2",
  "Contract sent": "bg-[#e3e8fb] text-[#2f3f8f]",
  "Proposal sent": "bg-[#e3e8fb] text-[#2f3f8f]",
  Signed: "bg-[#dcebe2] text-[#2f6b4f]",
  Won: "bg-[#dcebe2] text-[#2f6b4f]",
  Declined: "bg-paper-2 text-muted line-through",
  Lost: "bg-paper-2 text-muted line-through",
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

/** A lead's channels, each a link to the profile (opens in a new tab), whether they typed a handle or a link. */
function Channels({ text }: { text: string }) {
  return (
    <ul className="grid gap-1.5 whitespace-normal">
      {parseChannels(text).map((c, i) => (
        <li key={i} className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-muted">{c.platform}</span>
          {c.url ? (
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="break-all font-medium underline underline-offset-2" title={`Open ${c.platform} in a new tab`}>
              {c.handle.replace(/^https?:\/\/(www\.)?/i, "")} ↗
            </a>
          ) : (
            <span className="break-all">{c.handle}</span>
          )}
          {c.followers && <span className="text-ink-2">· {c.followers}</span>}
        </li>
      ))}
    </ul>
  );
}

/**
 * A talent screenshot from Drive, shown through the admin-only route: the list shows the small kept
 * thumbnail, and the full file loads only when opened. PDFs fall back to a link.
 */
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
      <img src={`${src}?size=thumb`} alt={`Screenshot ${n}`} loading="lazy" decoding="async" onError={() => setBroken(true)} className="h-full w-full object-cover object-top" />
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
                {f.label.startsWith("Channels") ? <Channels text={f.value} /> : <Linkified text={f.value} />}
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
            {statusesFor(e.kind).map((s) => (
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
 * Leads: talent applications, brand call bookings and Tech enquiries, read from the
 * Google Sheet. Status changes are written back to the Sheet.
 */
export default function LeadsTab({
  disabled,
  sheetUrl,
  notify,
  side,
}: {
  disabled: boolean;
  sheetUrl?: string;
  notify: (m: string) => void;
  side: Side;
}) {
  const kinds = ENQUIRY_KINDS.filter((k) => k.side === side);
  const [items, setItems] = useState<Items | null>(kept);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // bumped by every status change or delete: a fresh list that left before it is out of date
  const writes = useRef(0);
  const [kind, setKind] = useState<EnquiryKind>(kinds[0].id);
  const [status, setStatus] = useState<string>("New");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState("");
  const [saving, setSaving] = useState("");

  /**
   * The website's kept copy first (instant), then a fresh list from the Sheet in the background, swapped
   * in when it arrives. A fresh list that left before a status change or delete is dropped and asked for
   * again, so it never undoes what was just saved.
   */
  const load = useCallback(
    async (onlyFresh = false) => {
      if (disabled) return;
      setError("");
      const get = async (fresh: boolean) => {
        const r = await fetch(`/api/admin/enquiries${fresh ? "?fresh=1" : ""}`);
        const d = await r.json();
        if (!d.ok) throw new Error(d.error);
        return d.items as Items;
      };
      try {
        if (!onlyFresh && !kept) {
          const ready = early && (await early);
          setItems((kept = ready || (await get(false))));
        }
        setLoading(true);
        for (let tries = 0; tries < 3; tries++) {
          const before = writes.current;
          const fresh = await get(true);
          if (writes.current === before) {
            setItems((kept = fresh));
            break;
          }
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [disabled],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on open
    load();
  }, [load]);
  // keep this browser's copy in step with what's on screen (status changes, deletes)
  useEffect(() => {
    if (items) kept = items;
  }, [items]);

  // one tab per status of the open lead type; search looks inside the open tab
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items?.[kind] || []).filter(
      (e) => e.status === status && (!q || [e.title, e.subtitle, e.email, e.reference, ...e.fields.map((f) => f.value)].join(" ").toLowerCase().includes(q)),
    );
  }, [items, kind, status, query]);
  const count = (k: EnquiryKind, st: string) => items?.[k].filter((e) => e.status === st).length ?? 0;
  const closed = CLOSED_STATUSES.has(status);
  const kindLabel = (k: EnquiryKind) => ENQUIRY_KINDS.find((x) => x.id === k)!.label;

  const setEnquiryStatus = async (e: Enquiry, next: string) => {
    const prev = e.status;
    const patch = (s: string) =>
      setItems((cur) => cur && { ...cur, [e.kind]: cur[e.kind].map((x) => (x.reference === e.reference ? { ...x, status: s } : x)) });
    patch(next); // show it straight away; undo if the Sheet write fails
    writes.current++;
    setSaving(e.reference);
    try {
      await postJson("/api/admin/enquiries", { kind: e.kind, reference: e.reference, status: next });
      // the lead moves to its new tab straight away
      setOpen("");
      notify(`${e.title} moved to ${next}`);
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
        ? `Delete ${list[0].title}'s ${list[0].kind === "talent" || list[0].kind === "techCreators" ? "application" : "lead"} for good? It's removed from the Sheet${list[0].files.length || list[0].folderUrl ? ", and their screenshots go to the Drive bin" : ""}.`
        : `Delete all ${list.length} ${list[0].status.toLowerCase()} leads for good? They're removed from the Sheet, and any talent screenshots go to the Drive bin.`;
    if (!confirm(ask)) return;
    const gone = new Set<string>();
    writes.current++;
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
    if (gone.size) notify(gone.size === 1 ? "Deleted" : `${gone.size} leads deleted`);
  };

  if (disabled) return <p className="text-muted">Connect the backend to see leads.</p>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lead type">
          {kinds.map((k) => {
            const fresh = count(k.id, "New");
            return (
              <button
                key={k.id}
                onClick={() => {
                  setKind(k.id);
                  if (!statusesFor(k.id).includes(status)) setStatus("New");
                  setOpen("");
                }}
                className="chip"
                aria-pressed={kind === k.id}
              >
                {k.label}
                {fresh > 0 && <span className="rounded-full bg-red px-1.5 text-[11px] font-semibold text-white">{fresh} new</span>}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${status.toLowerCase()}…`}
            aria-label={`Search the ${status} tab`}
            className="w-56 border border-line bg-white px-3 py-2"
          />
          <button className="chip" onClick={() => load(true)} disabled={loading}>
            {loading ? "Updating…" : "↻ Refresh"}
          </button>
          {sheetUrl && (
            <a className="chip" href={sheetUrl} target="_blank" rel="noreferrer">
              ▦ Sheet
            </a>
          )}
        </div>
      </div>

      {/* one tab per status, each with its count */}
      <div role="tablist" aria-label="Status" className="mb-5 flex gap-1 overflow-x-auto border-b border-line">
        {statusesFor(kind).map((st) => (
          <button
            key={st}
            role="tab"
            aria-selected={status === st}
            onClick={() => {
              setStatus(st);
              setOpen("");
            }}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-[14px] transition-colors ${
              status === st ? "border-ink font-medium text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {st}
            <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${status === st ? "bg-ink text-paper" : "bg-paper-2 text-ink-2"}`}>
              {items ? count(kind, st) : "–"}
            </span>
          </button>
        ))}
      </div>

      {error && <p className="mb-4 border-l-2 border-pin bg-paper-2 p-4 text-sm text-ink-2">Couldn&apos;t load leads: {error}</p>}
      {!items && !error && <p className="text-muted">Loading leads…</p>}

      {items && closed && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-2">
          <p>Change a lead&apos;s status to move it back, or delete it for good.</p>
          {list.length > 1 && (
            <button className="text-pin underline underline-offset-4" disabled={Boolean(saving)} onClick={() => remove(list)}>
              Delete all {list.length} {status.toLowerCase()}
            </button>
          )}
        </div>
      )}

      {items && (
        <ul className="border border-line bg-white">
          {list.length === 0 && (
            <li className="p-8 text-center text-muted">
              {count(kind, status) ? "Nothing in this tab matches that search." : `No ${status.toLowerCase()} ${kindLabel(kind).toLowerCase()}.`}
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
                    onDelete={CLOSED_STATUSES.has(e.status) ? () => remove([e]) : undefined}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted">
        Read from the Google Sheet (one tab per form). Status changes are saved there too; a declined or lost lead stays in its tab, marked so, until
        it&apos;s deleted here.
      </p>
    </div>
  );
}
