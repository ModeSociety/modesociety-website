"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import RichText from "@/components/site/RichText";
import { encodeFile, postJson } from "@/lib/upload";
import { pressDate, type PressItem } from "@/lib/press";

const blank = (): PressItem => ({ id: "", order: 0, slug: "", outlet: "", title: "", date: "", excerpt: "", body: "", href: "", photos: [], visible: true });

const FORMATTING = [
  ["Blank line", "new paragraph"],
  ["## Heading", "subheading"],
  ["> A quote", "large pull quote"],
  ["- item", "bullet list"],
  ["**bold** *italic*", "emphasis"],
  ["[text](https://…)", "link"],
];

function Editor({ initial, onClose, onSaved }: { initial: PressItem; onClose: () => void; onSaved: (m: string) => void }) {
  const [a, setA] = useState(initial);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const set = <K extends keyof PressItem>(k: K, v: PressItem[K]) => setA((cur) => ({ ...cur, [k]: v }));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const list = Array.from(files).slice(0, Math.max(0, 12 - a.photos.length));
    try {
      for (const [n, f] of list.entries()) {
        setBusy(`Uploading photo ${n + 1} of ${list.length}…`);
        const enc = await encodeFile(f, 2400, 0.86);
        const { fileId } = await postJson<{ fileId: string }>("/api/admin/images/upload", { slot: "press.photos", filename: enc.filename, mimeType: enc.mimeType, data: enc.data });
        setA((cur) => ({ ...cur, photos: [...cur.photos, { fileId, src: enc.previewUrl }] }));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy("");
      if (file.current) file.current.value = "";
    }
  };
  const movePhoto = (i: number, d: -1 | 1) =>
    setA((cur) => {
      const next = [...cur.photos];
      const j = i + d;
      if (j < 0 || j >= next.length) return cur;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...cur, photos: next };
    });

  const save = async () => {
    setError("");
    setBusy("Saving…");
    try {
      await postJson("/api/admin/press", { item: a });
      onSaved(a.id ? `“${a.title}” updated` : `“${a.title}” added to Featured in`);
    } catch (err) {
      setError((err as Error).message);
      setBusy("");
    }
  };
  const remove = async () => {
    if (!a.id || !confirm(`Delete “${a.title}”? This can't be undone.`)) return;
    setBusy("Deleting…");
    try {
      await postJson("/api/admin/press", { id: a.id }, "DELETE");
      onSaved(`“${a.title}” deleted`);
    } catch (err) {
      setError((err as Error).message);
      setBusy("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/40 p-4 md:place-items-center" role="dialog" aria-modal aria-label={a.id ? `Edit ${a.title}` : "Add a feature"} onClick={onClose}>
      <div className="w-full max-w-4xl bg-white p-6 shadow-2xl md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl">{a.id ? "Edit feature" : "Add a feature"}</h2>
          <button onClick={onClose} className="text-sm underline underline-offset-4">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-[1fr_1fr_180px]">
            <div className="field">
              <label htmlFor="p-outlet">Publication *</label>
              <input id="p-outlet" className="input" value={a.outlet} onChange={(e) => set("outlet", e.target.value)} placeholder="Vogue Australia" />
            </div>
            <div className="field">
              <label htmlFor="p-href">Link to the original article</label>
              <input id="p-href" className="input" value={a.href} onChange={(e) => set("href", e.target.value)} placeholder="https://… (optional)" />
            </div>
            <div className="field">
              <label htmlFor="p-date">Date</label>
              <input id="p-date" type="date" className="input" value={/^\d{4}-\d{2}-\d{2}$/.test(a.date) ? a.date : ""} onChange={(e) => set("date", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="p-title">Headline *</label>
            <input id="p-title" className="input" value={a.title} onChange={(e) => set("title", e.target.value)} placeholder="The Melbourne agency changing influencer marketing" />
          </div>
          <div className="field">
            <label htmlFor="p-excerpt">
              Short teaser <span className="normal-case text-muted">· shown on the home page and the Featured in list, with “Read more” ({a.excerpt.length}/220)</span>
            </label>
            <textarea id="p-excerpt" className="input !min-h-[80px]" maxLength={600} value={a.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="One or two sentences. Leave it empty to use the start of the article." />
          </div>

          <div>
            <div className="flex items-end justify-between gap-4">
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-ink-2">Full article · shown after “Read more”</span>
              <div className="flex rounded-full border border-line p-0.5 text-[12px]">
                <button className={`rounded-full px-3 py-1 ${!preview ? "bg-ink text-white" : "text-ink-2"}`} onClick={() => setPreview(false)}>
                  Write
                </button>
                <button className={`rounded-full px-3 py-1 ${preview ? "bg-ink text-white" : "text-ink-2"}`} onClick={() => setPreview(true)}>
                  Preview
                </button>
              </div>
            </div>
            {preview ? (
              <div className="mt-2 min-h-[260px] border border-line p-5">
                {a.body.trim() ? <RichText text={a.body} /> : <p className="text-muted">Nothing written yet.</p>}
              </div>
            ) : (
              <textarea
                aria-label="Full article"
                className="input mt-2 !min-h-[260px] font-[inherit] !text-[15px] !leading-relaxed"
                value={a.body}
                onChange={(e) => set("body", e.target.value)}
                placeholder={"Write or paste the full copy here.\n\nLeave a blank line between paragraphs."}
              />
            )}
            <details className="mt-2 text-[12px] text-muted">
              <summary className="cursor-pointer">Formatting</summary>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                {FORMATTING.map(([k, v]) => (
                  <li key={k}>
                    <code className="bg-paper-2 px-1.5 py-0.5 text-ink">{k}</code> {v}
                  </li>
                ))}
              </ul>
            </details>
          </div>

          <div>
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-ink-2">Photos · the first is the cover, the rest show under the article</span>
            <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {a.photos.map((p, i) => (
                <figure key={p.fileId}>
                  <div className={`relative aspect-[4/5] overflow-hidden bg-paper-2 ${i === 0 ? "ring-2 ring-ink" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt="" className="h-full w-full object-cover" />
                    {i === 0 && <span className="absolute left-1 top-1 bg-ink px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white">Cover</span>}
                  </div>
                  <div className="mt-1 flex justify-between text-xs">
                    <span className="flex gap-2">
                      <button disabled={i === 0} onClick={() => movePhoto(i, -1)} aria-label="Move earlier" className="disabled:opacity-30">
                        ←
                      </button>
                      <button disabled={i === a.photos.length - 1} onClick={() => movePhoto(i, 1)} aria-label="Move later" className="disabled:opacity-30">
                        →
                      </button>
                    </span>
                    <button className="text-pin" onClick={() => set("photos", a.photos.filter((_, k) => k !== i))} aria-label="Remove photo">
                      ✕
                    </button>
                  </div>
                </figure>
              ))}
              {a.photos.length < 12 && (
                <button className="grid aspect-[4/5] place-items-center border border-dashed border-line text-sm text-ink-2 hover:border-ink" onClick={() => file.current?.click()} disabled={Boolean(busy)}>
                  + Add photos
                </button>
              )}
            </div>
            <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => upload(e.target.files)} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={a.visible} onChange={(e) => set("visible", e.target.checked)} /> Show on the site (untick to keep it as a draft)
          </label>
          {a.slug && (
            <p className="text-sm text-ink-2">
              Page:{" "}
              <a href={`/featured-in/${a.slug}`} target="_blank" className="underline underline-offset-4">
                /featured-in/{a.slug} ↗
              </a>
            </p>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-pin">{error}</p>}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
          {a.id ? (
            <button onClick={remove} className="text-sm text-pin underline underline-offset-4" disabled={Boolean(busy)}>
              Delete feature
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-4">
            {busy && <span className="text-sm text-muted">{busy}</span>}
            <button className="btn !py-3" onClick={save} disabled={Boolean(busy) || !a.title.trim() || !a.outlet.trim()}>
              {a.id ? "Save changes" : "Add feature"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Featured in: press features with a photo, a teaser and the full article. Stored in the "Featured In" tab. */
export default function PressTab({ disabled, notify }: { disabled: boolean; notify: (m: string) => void }) {
  const [items, setItems] = useState<PressItem[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<PressItem | null>(null);

  const load = useCallback(async () => {
    if (disabled) return;
    setError("");
    try {
      const r = await fetch("/api/admin/press", { cache: "no-store" });
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
      await postJson("/api/admin/press", { ids: next.map((a) => a.id) }, "PUT");
    } catch (err) {
      notify((err as Error).message);
      load();
    }
  };

  if (disabled) return <p className="text-muted">Connect the backend to manage Featured in.</p>;
  const onHome = new Set((items || []).filter((a) => a.visible).slice(0, 3).map((a) => a.id));

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-2xl text-ink-2">
          Each feature gets its own page with the full article. The top three show on the home page with a short teaser and <em>Read more</em>, and all of them
          are listed on{" "}
          <a href="/featured-in" target="_blank" className="underline underline-offset-4">
            Featured in ↗
          </a>
          . Publication logos are under <em>Images → Featured in</em>.
        </p>
        <button className="btn !py-3" onClick={() => setEditing(blank())}>
          + Add feature
        </button>
      </div>
      {error && <p className="text-sm text-pin">{error}</p>}
      {!items && !error && <p className="text-muted">Loading features…</p>}
      {items && (
        <ul className="border border-line bg-white">
          {!items.length && <li className="p-8 text-center text-muted">No features yet. Add the first one.</li>}
          {items.map((a, i) => (
            <li key={a.id} className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-b-0">
              <div className="flex flex-col">
                <button className="px-1 text-xs text-muted hover:text-ink disabled:opacity-30" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${a.title} up`}>
                  ▲
                </button>
                <button className="px-1 text-xs text-muted hover:text-ink disabled:opacity-30" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${a.title} down`}>
                  ▼
                </button>
              </div>
              <div className="h-14 w-11 shrink-0 overflow-hidden bg-paper-2">
                {a.photos[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.photos[0].src} alt="" className="h-full w-full object-cover" loading="lazy" />
                )}
              </div>
              <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(a)}>
                <span className="block truncate font-medium text-ink">{a.title}</span>
                <span className="block truncate text-sm text-ink-2">{[a.outlet, a.date && pressDate(a.date)].filter(Boolean).join(" · ")}</span>
              </button>
              {onHome.has(a.id) && <span className="chip hidden !px-2 !py-0.5 !text-[11px] sm:inline-flex">On home page</span>}
              {!a.visible && <span className="chip !px-2 !py-0.5 !text-[11px] opacity-60">Draft</span>}
              <a href={`/featured-in/${a.slug}`} target="_blank" className="text-sm text-ink-2 underline underline-offset-4">
                View ↗
              </a>
            </li>
          ))}
        </ul>
      )}
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
