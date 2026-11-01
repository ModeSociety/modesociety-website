"use client";

import { useRef, useState } from "react";
import RichText from "@/components/site/RichText";
import { encodeFile, postJson } from "@/lib/upload";
import { ANIMATIONS, BLOCK_PAGES, BLOCK_TYPES, TONES, WIDTHS, type BlockPage, type BlockType, type ShownBlock } from "@/lib/blocks";

const newId = () => Math.random().toString(36).slice(2, 10);

const blank = (page: BlockPage): ShownBlock => ({
  id: newId(),
  spot: BLOCK_PAGES[page].spots[0][0],
  type: "imageText",
  animation: "fade",
  tone: "page",
  width: "wide",
  visible: true,
  heading: "",
  text: "",
  buttonLabel: "",
  buttonUrl: "",
  caption: "",
  videoUrl: "",
  imageSide: "left",
  photos: [],
});

/** Which fields each kind of block uses. */
const USES: Record<BlockType, { photos: number; heading?: boolean; text?: string; button?: boolean; caption?: string; video?: boolean; side?: boolean }> = {
  text: { photos: 0, heading: true, text: "Text", button: true },
  image: { photos: 1, caption: "Caption (optional)" },
  imageText: { photos: 1, heading: true, text: "Text", button: true, side: true },
  gallery: { photos: 8, heading: true, text: "Text (optional)", caption: "Caption (optional)" },
  video: { photos: 0, heading: true, text: "Text (optional)", video: true },
  quote: { photos: 0, text: "The quote", caption: "Who said it" },
};

const box = "w-full border border-line bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-ink";
const label = "mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-ink-2";

