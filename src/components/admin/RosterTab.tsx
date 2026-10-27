"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { encodeFile, postJson } from "@/lib/upload";
import { compact, PLATFORMS, ROSTER_TYPES, totalFollowers, type PlatformId, type RosterMember } from "@/lib/tech";

type Member = RosterMember & { photoUrl?: string };

const blank = (): Member => ({
  id: "",
  order: 0,
  name: "",
  handle: "",
  type: "Creator",
  niche: "",
  region: "",
  quote: "",
  featured: false,
  visible: true,
  photo: "",
  photoUrl: "",
  platforms: {},
});

/** ModeSociety Tech's key numbers on For brands (combined followers come from the roster). */
function TechNumbers({ initial, notify }: { initial: { views: string; campaigns: string }; notify: (m: string) => void }) {
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await postJson("/api/admin/settings", { values: { techViews: v.views.trim(), techCampaigns: v.campaigns.trim() } });
      notify("Key numbers saved");
    } catch (err) {
      notify((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="border border-line bg-paper-2/50 p-5">
      <h3 className="eyebrow !text-ink">Key numbers · For brands page</h3>
      <p className="mt-1 text-sm text-ink-2">Combined followers are added up from the roster. Leave a box empty to hide it.</p>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div className="field">
          <label htmlFor="tn-views">Combined total views</label>
          <input id="tn-views" className="input !w-40" value={v.views} onChange={(e) => setV({ ...v, views: e.target.value })} placeholder="e.g. 12M" />
        </div>
        <div className="field">
          <label htmlFor="tn-camp">Campaigns delivered</label>
          <input id="tn-camp" className="input !w-40" value={v.campaigns} onChange={(e) => setV({ ...v, campaigns: e.target.value })} placeholder="e.g. 40+" />
        </div>
        <button className="btn !py-3" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save numbers"}
        </button>
      </div>
    </div>
  );
}

function Editor({ initial, onClose, onSaved }: { initial: Member; onClose: () => void; onSaved: (m: string) => void }) {
  const [m, setM] = useState(initial);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Member>(k: K, v: Member[K]) => setM((cur) => ({ ...cur, [k]: v }));
  const setPl = (id: PlatformId, k: "url" | "followers", v: string) =>
    setM((cur) => ({ ...cur, platforms: { ...cur.platforms, [id]: { url: "", followers: "", ...cur.platforms[id], [k]: v } } }));

  const upload = async (f: File) => {
    setError("");
    setBusy("Uploading photo…");
    try {
      const enc = await encodeFile(f, 1600, 0.86);
      const { fileId } = await postJson<{ fileId: string }>("/api/admin/images/upload", { slot: "tech.roster", filename: enc.filename, mimeType: enc.mimeType, data: enc.data });
      setM((cur) => ({ ...cur, photo: fileId, photoUrl: enc.previewUrl }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy("");
      if (file.current) file.current.value = "";
    }
  };

  const save = async () => {
    setError("");
    setBusy("Saving…");
    try {
      // drop empty channel rows
      const platforms = Object.fromEntries(Object.entries(m.platforms).filter(([, p]) => p && (p.url.trim() || p.followers.trim())));
      await postJson("/api/admin/roster", { item: { ...m, platforms } });
      onSaved(m.id ? `${m.name} updated` : `${m.name} added to the roster`);
    } catch (err) {
      setError((err as Error).message);
      setBusy("");
    }
  };
  const remove = async () => {
    if (!m.id || !confirm(`Remove ${m.name} from the roster?`)) return;
    setBusy("Removing…");
    try {
      await postJson("/api/admin/roster", { id: m.id }, "DELETE");
      onSaved(`${m.name} removed`);
    } catch (err) {
      setError((err as Error).message);
      setBusy("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal aria-label={m.id ? `Edit ${m.name}` : "Add to the roster"} onClick={onClose}>
      <div className="w-full max-w-3xl bg-white p-6 shadow-2xl md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl">{m.id ? m.name || "Edit" : "Add to the roster"}</h2>
          <button onClick={onClose} className="text-sm underline underline-offset-4">
            Close
          </button>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-[180px_1fr]">
          <div>
            <div className="grid aspect-[4/5] place-items-center overflow-hidden border border-line bg-paper-2">
              {m.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-muted">No photo</span>
              )}
            </div>
            <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <button className="chip mt-2 w-full justify-center" onClick={() => file.current?.click()} disabled={Boolean(busy)}>
              {m.photoUrl ? "Replace photo" : "Upload photo"}
            </button>
            <p className="mt-1 text-[11px] text-muted">Portrait works best (4:5).</p>
          </div>
          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="field">
                <label htmlFor="r-name">Name *</label>
                <input id="r-name" className="input" value={m.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="r-handle">@ handle</label>
                <input id="r-handle" className="input" value={m.handle} onChange={(e) => set("handle", e.target.value)} placeholder="kairo" />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="field">
                <label htmlFor="r-type">Type</label>
                <select id="r-type" className="input" value={m.type} onChange={(e) => set("type", e.target.value)}>
                  {ROSTER_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="r-niche">Games or niche</label>
                <input id="r-niche" className="input" value={m.niche} onChange={(e) => set("niche", e.target.value)} placeholder="Shooters · PC builds" />
              </div>
              <div className="field">
                <label htmlFor="r-region">Region</label>
                <input id="r-region" className="input" value={m.region} onChange={(e) => set("region", e.target.value)} placeholder="Australia" />
              </div>
            </div>
            <div>
              <span className="label mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-ink-2">Channels (link and followers, e.g. 84K)</span>
              <div className="grid gap-2">
                {PLATFORMS.map((p) => (
                  <div key={p.id} className="grid grid-cols-[80px_1fr_90px] items-center gap-2 text-sm">
                    <span className="text-ink-2">{p.label}</span>
                    <input className="input !py-1.5 !text-[15px]" value={m.platforms[p.id]?.url || ""} onChange={(e) => setPl(p.id, "url", e.target.value)} placeholder="https://…" aria-label={`${p.label} link`} />
                    <input className="input !py-1.5 !text-[15px]" value={m.platforms[p.id]?.followers || ""} onChange={(e) => setPl(p.id, "followers", e.target.value)} placeholder="84K" aria-label={`${p.label} followers`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="field">
              <label htmlFor="r-quote">Quote (shown on For creators)</label>
              <textarea id="r-quote" className="input !min-h-[70px]" value={m.quote} onChange={(e) => set("quote", e.target.value)} placeholder="Optional: a line from them about working with ModeSociety Tech." />
            </div>
            <div className="flex flex-wrap gap-5 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={m.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured on the home page
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={m.visible} onChange={(e) => set("visible", e.target.checked)} /> Show on the site
              </label>
            </div>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-pin">{error}</p>}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
          {m.id ? (
            <button onClick={remove} className="text-sm text-pin underline underline-offset-4" disabled={Boolean(busy)}>
              Remove from roster
            </button>
          ) : (
            <span />
          )}
          <button className="btn !py-3" onClick={save} disabled={Boolean(busy) || !m.name.trim()}>
            {busy || "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** ModeSociety Tech roster: add, edit, reorder and hide creators. Stored in the "Tech Roster" tab. */
export default function RosterTab({ disabled, techStats, notify }: { disabled: boolean; techStats?: { views: string; campaigns: string }; notify: (m: string) => void }) {
  const [items, setItems] = useState<Member[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Member | null>(null);

  const load = useCallback(async () => {
    if (disabled) return;
    setError("");
    try {
      const r = await fetch("/api/admin/roster", { cache: "no-store" });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      setItems(d.items);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [disabled]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on open
    load();
  }, [load]);

  const move = async (i: number, d: -1 | 1) => {
    if (!items) return;
    const next = [...items];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    try {
      await postJson("/api/admin/roster", { ids: next.map((m) => m.id) }, "PUT");
    } catch (err) {
      notify((err as Error).message);
      load();
    }
  };

  if (disabled) return <p className="text-muted">Connect the backend to manage the roster.</p>;

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-2xl text-ink-2">
          The creators on <a href="/tech/talent" target="_blank" className="underline underline-offset-4">ModeSociety Tech → Our talent</a>. Featured ones also appear on the Tech home page. Until the first one is added, the site shows clearly marked sample cards.
        </p>
        <button className="btn !py-3" onClick={() => setEditing(blank())}>
          + Add creator
        </button>
      </div>
      {error && <p className="text-sm text-pin">{error}</p>}
      {!items && !error && <p className="text-muted">Loading roster…</p>}
      {items && (
        <ul className="border border-line bg-white">
          {!items.length && <li className="p-8 text-center text-muted">No creators yet. Add the first one.</li>}
          {items.map((m, i) => (
            <li key={m.id} className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-b-0">
              <div className="flex flex-col">
                <button className="px-1 text-xs text-muted hover:text-ink disabled:opacity-30" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${m.name} up`}>
                  ▲
                </button>
                <button className="px-1 text-xs text-muted hover:text-ink disabled:opacity-30" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${m.name} down`}>
                  ▼
                </button>
              </div>
              <div className="h-14 w-11 shrink-0 overflow-hidden bg-paper-2">
                {m.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photoUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                )}
              </div>
              <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(m)}>
                <span className="block truncate font-medium text-ink">
                  {m.name} {m.handle && <span className="font-normal text-muted">@{m.handle}</span>}
                </span>
                <span className="block truncate text-sm text-ink-2">
                  {[m.type, m.niche, m.region].filter(Boolean).join(" · ")}
                </span>
              </button>
              <span className="hidden text-sm tabular-nums text-ink-2 sm:block">{compact(totalFollowers(m))} followers</span>
              {m.featured && <span className="chip !px-2 !py-0.5 !text-[11px]">Featured</span>}
              {!m.visible && <span className="chip !px-2 !py-0.5 !text-[11px] opacity-60">Hidden</span>}
            </li>
          ))}
        </ul>
      )}
      <TechNumbers initial={techStats || { views: "", campaigns: "" }} notify={notify} />
      {editing && (
        <Editor
          initial={editing}
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
