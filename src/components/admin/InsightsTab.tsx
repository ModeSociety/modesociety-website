"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SideFilter } from "@/lib/side";
import { SOURCE_COLORS, SOURCE_LABELS, SOURCES, type Source, type Stats } from "@/lib/insights";

const RANGES = [7, 30, 90] as const;
const INK = "#7f090d";
const GRID = "#efe6e1";
const MUTED = "#9a6b6c";

const fmt = (n: number) => n.toLocaleString("en-AU");
const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);
const shortDate = (s: string) => new Date(`${s}T00:00:00`).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
const countryName = (() => {
  try {
    const names = new Intl.DisplayNames(["en-AU"], { type: "region" });
    return (code: string) => names.of(code) || code;
  } catch {
    return (code: string) => code;
  }
})();

/** Change against the previous period, spelled out (never colour alone). */
function Delta({ now, before }: { now: number; before: number }) {
  if (!before && !now) return <span className="text-xs text-muted">no data yet</span>;
  if (!before) return <span className="text-xs text-ink-2">new this period</span>;
  const change = Math.round(((now - before) / before) * 100);
  return (
    <span className="text-xs text-ink-2">
      {change === 0 ? "→ same as" : change > 0 ? `▲ ${change}% vs` : `▼ ${Math.abs(change)}% vs`} previous {fmt(before)}
    </span>
  );
}

function Tile({ label, value, sub, hero = false }: { label: string; value: string; sub?: React.ReactNode; hero?: boolean }) {
  return (
    <div className={`rounded-[6px] border p-5 ${hero ? "border-ink bg-white" : "border-line bg-white"}`}>
      <div className="text-xs uppercase tracking-[0.14em] text-ink-2">{label}</div>
      <div className={`font-display mt-2 leading-none text-ink ${hero ? "text-[44px]" : "text-[30px]"}`}>{value}</div>
      {sub && <div className="mt-2">{sub}</div>}
    </div>
  );
}

