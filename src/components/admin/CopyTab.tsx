"use client";

import { useState } from "react";
import { postJson } from "@/lib/upload";
import { SECTIONS, SECTION_IDS, type Field, type SectionDef, type SectionId } from "@/lib/copy";
import type { SideFilter } from "@/lib/side";
import type { SiteContent } from "@/lib/slots";

type Value = Record<string, unknown>;

const PAGE_PATH: Record<string, string> = {};
for (const id of SECTION_IDS) {
  const s = SECTIONS[id] as SectionDef;
  if (!PAGE_PATH[`${s.side}:${s.page}`]) PAGE_PATH[`${s.side}:${s.page}`] = s.path.split("#")[0];
}

const blankItem = (item: Record<string, Field>): Value =>
  Object.fromEntries(Object.entries(item).map(([k, f]) => [k, f.type === "list" || f.type === "lines" ? [] : f.type === "select" ? f.options[0] : ""]));

/** Drops the empty lines left while typing in a one-per-line box. */
function tidy(f: Field, v: unknown): unknown {
  if (f.type === "lines") return (v as string[]).map((s) => s.trim()).filter(Boolean);
  if (f.type === "list") return (v as Value[]).map((it) => Object.fromEntries(Object.entries(f.item).map(([k, sub]) => [k, tidy(sub, it[k])])));
  return v;
}

const rowsFor = (s: string, min = 2) => Math.min(14, Math.max(min, Math.ceil(s.length / 90) + s.split("\n").length - 1));

