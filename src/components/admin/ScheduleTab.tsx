"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { postJson } from "@/lib/upload";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  googleCalendarUrl,
  TYPE_COLORS,
  ymd,
  type Appointment,
  type AppointmentType,
} from "@/lib/schedule";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function blank(date: string, assignee: string): Appointment {
  return { id: "", title: "", type: "Call", date, start: "10:00", end: "11:00", client: "", talent: "", location: "", notes: "", status: "Scheduled", assignee };
}

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

function gridStart(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  return addDays(first, -((first.getDay() + 6) % 7)); // back to Monday
}

function prettyDate(s: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  return new Date(`${s}T00:00:00`).toLocaleDateString("en-AU", opts);
}

function TypeDot({ type }: { type: AppointmentType }) {
  return <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: TYPE_COLORS[type] }} aria-hidden />;
}

export default function ScheduleTab({
  me,
  team,
  disabled,
  notify,
}: {
  me: string;
  team: string[];
  disabled: boolean;
  notify: (m: string) => void;
}) {
  const today = ymd(new Date());
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mine, setMine] = useState(false);
  const [day, setDay] = useState<string | null>(null);
  const [editing, setEditing] = useState<Appointment | null>(null);

  const days = useMemo(() => {
    const start = gridStart(month);
    return Array.from({ length: 42 }, (_, i) => ymd(addDays(start, i)));
  }, [month]);
  // one fetch covers the visible grid and the next 30 days for the "Coming up" list
  const from = days[0] < today ? days[0] : today;
  const later = ymd(addDays(new Date(), 30));
  const to = days[41] > later ? days[41] : later;

  const load = useCallback(async () => {
    if (disabled) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/admin/schedule?from=${from}&to=${to}`, { cache: "no-store" });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      setItems(d.items);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [from, to, disabled]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch when the visible range changes
    load();
  }, [load]);

  const visible = mine ? items.filter((a) => a.assignee === me) : items;
  const byDay = useMemo(() => {
    const m = new Map<string, Appointment[]>();
    for (const a of visible) m.set(a.date, [...(m.get(a.date) || []), a]);
    return m;
  }, [visible]);
  const panel = day
    ? byDay.get(day) || []
    : visible.filter((a) => a.date >= today && a.date <= later && a.status !== "Cancelled").slice(0, 12);

  if (disabled) return <p className="text-muted">Connect the backend to use the schedule.</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button className="chip !px-3" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month">
              ←
            </button>
            <h2 className="font-display min-w-[9ch] text-center text-lg sm:min-w-[11ch] sm:text-xl">{month.toLocaleDateString("en-AU", { month: "long", year: "numeric" })}</h2>
            <button className="chip !px-3" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month">
              →
            </button>
            <button
              className="ml-1 text-sm underline underline-offset-4"
              onClick={() => {
                setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
                setDay(null);
              }}
            >
              Today
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-line p-1 text-xs uppercase tracking-[0.12em]" role="group" aria-label="Show">
              {(["All", "Mine"] as const).map((k) => (
                <button
                  key={k}
                  aria-pressed={mine === (k === "Mine")}
                  onClick={() => setMine(k === "Mine")}
                  className={`rounded-full px-3 py-1.5 ${mine === (k === "Mine") ? "bg-ink text-white" : "text-ink-2"}`}
                >
                  {k}
                </button>
              ))}
            </div>
            <button className="btn !py-3" onClick={() => setEditing(blank(day || today, me))}>
              + New appointment
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
          {APPOINTMENT_TYPES.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <TypeDot type={t} /> {t}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 overflow-hidden rounded-[6px] border border-line bg-white">
          {WEEKDAYS.map((w) => (
            <div key={w} className="border-b border-line px-2 py-2 text-[11px] uppercase tracking-[0.14em] text-muted">
              {w}
            </div>
          ))}
          {days.map((d) => {
            const list = byDay.get(d) || [];
            const outside = Number(d.slice(5, 7)) !== month.getMonth() + 1;
            const selected = day === d;
            return (
              <div
                key={d}
                role="button"
                tabIndex={0}
                aria-label={`${prettyDate(d, { weekday: "long", day: "numeric", month: "long" })}, ${list.length} appointment${list.length === 1 ? "" : "s"}`}
                onClick={() => setDay(selected ? null : d)}
                onDoubleClick={() => setEditing(blank(d, me))}
                onKeyDown={(e) => e.key === "Enter" && setDay(selected ? null : d)}
                className={`group min-h-[64px] cursor-pointer border-b border-r border-line p-1.5 text-left transition-colors md:min-h-[104px] ${
                  outside ? "bg-paper-2/60" : ""
                } ${selected ? "bg-ink/[0.06] ring-1 ring-inset ring-ink" : "hover:bg-paper-2/60"}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-xs ${d === today ? "bg-ink text-white" : outside ? "text-muted" : "text-ink"}`}
                  >
                    {Number(d.slice(8))}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(blank(d, me));
                    }}
                    className="hidden h-6 w-6 place-items-center rounded-full text-ink-2 hover:bg-ink hover:text-white group-hover:grid"
                    aria-label={`Add an appointment on ${prettyDate(d)}`}
                  >
                    +
                  </button>
                </div>
                {/* phones: dots only; larger screens: time + title */}
                <div className="mt-1 flex flex-wrap gap-1 md:hidden">
                  {list.slice(0, 4).map((a) => (
                    <TypeDot key={a.id} type={a.type} />
                  ))}
                </div>
                <div className="mt-1 hidden gap-1 md:grid">
                  {list.slice(0, 3).map((a) => (
                    <button
                      key={a.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(a);
                      }}
                      className={`flex items-center gap-1.5 truncate rounded-[3px] bg-paper-2 px-1.5 py-0.5 text-left text-[11px] text-ink hover:bg-line/60 ${
                        a.status === "Cancelled" ? "line-through opacity-50" : a.status === "Done" ? "opacity-60" : ""
                      }`}
                      title={`${a.start ? `${a.start} ` : ""}${a.title}`}
                    >
                      <span className="h-3 w-[3px] shrink-0 rounded-full" style={{ background: TYPE_COLORS[a.type] }} aria-hidden />
                      <span className="truncate">
                        {a.start && <span className="text-ink-2">{a.start} </span>}
                        {a.title}
                      </span>
                    </button>
                  ))}
                  {list.length > 3 && <span className="px-1 text-[11px] text-muted">+{list.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">
          <span className="hidden md:inline">Click a day to see it on the right · double-click (or +) to add an appointment there.</span>
          <span className="md:hidden">Tap a day to see it below · &ldquo;New appointment&rdquo; adds one on the day you picked.</span>
        </p>
        {loading && <p className="mt-2 text-sm text-muted">Loading…</p>}
        {error && <p className="mt-2 text-sm text-pin">{error}</p>}
      </section>

      <aside className="lg:pt-[52px]">
        <div className="flex items-baseline justify-between">
          <h3 className="eyebrow !text-ink">{day ? prettyDate(day, { weekday: "long", day: "numeric", month: "long" }) : "Coming up · next 30 days"}</h3>
          {day && (
            <button className="text-xs underline underline-offset-4" onClick={() => setDay(null)}>
              Show coming up
            </button>
          )}
        </div>
        <ul className="mt-3 grid gap-2">
          {panel.map((a) => (
            <li key={a.id}>
              <button onClick={() => setEditing(a)} className="w-full rounded-[6px] border border-line bg-white p-3 text-left transition hover:border-ink">
                <div className="flex items-center gap-2 text-xs text-ink-2">
                  <TypeDot type={a.type} />
                  {a.type}
                  {!day && <span>· {prettyDate(a.date)}</span>}
                  {a.start && (
                    <span>
                      · {a.start}
                      {a.end && `–${a.end}`}
                    </span>
                  )}
                  {a.status !== "Scheduled" && <span className="ml-auto rounded-full bg-paper-2 px-2 py-0.5">{a.status}</span>}
                </div>
                <div className={`mt-1 font-medium text-ink ${a.status === "Cancelled" ? "line-through" : ""}`}>{a.title}</div>
                {(a.client || a.assignee) && (
                  <div className="mt-0.5 text-xs text-muted">
                    {[a.client, a.assignee && `→ ${a.assignee === me ? "you" : a.assignee}`].filter(Boolean).join(" · ")}
                  </div>
                )}
              </button>
            </li>
          ))}
          {!panel.length && (
            <li className="rounded-[6px] border border-dashed border-line p-4 text-sm text-muted">
              {day ? "Nothing on this day." : "Nothing booked in the next 30 days."}
            </li>
          )}
        </ul>
      </aside>

      {editing && (
        <Editor
          initial={editing}
          team={team}
          me={me}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null);
            notify(msg);
            load();
          }}
        />
      )}
    </div>
  );
}

function Editor({
  initial,
  team,
  me,
  onClose,
  onSaved,
}: {
  initial: Appointment;
  team: string[];
  me: string;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [a, setA] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof Appointment>(k: K, v: Appointment[K]) => setA((x) => ({ ...x, [k]: v }));
  const field = (k: "title" | "client" | "talent" | "location") => (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [onClose]);

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await postJson("/api/admin/schedule", { item: a });
      onSaved(a.id ? "Appointment updated" : "Appointment added");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!confirm(`Delete "${a.title}"?`)) return;
    setBusy(true);
    try {
      await postJson("/api/admin/schedule", { id: a.id }, "DELETE");
      onSaved("Appointment deleted");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-label={a.id ? "Edit appointment" : "New appointment"}
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="max-h-[92svh] w-full max-w-[640px] overflow-y-auto rounded-[8px] bg-paper p-6 shadow-2xl md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl">{a.id ? "Edit appointment" : "New appointment"}</h2>
          <button type="button" onClick={onClose} className="text-xl text-ink-2" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="mt-6 grid gap-6">
          <div className="field">
            <label htmlFor="ap-title">Title *</label>
            <input id="ap-title" className="input" value={a.title} onChange={field("title")} placeholder="e.g. Call with Glow Co about their November launch" autoFocus />
          </div>
          <div className="field">
            <span className="label">Type</span>
            <div className="flex flex-wrap gap-2">
              {APPOINTMENT_TYPES.map((t) => (
                <button type="button" key={t} className="chip" aria-pressed={a.type === t} onClick={() => set("type", t)}>
                  <TypeDot type={t} /> {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="field">
              <label htmlFor="ap-date">Date *</label>
              <input id="ap-date" type="date" className="input" value={a.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ap-start">Start</label>
              <input id="ap-start" type="time" className="input" value={a.start} onChange={(e) => set("start", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ap-end">End</label>
              <input id="ap-end" type="time" className="input" value={a.end} onChange={(e) => set("end", e.target.value)} />
            </div>
          </div>
          <label className="-mt-3 flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--ink)]"
              checked={!a.start}
              onChange={(e) => setA((x) => ({ ...x, start: e.target.checked ? "" : "10:00", end: e.target.checked ? "" : "11:00" }))}
            />
            All day
          </label>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="ap-client">Client / brand</label>
              <input id="ap-client" className="input" value={a.client} onChange={field("client")} />
            </div>
            <div className="field">
              <label htmlFor="ap-talent">Talent</label>
              <input id="ap-talent" className="input" value={a.talent} onChange={field("talent")} placeholder="Who's involved" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="ap-location">Location or meeting link</label>
            <input id="ap-location" className="input" value={a.location} onChange={field("location")} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="ap-assignee">Assigned to</label>
              <select id="ap-assignee" className="input" value={a.assignee} onChange={(e) => set("assignee", e.target.value)}>
                <option value="">Unassigned</option>
                {team.map((t) => (
                  <option key={t} value={t}>
                    {t === me ? `${t} (you)` : t}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <span className="label">Status</span>
              <div className="flex flex-wrap gap-2">
                {APPOINTMENT_STATUSES.map((s) => (
                  <button type="button" key={s} className="chip" aria-pressed={a.status === s} onClick={() => set("status", s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="field">
            <label htmlFor="ap-notes">Notes</label>
            <textarea id="ap-notes" className="input !min-h-[80px]" value={a.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-pin">{error}</p>}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button className="btn" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          {a.title && a.date && (
            <a href={googleCalendarUrl(a)} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">
              Add to Google Calendar ↗
            </a>
          )}
          {a.id && (
            <button type="button" className="ml-auto text-sm text-pin underline underline-offset-4" disabled={busy} onClick={remove}>
              Delete
            </button>
          )}
        </div>
        {a.createdBy && <p className="mt-4 text-xs text-muted">Added by {a.createdBy}</p>}
      </form>
    </div>
  );
}