function Panel({ title, note, children, className = "" }: { title: string; note?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[6px] border border-line bg-white p-5 ${className}`}>
      <h3 className="font-medium text-ink">{title}</h3>
      {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Ranked list with a thin single-hue bar for magnitude; labels and values stay in ink. */
function BarList({ rows, total, label = (k: string) => k, color = INK }: { rows: { key: string; value: number }[]; total: number; label?: (k: string) => string; color?: string }) {
  if (!rows.length) return <p className="text-sm text-muted">Nothing yet.</p>;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <ul className="grid gap-2.5">
      {rows.map((r) => (
        <li key={r.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-sm">
          <span className="truncate text-ink" title={label(r.key)}>
            {label(r.key)}
          </span>
          <span className="tabular-nums text-ink-2">
            {fmt(r.value)} <span className="text-muted">· {pct(r.value, total)}%</span>
          </span>
          <span className="col-span-2 h-1.5 rounded-full bg-paper-2">
            <span className="block h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: color }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Daily sessions, stacked by source. 2px surface gaps between segments, rounded top, hover tooltip per day. */
function DailyChart({ daily }: { daily: Stats["daily"] }) {
  const [hover, setHover] = useState<number | null>(null);
  // drawn at the container's real pixel width so text and marks keep their size on any screen
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(760);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(280, Math.round(el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 220;
  const pad = { l: 34, r: 8, t: 10, b: 26 };
  const totals = daily.map((d) => SOURCES.reduce((s, k) => s + d[k], 0));
  const max = Math.max(4, ...totals);
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const ticks = [0, top / 2, top];
  const slot = (W - pad.l - pad.r) / daily.length;
  const bw = Math.max(2, Math.min(28, slot * 0.68));
  const y = (v: number) => pad.t + (1 - v / top) * (H - pad.t - pad.b);
  const labelEvery = Math.ceil(daily.length / Math.max(2, Math.floor(W / 90)));

  return (
    <div ref={box} className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block max-w-full" role="img" aria-label="Daily sessions by source" onPointerLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill={MUTED}>
              {fmt(t)}
            </text>
          </g>
        ))}
        {daily.map((d, i) => {
          const cx = pad.l + slot * i + slot / 2;
          let acc = 0;
          const present = SOURCES.filter((k) => d[k] > 0);
          return (
            <g key={d.date} onPointerEnter={() => setHover(i)}>
              {/* hit target: the whole column, wider than the bar */}
              <rect x={pad.l + slot * i} y={pad.t} width={slot} height={H - pad.t - pad.b} fill="transparent" />
              {present.map((k, j) => {
                const y0 = y(acc);
                acc += d[k];
                const y1 = y(acc);
                const h = Math.max(0, y0 - y1 - (j < present.length - 1 ? 2 : 0)); // 2px gap above each segment
                const isTop = j === present.length - 1;
                const r = isTop ? Math.min(4, bw / 2, h) : 0;
                const x = cx - bw / 2;
                const yy = y0 - h;
                const path = `M${x},${y0} V${yy + r} Q${x},${yy} ${x + r},${yy} H${x + bw - r} Q${x + bw},${yy} ${x + bw},${yy + r} V${y0} Z`;
                return <path key={k} d={path} fill={SOURCE_COLORS[k]} opacity={hover === null || hover === i ? 1 : 0.45} />;
              })}
              {i % labelEvery === 0 && (
                <text x={cx} y={H - 8} textAnchor="middle" fontSize="11" fill={MUTED}>
                  {shortDate(d.date)}
                </text>
              )}
            </g>
          );
        })}
        <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} stroke="#d9c7c0" strokeWidth={1} />
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 min-w-[170px] rounded-[6px] border border-line bg-white px-3 py-2 text-xs shadow-lg"
          style={{
            left: `${((pad.l + slot * hover + slot / 2) / W) * 100}%`,
            transform: `translateX(${hover > daily.length / 2 ? "calc(-100% - 10px)" : "10px"})`,
          }}
        >
          <div className="mb-1 font-semibold text-ink">
            {new Date(`${daily[hover].date}T00:00:00`).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
          </div>
          {SOURCES.map((k) => (
            <div key={k} className="flex items-center justify-between gap-4 text-ink-2">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-[2px]" style={{ background: SOURCE_COLORS[k] }} />
                {SOURCE_LABELS[k]}
              </span>
              <span className="tabular-nums text-ink">{daily[hover][k]}</span>
            </div>
          ))}
          <div className="mt-1 flex justify-between border-t border-line pt-1 text-ink">
            <span>Visits · page views</span>
            <span className="tabular-nums">
              {totals[hover]} · {daily[hover].pageviews}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InsightsTab({ disabled, side = "all" }: { disabled: boolean; side?: SideFilter }) {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [table, setTable] = useState(false);

  useEffect(() => {
    if (disabled) return;
    let live = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch when the range changes
    setLoading(true);
    setError("");
    fetch(`/api/admin/stats?days=${days}&side=${side}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        if (!d.ok) throw new Error(d.error);
        setStats(d.stats);
      })
      .catch((err) => live && setError((err as Error).message))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [days, disabled, side]);

  const sourceRows = useMemo(
    () => (stats ? SOURCES.map((k) => ({ key: k, value: stats.sources[k] || 0 })) : []),
    [stats],
  );

  if (disabled) return <p className="text-muted">Connect the backend to see site insights.</p>;

  const t = stats?.totals;
  const p = stats?.previous;
  // the business rows for the side being viewed
  const businessRows: [string, number, number][] = stats
    ? ([
        ["Talent applications", stats.forms.talent, stats.forms.previous.talent, "talent"],
        ["Brand call bookings", stats.forms.bookings, stats.forms.previous.bookings, "talent"],
        ["Partnership enquiries", stats.forms.partners, stats.forms.previous.partners, "talent"],
        ["Tech brand enquiries", stats.forms.techBrands ?? 0, stats.forms.previous.techBrands ?? 0, "tech"],
        ["Tech creator applications", stats.forms.techCreators ?? 0, stats.forms.previous.techCreators ?? 0, "tech"],
      ] as const)
        .filter((r) => side === "all" || r[3] === side)
        .map((r) => [r[0], r[1], r[2]])
    : [];
  const enquiries = businessRows.reduce((s, r) => s + r[1], 0);
  const prevEnquiries = businessRows.reduce((s, r) => s + r[2], 0);
  const deviceRows = stats ? (["mobile", "desktop", "tablet"] as const).map((k) => ({ key: k, value: stats.devices[k] || 0 })).filter((r) => r.value) : [];

  return (
    <div className="grid gap-6">
      {/* filters: one row, above everything they affect */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full border border-line p-1 text-xs uppercase tracking-[0.12em]" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button key={r} aria-pressed={days === r} onClick={() => setDays(r)} className={`rounded-full px-4 py-1.5 ${days === r ? "bg-ink text-white" : "text-ink-2"}`}>
              Last {r} days
            </button>
          ))}
        </div>
        <span className="text-xs text-muted">
          {stats ? `${shortDate(stats.range.from)} – ${shortDate(stats.range.to)} · compared with the ${days} days before` : ""}
          {loading && " · loading…"}
        </span>
      </div>
      {error && <p className="text-sm text-pin">{error}</p>}

      {stats && t && p && (
        <>
          {t.pageviews === 0 && (
            <div className="rounded-[6px] border-l-2 border-ink bg-white p-4 text-sm text-ink-2">
              No visits recorded in this period yet. The site counts visits from the moment this version is live (your own visits while signed in to
              the admin panel aren&apos;t counted).
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
              <Tile hero label="Organic search visits" value={fmt(t.organic)} sub={<Delta now={t.organic} before={p.organic} />} />
            </div>
            <Tile label="Visitors" value={fmt(t.visitors)} sub={<Delta now={t.visitors} before={p.visitors} />} />
            <Tile label="Visits" value={fmt(t.sessions)} sub={<Delta now={t.sessions} before={p.sessions} />} />
            <Tile label="Page views" value={fmt(t.pageviews)} sub={<span className="text-xs text-ink-2">{t.pagesPerSession} pages per visit</span>} />
            <Tile
              label="Enquiries"
              value={fmt(enquiries)}
              sub={<span className="text-xs text-ink-2">{t.sessions ? `${((enquiries / t.sessions) * 100).toFixed(1)}% of visits` : "—"}</span>}
            />
          </div>

          <Panel title="Visits per day, by source" note="A visit is one browsing session. Hover a day for the breakdown.">
            <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-2">
              {SOURCES.map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: SOURCE_COLORS[k] }} />
                  {SOURCE_LABELS[k]} <span className="tabular-nums text-ink">{fmt(stats.sources[k] || 0)}</span>
                </span>
              ))}
            </div>
            <DailyChart daily={stats.daily} />
            <button className="mt-3 text-xs underline underline-offset-4" onClick={() => setTable((v) => !v)} aria-expanded={table}>
              {table ? "Hide table" : "View as table"}
            </button>
            {table && (
              <div className="mt-3 max-h-72 overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-white text-ink-2">
                    <tr>
                      <th className="py-1.5 pr-3 font-medium">Date</th>
                      {SOURCES.map((k) => (
                        <th key={k} className="py-1.5 pr-3 text-right font-medium">
                          {SOURCE_LABELS[k]}
                        </th>
                      ))}
                      <th className="py-1.5 text-right font-medium">Page views</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {[...stats.daily].reverse().map((d) => (
                      <tr key={d.date} className="border-t border-line">
                        <td className="py-1.5 pr-3">{shortDate(d.date)}</td>
                        {SOURCES.map((k) => (
                          <td key={k} className="py-1.5 pr-3 text-right">
                            {d[k]}
                          </td>
                        ))}
                        <td className="py-1.5 text-right">{d.pageviews}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Where visits come from" note="Organic search = Google, Bing etc. without ads.">
              <ul className="grid gap-2.5">
                {sourceRows.map((r) => (
                  <li key={r.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-sm">
                    <span className="inline-flex items-center gap-2 text-ink">
                      <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: SOURCE_COLORS[r.key as Source] }} />
                      {SOURCE_LABELS[r.key as Source]}
                    </span>
                    <span className="tabular-nums text-ink-2">
                      {fmt(r.value)} <span className="text-muted">· {pct(r.value, t.sessions)}%</span>
                    </span>
                    <span className="col-span-2 h-1.5 rounded-full bg-paper-2">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${pct(r.value, Math.max(...sourceRows.map((x) => x.value), 1))}%`, background: SOURCE_COLORS[r.key as Source] }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Top pages" note="By page views.">
              <BarList rows={stats.pages} total={t.pageviews} />
            </Panel>
            <Panel title="Top referring sites" note="Search engines, socials and other sites that sent visits.">
              <BarList rows={stats.referrers} total={t.sessions} />
            </Panel>
            <Panel title="Devices">
              <BarList rows={deviceRows} total={t.sessions} label={(k) => k[0].toUpperCase() + k.slice(1)} />
            </Panel>
            <Panel title="Countries">
              <BarList rows={stats.countries} total={t.sessions} label={countryName} />
            </Panel>
            <Panel title="Business" note={`Last ${days} days, compared with the ${days} days before.`}>
              <dl className="grid gap-3 text-sm">
                {businessRows.map(([label, now, before]) => (
                  <div key={label} className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
                    <dt className="text-ink">{label}</dt>
                    <dd className="text-right">
                      <span className="font-display text-xl tabular-nums text-ink">{now}</span>
                      <div>
                        <Delta now={now} before={before} />
                      </div>
                    </dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
                  <dt className="text-ink">All enquiries</dt>
                  <dd className="text-right">
                    <span className="font-display text-xl tabular-nums text-ink">{enquiries}</span>
                    <div>
                      <Delta now={enquiries} before={prevEnquiries} />
                    </div>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink">Appointments</dt>
                  <dd className="text-right text-ink-2">
                    <span className="font-display text-xl tabular-nums text-ink">{stats.schedule.thisPeriod}</span> this period ·{" "}
                    <span className="tabular-nums text-ink">{stats.schedule.upcoming}</span> coming up
                  </dd>
                </div>
              </dl>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