function Editor({ page, initial, isNew, onClose, onSave }: { page: BlockPage; initial: ShownBlock; isNew: boolean; onClose: () => void; onSave: (b: ShownBlock) => Promise<void> }) {
  const [b, setB] = useState(initial);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const use = USES[b.type];
  const set = <K extends keyof ShownBlock>(k: K, v: ShownBlock[K]) => setB((cur) => ({ ...cur, [k]: v }));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const room = use.photos - b.photos.length;
    const list = Array.from(files).slice(0, Math.max(0, use.photos === 1 ? 1 : room));
    try {
      for (const [n, f] of list.entries()) {
        setBusy(`Uploading photo ${n + 1} of ${list.length}…`);
        const enc = await encodeFile(f, 2400, 0.86);
        const { fileId } = await postJson<{ fileId: string }>("/api/admin/images/upload", { slot: "blocks.photos", filename: enc.filename, mimeType: enc.mimeType, data: enc.data });
        setB((cur) => ({ ...cur, photos: use.photos === 1 ? [{ fileId, src: enc.previewUrl }] : [...cur.photos, { fileId, src: enc.previewUrl }] }));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy("");
      if (file.current) file.current.value = "";
    }
  };
  const movePhoto = (i: number, d: -1 | 1) =>
    setB((cur) => {
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
      await onSave({ ...b, photos: use.photos ? b.photos.slice(0, use.photos) : [] });
    } catch (err) {
      setError((err as Error).message);
      setBusy("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/40 p-4 md:place-items-center" role="dialog" aria-modal aria-label="Block" onClick={onClose}>
      <div className="w-full max-w-4xl bg-white p-6 shadow-2xl md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl">{isNew ? "Add a block" : "Edit block"}</h2>
          <button onClick={onClose} className="text-sm underline underline-offset-4">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-6">
          <div>
            <span className={label}>Kind of block</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {BLOCK_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => set("type", t.id)}
                  className={`border p-3 text-left transition ${b.type === t.id ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}
                >
                  <span className="block font-medium">{t.label}</span>
                  <span className={`block text-[12px] ${b.type === t.id ? "text-white/75" : "text-muted"}`}>{t.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className={label}>Where on the page</span>
              <select className={box} value={b.spot} onChange={(e) => set("spot", e.target.value)}>
                {BLOCK_PAGES[page].spots.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={label}>Animation</span>
              <select className={box} value={b.animation} onChange={(e) => set("animation", e.target.value as ShownBlock["animation"])}>
                {ANIMATIONS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={label}>Background</span>
              <select className={box} value={b.tone} onChange={(e) => set("tone", e.target.value as ShownBlock["tone"])}>
                {TONES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={label}>Width</span>
              <select className={box} value={b.width} onChange={(e) => set("width", e.target.value as ShownBlock["width"])}>
                {WIDTHS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {use.photos > 0 && (
            <div>
              <span className={label}>{use.photos === 1 ? "Photo" : `Photos (up to ${use.photos})`} · shown whole, never cropped</span>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {b.photos.map((p, i) => (
                  <figure key={p.fileId}>
                    <div className="grid aspect-square place-items-center overflow-hidden bg-paper-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.src} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="mt-1 flex justify-between text-xs">
                      {use.photos > 1 ? (
                        <span className="flex gap-2">
                          <button disabled={i === 0} onClick={() => movePhoto(i, -1)} aria-label="Move earlier" className="disabled:opacity-30">
                            ←
                          </button>
                          <button disabled={i === b.photos.length - 1} onClick={() => movePhoto(i, 1)} aria-label="Move later" className="disabled:opacity-30">
                            →
                          </button>
                        </span>
                      ) : (
                        <span />
                      )}
                      <button className="text-pin" onClick={() => set("photos", b.photos.filter((_, k) => k !== i))} aria-label="Remove photo">
                        ✕
                      </button>
                    </div>
                  </figure>
                ))}
                {(use.photos === 1 || b.photos.length < use.photos) && (
                  <button className="grid aspect-square place-items-center border border-dashed border-line text-sm text-ink-2 hover:border-ink" onClick={() => file.current?.click()} disabled={Boolean(busy)}>
                    {use.photos === 1 && b.photos.length ? "Replace" : "+ Add photo"}
                  </button>
                )}
              </div>
              <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" multiple={use.photos > 1} hidden onChange={(e) => upload(e.target.files)} />
            </div>
          )}

          {use.side && (
            <label className="w-fit">
              <span className={label}>Photo side</span>
              <select className={box} value={b.imageSide} onChange={(e) => set("imageSide", e.target.value as "left" | "right")}>
                <option value="left">Photo on the left</option>
                <option value="right">Photo on the right</option>
              </select>
            </label>
          )}
          {use.video && (
            <label>
              <span className={label}>YouTube or Vimeo link</span>
              <input className={box} value={b.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://youtu.be/…" />
            </label>
          )}
          {use.heading && (
            <label>
              <span className={label}>
                Heading <span className="normal-case text-muted">· wrap words in *stars* for the accent style</span>
              </span>
              <input className={box} value={b.heading} onChange={(e) => set("heading", e.target.value)} />
            </label>
          )}
          {use.text && (
            <div>
              <div className="flex items-end justify-between">
                <span className={label}>{use.text}</span>
                {b.type !== "quote" && (
                  <button className="mb-1.5 text-[12px] underline underline-offset-2" onClick={() => setPreview(!preview)}>
                    {preview ? "Write" : "Preview"}
                  </button>
                )}
              </div>
              {preview && b.type !== "quote" ? (
                <div className="min-h-[120px] border border-line p-4">{b.text.trim() ? <RichText text={b.text} /> : <p className="text-muted">Nothing written yet.</p>}</div>
              ) : (
                <textarea className={`${box} min-h-[120px]`} value={b.text} onChange={(e) => set("text", e.target.value)} placeholder={b.type === "quote" ? "" : "Blank line = new paragraph · ## Heading · - bullet · **bold** · [link](https://…)"} />
              )}
            </div>
          )}
          {use.caption && (
            <label>
              <span className={label}>{use.caption}</span>
              <input className={box} value={b.caption} onChange={(e) => set("caption", e.target.value)} />
            </label>
          )}
          {use.button && (
            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                <span className={label}>Button text (optional)</span>
                <input className={box} value={b.buttonLabel} onChange={(e) => set("buttonLabel", e.target.value)} placeholder="Book a call" />
              </label>
              <label>
                <span className={label}>Button link</span>
                <input className={box} value={b.buttonUrl} onChange={(e) => set("buttonUrl", e.target.value)} placeholder="/get-in-touch or https://…" />
              </label>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={b.visible} onChange={(e) => set("visible", e.target.checked)} /> Show on the site
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-pin">{error}</p>}
        <div className="mt-6 flex items-center justify-end gap-4 border-t border-line pt-5">
          {busy && <span className="text-sm text-muted">{busy}</span>}
          <button className="btn !py-3" onClick={save} disabled={Boolean(busy)}>
            Save block
          </button>
        </div>
      </div>
    </div>
  );
}

const describe = (b: ShownBlock) => b.heading.replace(/\*/g, "") || b.text.slice(0, 60) || b.caption || (b.photos.length ? `${b.photos.length} photo${b.photos.length > 1 ? "s" : ""}` : "Empty");

/** The blocks added to one page: add, edit, reorder, hide and delete. Saved as a list per page. */
export default function BlocksPanel({ page, blocks, reload, notify }: { page: BlockPage; blocks: ShownBlock[]; reload: () => Promise<void>; notify: (m: string) => void }) {
  const [editing, setEditing] = useState<ShownBlock | null>(null);
  const [busy, setBusy] = useState(false);
  const def = BLOCK_PAGES[page];
  const spotName = (id: string) => def.spots.find((s) => s[0] === id)?.[1] ?? id;
  const spotIndex = (id: string) => def.spots.findIndex((s) => s[0] === id);
  // shown in page order: by spot, then their own order
  const ordered = [...blocks].sort((a, b) => spotIndex(a.spot) - spotIndex(b.spot));

  const saveAll = async (list: ShownBlock[], msg: string) => {
    setBusy(true);
    try {
      await postJson("/api/admin/blocks", { page, blocks: list.map((b) => ({ ...b, photos: b.photos.map((p) => p.fileId) })) });
      await reload();
      notify(msg);
    } finally {
      setBusy(false);
    }
  };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= ordered.length || ordered[i].spot !== ordered[j].spot) return;
    const next = [...ordered];
    [next[i], next[j]] = [next[j], next[i]];
    saveAll(next, "Order saved").catch((err) => notify((err as Error).message));
  };

  return (
    <section className="mb-8 border border-dashed border-ink/40 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-ink">Blocks on this page</h3>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Add your own text, photos, galleries, videos and quotes anywhere on the page, each with its own animation.
          </p>
        </div>
        <button className="btn !py-3" onClick={() => setEditing(blank(page))} disabled={busy}>
          + Add block
        </button>
      </div>
      {ordered.length > 0 && (
        <ul className="mt-5 border border-line">
          {ordered.map((b, i) => (
            <li key={b.id} className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-b-0">
              <div className="flex flex-col">
                <button className="px-1 text-xs text-muted hover:text-ink disabled:opacity-30" onClick={() => move(i, -1)} disabled={busy || i === 0 || ordered[i - 1].spot !== b.spot} aria-label="Move up">
                  ▲
                </button>
                <button
                  className="px-1 text-xs text-muted hover:text-ink disabled:opacity-30"
                  onClick={() => move(i, 1)}
                  disabled={busy || i === ordered.length - 1 || ordered[i + 1].spot !== b.spot}
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden bg-paper-2 text-[10px] uppercase text-muted">
                {b.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.photos[0].src} alt="" className="h-full w-full object-cover" />
                ) : (
                  BLOCK_TYPES.find((t) => t.id === b.type)?.label.slice(0, 5)
                )}
              </div>
              <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(b)}>
                <span className="block truncate font-medium text-ink">{describe(b)}</span>
                <span className="block truncate text-sm text-ink-2">
                  {BLOCK_TYPES.find((t) => t.id === b.type)?.label} · {spotName(b.spot)} · {ANIMATIONS.find((a) => a.id === b.animation)?.label}
                </span>
              </button>
              {!b.visible && <span className="chip !px-2 !py-0.5 !text-[11px] opacity-60">Hidden</span>}
              <button
                className="text-sm text-pin underline underline-offset-4"
                disabled={busy}
                onClick={() => {
                  if (confirm("Delete this block?")) saveAll(ordered.filter((x) => x.id !== b.id), "Block deleted").catch((err) => notify((err as Error).message));
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
      {editing && (
        <Editor
          page={page}
          initial={editing}
          isNew={!ordered.some((x) => x.id === editing.id)}
          onClose={() => setEditing(null)}
          onSave={async (b) => {
            const exists = ordered.some((x) => x.id === b.id);
            await saveAll(exists ? ordered.map((x) => (x.id === b.id ? b : x)) : [...ordered, b], exists ? "Block saved" : "Block added");
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}