function FieldInput({ f, value, onChange, id }: { f: Field; value: unknown; onChange: (v: unknown) => void; id: string }) {
  const hint = f.type === "heading" ? f.hint || "Each line is a line of the heading · wrap words in *stars* for the accent style" : f.hint;
  const head = (
    <label htmlFor={id} className="mb-1.5 block">
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-ink-2">{f.label}</span>
      {hint && <span className="ml-2 text-[12px] text-muted">{hint}</span>}
    </label>
  );
  const box = "w-full border border-line bg-white px-3 py-2 text-[15px] leading-relaxed text-ink outline-none focus:border-ink";

  if (f.type === "list") {
    const items = (value as Value[]) || [];
    const set = (i: number, it: Value) => onChange(items.map((x, j) => (j === i ? it : x)));
    const move = (i: number, d: -1 | 1) => {
      const j = i + d;
      if (j < 0 || j >= items.length) return;
      const next = [...items];
      [next[i], next[j]] = [next[j], next[i]];
      onChange(next);
    };
    return (
      <div>
        {head}
        <ol className="grid gap-3">
          {items.map((it, i) => (
            <li key={i} className="border border-line bg-paper-2/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-muted">
                  {f.itemName} {i + 1}
                </span>
                <span className="flex items-center gap-3 text-xs">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-30" aria-label={`Move ${f.itemName} ${i + 1} up`}>
                    ▲
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="disabled:opacity-30" aria-label={`Move ${f.itemName} ${i + 1} down`}>
                    ▼
                  </button>
                  <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-pin underline underline-offset-2">
                    Delete
                  </button>
                </span>
              </div>
              <div className="grid gap-3">
                {Object.entries(f.item).map(([k, sub]) => (
                  <FieldInput key={k} id={`${id}-${i}-${k}`} f={sub} value={it[k]} onChange={(v) => set(i, { ...it, [k]: v })} />
                ))}
              </div>
            </li>
          ))}
        </ol>
        <button type="button" className="chip mt-3" onClick={() => onChange([...items, blankItem(f.item)])}>
          + Add {f.itemName}
        </button>
      </div>
    );
  }
  if (f.type === "lines") {
    const s = ((value as string[]) || []).join("\n");
    return (
      <div>
        {head}
        <textarea id={id} className={box} rows={Math.max(3, s.split("\n").length + 1)} value={s} onChange={(e) => onChange(e.target.value.split("\n"))} />
      </div>
    );
  }
  if (f.type === "select") {
    return (
      <div>
        {head}
        <select id={id} className={`${box} !w-auto`} value={String(value)} onChange={(e) => onChange(e.target.value)}>
          {f.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
    );
  }
  const s = String(value ?? "");
  return (
    <div>
      {head}
      {f.type === "text" ? (
        <input id={id} className={box} value={s} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <textarea id={id} className={box} rows={rowsFor(s, f.type === "heading" ? 1 : 2)} value={s} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function SectionEditor({
  id,
  saved,
  edited,
  reload,
  notify,
}: {
  id: SectionId;
  saved: Value;
  edited: boolean;
  reload: () => Promise<void>;
  notify: (m: string) => void;
}) {
  const def = SECTIONS[id] as SectionDef;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Value>(saved);
  // after a save or reset, start again from what's now on the site (the card stays open)
  const [base, setBase] = useState(saved);
  if (JSON.stringify(base) !== JSON.stringify(saved)) {
    setBase(saved);
    setDraft(saved);
  }
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const run = async (label: string, fn: () => Promise<unknown>, done: string) => {
    setBusy(label);
    setError("");
    try {
      await fn();
      await reload();
      notify(done);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy("");
    }
  };
  const save = () => {
    const value: Value = Object.fromEntries(Object.entries(def.fields).map(([k, f]) => [k, tidy(f, draft[k])]));
    value.hidden = draft.hidden === true;
    return run("Saving…", () => postJson("/api/admin/copy", { id, value }), `${def.title} saved. It's live within a few seconds.`);
  };
  const reset = () => {
    if (!confirm(`Put “${def.title}” back to the original wording? Your changes to this section will be lost.`)) return;
    return run("Resetting…", () => postJson("/api/admin/copy", { id }, "DELETE"), `${def.title} is back to the original wording.`);
  };

  return (
    <section className={`border bg-white ${open ? "border-ink" : "border-line"}`}>
      <button className="flex w-full items-start justify-between gap-4 p-5 text-left" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-ink">{def.title}</span>
            {edited && <span className="chip !px-2 !py-0.5 !text-[11px]">Edited</span>}
            {saved.hidden === true && <span className="chip !border-pin !px-2 !py-0.5 !text-[11px] !text-pin">Hidden</span>}
            {dirty && <span className="text-[12px] text-pin">Unsaved changes</span>}
          </span>
          {def.hint && <span className="mt-1 block text-sm text-muted">{def.hint}</span>}
        </span>
        <span className="mt-0.5 font-mono text-lg leading-none text-ink" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div className="grid gap-5 border-t border-line p-5">
          {def.hideable && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.hidden !== true} onChange={(e) => setDraft({ ...draft, hidden: !e.target.checked })} />
              Show this section on the site
            </label>
          )}
          {Object.entries(def.fields).map(([k, f]) => (
            <FieldInput key={k} id={`${id}-${k}`} f={f} value={draft[k]} onChange={(v) => setDraft((d) => ({ ...d, [k]: v }))} />
          ))}
          {error && <p className="text-sm text-pin">{error}</p>}
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <button className="btn !py-3" disabled={!dirty || Boolean(busy)} onClick={save}>
              {busy || "Save"}
            </button>
            {dirty && (
              <button className="text-sm underline underline-offset-4" onClick={() => setDraft(saved)} disabled={Boolean(busy)}>
                Undo changes
              </button>
            )}
            <a href={def.path} target="_blank" className="text-sm text-ink-2 underline underline-offset-4">
              View on the site ↗
            </a>
            {edited && (
              <button className="ml-auto text-sm text-pin underline underline-offset-4" onClick={reset} disabled={Boolean(busy)}>
                Reset to original
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/** Pages & text: every section's wording, page by page, generated from src/lib/copy.ts. */
export default function CopyTab({ content, side, reload, notify }: { content: SiteContent; side: SideFilter; reload: () => Promise<void>; notify: (m: string) => void }) {
  const ids = SECTION_IDS.filter((id) => side === "all" || (SECTIONS[id] as SectionDef).side === side);
  // page order as in copy.ts, with the sections shared between pages last
  const pages = Array.from(new Set(ids.map((id) => `${(SECTIONS[id] as SectionDef).side}:${(SECTIONS[id] as SectionDef).page}`))).sort(
    (a, b) => Number(a.endsWith(":Shared sections")) - Number(b.endsWith(":Shared sections")),
  );
  const [page, setPage] = useState(pages[0]);
  const current = pages.includes(page) ? page : pages[0];
  const edited = new Set(content.copyEdited);
  const sideName = (k: string) => (k.startsWith("tech:") ? "ModeSociety Tech" : "Mode Society");

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <nav aria-label="Pages" className="lg:sticky lg:top-36 lg:self-start">
        {["talent", "tech"].map((sd) => {
          const list = pages.filter((p) => p.startsWith(`${sd}:`));
          if (!list.length) return null;
          return (
            <div key={sd} className="mb-6">
              <p className="eyebrow mb-2">{sideName(`${sd}:`)}</p>
              <ul className="flex flex-wrap gap-2 lg:block">
                {list.map((p) => {
                  const n = ids.filter((id) => `${(SECTIONS[id] as SectionDef).side}:${(SECTIONS[id] as SectionDef).page}` === p && edited.has(id)).length;
                  return (
                    <li key={p}>
                      <button
                        onClick={() => setPage(p)}
                        className={`flex w-full items-center justify-between gap-3 border px-3 py-2 text-left text-sm lg:border-0 lg:border-l-2 ${
                          p === current ? "border-ink bg-ink text-white lg:bg-paper-2 lg:text-ink" : "border-line text-ink-2 hover:text-ink lg:border-transparent"
                        }`}
                      >
                        {p.split(":")[1]}
                        {n > 0 && <span className="text-[11px] opacity-70">{n} edited</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">{sideName(current)}</p>
            <h2 className="font-display mt-1 text-4xl">{current.split(":")[1]}</h2>
          </div>
          {current.split(":")[1] !== "Shared sections" && (
            <a href={PAGE_PATH[current]} target="_blank" className="text-sm underline underline-offset-4">
              Open this page ↗
            </a>
          )}
        </div>
        <p className="mb-6 max-w-2xl text-sm text-ink-2">
          Open a section to change its wording, then <strong>Save</strong>. It&apos;s live on the site within a few seconds. Delete a line or a card by
          emptying it or with <em>Delete</em>, switch a whole section off with <em>Show this section</em>, and <em>Reset to original</em> brings back the
          website&apos;s first wording.
        </p>
        <div className="grid gap-3">
          {ids
            .filter((id) => `${(SECTIONS[id] as SectionDef).side}:${(SECTIONS[id] as SectionDef).page}` === current)
            .map((id) => (
              <SectionEditor
                key={id}
                id={id}
                saved={content.copy[id] as unknown as Value}
                edited={edited.has(id)}
                reload={reload}
                notify={notify}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
