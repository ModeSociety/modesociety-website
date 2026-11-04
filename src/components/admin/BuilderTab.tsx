"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { encodeFile, postJson } from "@/lib/upload";
import {
  addable,
  ALIGNS,
  ANIMATIONS,
  BLANK_PROPS,
  BLANK_STYLE,
  BLOCK_FONTS,
  DEFS,
  FORMS,
  HIDE_ON,
  PAGE_IDS,
  PAGES,
  photoSrc,
  SPACING,
  styled,
  WIDTHS,
  type BlockDef,
  type Item,
  type LayoutBlock,
  type PageId,
  type Props,
  type Style,
} from "@/lib/builder";
import type { SideFilter } from "@/lib/side";
import { SLOTS, type SiteContent } from "@/lib/slots";
import { SectionEditor } from "./CopyTab";
import { focusField } from "./focusField";
import { blockFields, resolveClick, type Hit, type Picked } from "./pickField";

/** A field to open in the editor, from a click in the preview (n tells two clicks on the same field apart). */
type Focus = { hit: Hit; n: number };

const box = "w-full border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-ink";
const lab = "mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.05em] text-ink-2";
const newId = () => `b${Math.random().toString(36).slice(2, 10)}`;
const PREVIEW_W = 1440;

/** A new block of a kind, with something in it to start from. */
function starter(type: string, side: "talent" | "tech"): LayoutBlock {
  const p: Props = { ...BLANK_PROPS, photos: [], items: [] };
  const item = (title: string, text: string): Item => ({ title, text, linkLabel: "", linkUrl: "", photo: "" });
  const style: Style = { ...BLANK_STYLE };
  switch (type) {
    case "banner":
      Object.assign(p, { heading: "Your *big* headline", text: "A line or two under it.", buttonLabel: "Get in touch", buttonUrl: side === "tech" ? "/tech/contact" : "/get-in-touch", size: "m" });
      style.bg = "brand";
      style.align = "center";
      break;
    case "text":
      Object.assign(p, { heading: "A new *heading*", text: "Write something here. A blank line starts a new paragraph." });
      break;
    case "imageText":
      Object.assign(p, { heading: "A new *heading*", text: "Write something here." });
      break;
    case "quote":
      Object.assign(p, { text: "A line worth remembering.", caption: "Who said it" });
      break;
    case "cards":
      p.items = [item("First card", "A sentence about it."), item("Second card", "A sentence about it."), item("Third card", "A sentence about it.")];
      p.heading = "A new *heading*";
      break;
    case "stats":
      p.items = [item("120+", "Brands worked with"), item("4M", "Combined reach"), item("98%", "Of clients come back")];
      break;
    case "faq":
      p.heading = "Questions";
      p.items = [item("A question people ask?", "The answer."), item("Another question?", "The answer.")];
      break;
    case "buttons":
      Object.assign(p, { buttonLabel: "Get in touch", buttonUrl: side === "tech" ? "/tech/contact" : "/get-in-touch" });
      break;
    case "logos":
      p.heading = "Brands we've worked with";
      break;
    case "form":
      Object.assign(p, { heading: "Get in *touch*", form: side === "tech" ? "tech" : "brands" });
      break;
    case "video":
      p.heading = "Watch";
      break;
  }
  return { id: newId(), type, hidden: false, style, props: p };
}

function describe(b: LayoutBlock) {
  const def = DEFS[b.type];
  if (!def) return b.type;
  if (def.kind === "feature") return def.label;
  const p = b.props;
  return (p.heading || p.text || p.caption || p.buttonLabel || p.items[0]?.title || "").replace(/\*/g, "").slice(0, 70) || def.label;
}

// ---------------------------------------------------------------------------
// small inputs
// ---------------------------------------------------------------------------

function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <label className="block">
      <span className={lab}>{label}</span>
      <select className={box} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Text({ id, label, value, onChange, area = false, hint, placeholder }: { id?: string; label: string; value: string; onChange: (v: string) => void; area?: boolean; hint?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className={lab}>
        {label}
        {hint && <span className="ml-2 normal-case tracking-normal text-muted">{hint}</span>}
      </span>
      {area ? (
        <textarea id={id} className={`${box} min-h-[110px]`} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} className={box} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

/** A colour: as designed, or one picked (with the hex code alongside). */
function Colour({ label, value, onChange, extra = [] }: { label: string; value: string; onChange: (v: string) => void; extra?: { id: string; label: string }[] }) {
  const custom = /^#/.test(value);
  return (
    <div>
      <span className={lab}>{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {[{ id: "", label: "As designed" }, ...extra].map((o) => (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} className={`chip !py-1 !text-[12px] ${value === o.id ? "!border-ink !bg-ink !text-white" : ""}`}>
            {o.label}
          </button>
        ))}
        <label className={`chip flex cursor-pointer items-center gap-2 !py-1 !text-[12px] ${custom ? "!border-ink" : ""}`}>
          <input type="color" className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0" value={custom ? value : "#7f090d"} onChange={(e) => onChange(e.target.value)} />
          {custom ? value : "Pick a colour"}
        </label>
        {custom && (
          <input
            className="w-24 border border-line px-2 py-1 font-mono text-[12px]"
            defaultValue={value}
            key={value}
            onBlur={(e) => /^#[0-9a-f]{6}$/i.test(e.target.value.trim()) && onChange(e.target.value.trim().toLowerCase())}
            aria-label={`${label} hex code`}
          />
        )}
      </div>
    </div>
  );
}

/** Uploads photos to Drive; the editor shows them straight away from the file just chosen. */
function usePhotoUpload(onError: (m: string) => void) {
  const [busy, setBusy] = useState("");
  const [previews] = useState(() => new Map<string, string>());
  const upload = async (files: FileList | null, room: number): Promise<string[]> => {
    if (!files?.length) return [];
    const list = Array.from(files).slice(0, Math.max(1, room));
    const ids: string[] = [];
    try {
      for (const [n, f] of list.entries()) {
        setBusy(`Uploading photo ${n + 1} of ${list.length}…`);
        const enc = await encodeFile(f, 2400, 0.86);
        const { fileId } = await postJson<{ fileId: string }>("/api/admin/images/upload", { slot: "blocks.photos", filename: enc.filename, mimeType: enc.mimeType, data: enc.data });
        previews.set(fileId, enc.previewUrl);
        ids.push(fileId);
      }
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy("");
    }
    return ids;
  };
  return { busy, upload, previews };
}

function Photos({ dom, ids, max, onChange, src, upload, busy, label }: { dom?: string; ids: string[]; max: number; onChange: (ids: string[]) => void; src: (id: string) => string; upload: (f: FileList | null, room: number) => Promise<string[]>; busy: string; label: string }) {
  const file = useRef<HTMLInputElement>(null);
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div id={dom}>
      <span className={lab}>{label}</span>
      <div className="grid grid-cols-4 gap-2">
        {ids.map((id, i) => (
          <figure key={id}>
            <div className="grid aspect-square place-items-center overflow-hidden bg-paper-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src(id)} alt="" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="mt-1 flex justify-between text-xs">
              {max > 1 ? (
                <span className="flex gap-2">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move earlier" className="disabled:opacity-30">
                    ←
                  </button>
                  <button type="button" disabled={i === ids.length - 1} onClick={() => move(i, 1)} aria-label="Move later" className="disabled:opacity-30">
                    →
                  </button>
                </span>
              ) : (
                <span />
              )}
              <button type="button" className="text-pin" onClick={() => onChange(ids.filter((_, k) => k !== i))} aria-label="Remove photo">
                ✕
              </button>
            </div>
          </figure>
        ))}
        {(max === 1 || ids.length < max) && (
          <button type="button" className="grid aspect-square place-items-center border border-dashed border-line text-[12px] text-ink-2 hover:border-ink" onClick={() => file.current?.click()} disabled={Boolean(busy)}>
            {max === 1 && ids.length ? "Replace" : "+ Add"}
          </button>
        )}
      </div>
      {busy && <p className="mt-2 text-[12px] text-muted">{busy}</p>}
      <input
        ref={file}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={max > 1}
        hidden
        onChange={async (e) => {
          const got = await upload(e.target.files, max === 1 ? 1 : max - ids.length);
          if (file.current) file.current.value = "";
          if (got.length) onChange(max === 1 ? got.slice(0, 1) : [...ids, ...got].slice(0, max));
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// a block's content and style
// ---------------------------------------------------------------------------

const ITEM_LABELS: Record<string, Partial<Record<keyof Item, string>>> = {
  cards: { photo: "Photo (optional)", title: "Title", text: "Text", linkLabel: "Link text (optional)", linkUrl: "Link" },
  stats: { title: "Figure (e.g. 120+)", text: "Caption" },
  faq: { title: "Question", text: "Answer" },
};

function GenericContent({ b, def, set, photo }: { b: LayoutBlock; def: Extract<BlockDef, { kind: "generic" }>; set: (p: Partial<Props>) => void; photo: ReturnType<typeof usePhotoUpload> & { src: (id: string) => string } }) {
  const p = b.props;
  const uses = new Set(def.uses);
  const quote = b.type === "quote";
  const items = p.items;
  const setItem = (i: number, it: Partial<Item>) => set({ items: items.map((x, j) => (j === i ? { ...x, ...it } : x)) });
  const moveItem = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    set({ items: next });
  };
  return (
    <div className="grid gap-4">
      {def.photos && <Photos dom={`gb-${b.id}-photos`} label={def.photos === 1 ? "Photo · shown whole, never cropped" : `Photos (up to ${def.photos})`} ids={p.photos} max={def.photos} onChange={(photos) => set({ photos })} src={photo.src} upload={photo.upload} busy={photo.busy} />}
      {uses.has("heading") && <Text id={`gb-${b.id}-heading`} label="Heading" hint="*stars* = accent style" value={p.heading} onChange={(heading) => set({ heading })} />}
      {uses.has("text") && (
        <Text
          id={`gb-${b.id}-text`}
          label={quote ? "The quote" : "Text"}
          area
          value={p.text}
          onChange={(text) => set({ text })}
          placeholder={quote ? "" : "Blank line = new paragraph · ## Heading · - bullet · **bold** · [link](https://…)"}
        />
      )}
      {uses.has("caption") && <Text id={`gb-${b.id}-caption`} label={quote ? "Who said it" : "Caption (optional)"} value={p.caption} onChange={(caption) => set({ caption })} />}
      {uses.has("videoUrl") && <Text label="YouTube or Vimeo link" value={p.videoUrl} onChange={(videoUrl) => set({ videoUrl })} placeholder="https://youtu.be/…" />}
      {uses.has("imageSide") && (
        <Select label="Photo side" value={p.imageSide} options={[{ id: "left", label: "Photo on the left" }, { id: "right", label: "Photo on the right" }] as const} onChange={(imageSide) => set({ imageSide })} />
      )}
      {uses.has("form") && <Select label="Which form" value={p.form} options={[{ id: "", label: "Choose a form" }, ...FORMS]} onChange={(form) => set({ form })} />}
      {uses.has("size") && (
        <Select
          label={b.type === "banner" ? "Height" : "Size"}
          value={p.size}
          options={[
            { id: "s", label: "Small" },
            { id: "m", label: "Medium" },
            { id: "l", label: "Large" },
            { id: "xl", label: b.type === "banner" ? "Full screen" : "Extra large" },
            ...(b.type === "spacer" ? [{ id: "line", label: "A thin line" }] : []),
          ]}
          onChange={(size) => set({ size })}
        />
      )}
      {uses.has("columns") && (
        <Select
          label={b.type === "gallery" ? "Photos across" : "Cards across"}
          value={p.columns}
          options={[{ id: "1", label: "1" }, { id: "2", label: "2" }, { id: "3", label: b.type === "gallery" ? "3 (or fewer for a few photos)" : "3" }, { id: "4", label: "4" }]}
          onChange={(columns) => set({ columns })}
        />
      )}
      {uses.has("buttonLabel") && (
        <div className="grid grid-cols-2 gap-3">
          <Text id={`gb-${b.id}-buttonLabel`} label="Button text" value={p.buttonLabel} onChange={(buttonLabel) => set({ buttonLabel })} placeholder="Optional" />
          <Text label="Button link" value={p.buttonUrl} onChange={(buttonUrl) => set({ buttonUrl })} placeholder="/get-in-touch or https://…" />
        </div>
      )}
      {uses.has("button2Label") && (
        <div className="grid grid-cols-2 gap-3">
          <Text id={`gb-${b.id}-button2Label`} label="Second button" value={p.button2Label} onChange={(button2Label) => set({ button2Label })} placeholder="Optional" />
          <Text label="Its link" value={p.button2Url} onChange={(button2Url) => set({ button2Url })} />
        </div>
      )}
      {def.itemFields && (
        <div>
          <span className={lab}>{def.itemName}s</span>
          <ol className="grid gap-3">
            {items.map((it, i) => (
              <li key={i} className="border border-line bg-paper-2/40 p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-mono uppercase tracking-[0.04em] text-muted">
                    {def.itemName} {i + 1}
                  </span>
                  <span className="flex gap-3">
                    <button type="button" onClick={() => moveItem(i, -1)} disabled={i === 0} className="disabled:opacity-30" aria-label="Move up">
                      ▲
                    </button>
                    <button type="button" onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="disabled:opacity-30" aria-label="Move down">
                      ▼
                    </button>
                    <button type="button" className="text-pin underline" onClick={() => set({ items: items.filter((_, j) => j !== i) })}>
                      Delete
                    </button>
                  </span>
                </div>
                <div className="grid gap-3">
                  {def.itemFields!.map((k) =>
                    k === "photo" ? (
                      <Photos key={k} dom={`gb-${b.id}-items-${i}-photo`} label={ITEM_LABELS[b.type]?.photo ?? "Photo"} ids={it.photo ? [it.photo] : []} max={1} onChange={(ids) => setItem(i, { photo: ids[0] ?? "" })} src={photo.src} upload={photo.upload} busy={photo.busy} />
                    ) : (
                      <Text key={k} id={`gb-${b.id}-items-${i}-${k}`} label={ITEM_LABELS[b.type]?.[k] ?? k} area={k === "text"} value={it[k]} onChange={(v) => setItem(i, { [k]: v })} />
                    ),
                  )}
                </div>
              </li>
            ))}
          </ol>
          {items.length < 24 && (
            <button type="button" className="chip mt-3" onClick={() => set({ items: [...items, { title: "", text: "", linkLabel: "", linkUrl: "", photo: "" }] })}>
              + Add {def.itemName}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FeatureContent({
  def,
  content,
  reload,
  notify,
  focus,
  openTab,
}: {
  def: Extract<BlockDef, { kind: "feature" }>;
  content: SiteContent;
  reload: () => Promise<void>;
  notify: (m: string) => void;
  focus: Focus | null;
  openTab: (tab: "images") => void;
}) {
  // one object per click, so the section editor opens and highlights once (not on every keystroke)
  const copyFocus = useMemo(
    () => (focus?.hit.kind === "copy" ? { section: focus.hit.section, value: { dom: focus.hit.dom, raw: focus.hit.raw, n: focus.n } } : null),
    [focus],
  );
  const slotFocus = focus?.hit.kind === "slot" ? focus.hit : null;
  const edited = new Set(content.copyEdited);
  const slots = (def.slots ?? []).map((id) => SLOTS.find((s) => s.id === id)?.label).filter(Boolean);
  return (
    <div className="grid gap-4">
      <p className="text-[13px] text-ink-2">
        One of the site&apos;s designed sections. Its wording is below; saving wording puts it <strong>live straight away</strong>, wherever the section appears.
      </p>
      {def.copy.map((id) => (
        <SectionEditor
          key={id}
          id={id}
          saved={content.copy[id] as unknown as Record<string, unknown>}
          edited={edited.has(id)}
          reload={reload}
          notify={notify}
          focus={copyFocus?.section === id ? copyFocus.value : undefined}
        />
      ))}
      {def.copy.length === 0 && <p className="text-[13px] text-muted">Nothing to word here: its figures come from the Roster tab.</p>}
      {slots.length > 0 && (
        <p id={slotFocus ? "slot-note" : undefined} key={slotFocus ? focus!.n : "slots"} className={`text-[13px] text-ink-2 ${slotFocus ? "field-flash border-l-2 border-[#3e5ef1] pl-3" : ""}`}>
          {slotFocus ? "That photo is" : "Its photos and videos are"} under <strong>Images &amp; video</strong>: {slots.join(", ")}.{" "}
          <button type="button" className="underline underline-offset-4" onClick={() => openTab("images")}>
            Open Images &amp; video
          </button>
        </p>
      )}
      {def.copy.some((id) => (content.copy[id] as { hidden?: boolean }).hidden) && (
        <p className="border-l-2 border-pin pl-3 text-[13px] text-pin">“Show this section” is switched off in its wording, so it isn&apos;t showing anywhere.</p>
      )}
    </div>
  );
}

function StyleFields({ b, feature, set, photo, side }: { b: LayoutBlock; feature: boolean; set: (s: Partial<Style>) => void; photo: ReturnType<typeof usePhotoUpload> & { src: (id: string) => string }; side: "talent" | "tech" }) {
  const s = b.style;
  const anim = feature ? ANIMATIONS.filter((a) => !["reveal", "parallax"].includes(a.id)) : ANIMATIONS;
  return (
    <div className="grid gap-5">
      <Colour label="Background" value={s.bg} onChange={(bg) => set({ bg })} extra={[{ id: "tint", label: "Soft tint" }, { id: "brand", label: side === "tech" ? "Blue" : "Brand colour" }]} />
      <Photos dom={`gb-${b.id}-bgImage`} label="Background photo (optional)" ids={s.bgImage ? [s.bgImage] : []} max={1} onChange={(ids) => set({ bgImage: ids[0] ?? "", overlay: ids[0] && !s.bgImage ? 40 : s.overlay })} src={photo.src} upload={photo.upload} busy={photo.busy} />
      {s.bgImage && (
        <label className="block">
          <span className={lab}>Darken the photo: {s.overlay}%</span>
          <input type="range" min={0} max={90} step={5} value={s.overlay} onChange={(e) => set({ overlay: Number(e.target.value) })} className="w-full" />
        </label>
      )}
      <Colour label="Text colour" value={s.text} onChange={(text) => set({ text })} />
      <Colour label="Accent colour" value={s.accent} onChange={(accent) => set({ accent })} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Heading font" value={s.headingFont} options={[{ id: "", label: "As designed" }, ...BLOCK_FONTS]} onChange={(headingFont) => set({ headingFont })} />
        <Select label="Body font" value={s.bodyFont} options={[{ id: "", label: "As designed" }, ...BLOCK_FONTS]} onChange={(bodyFont) => set({ bodyFont })} />
      </div>
      <Select label="Animation" value={s.animation} options={anim.map((a) => (a.id === "" && !feature ? { ...a, label: "As designed (fade up)" } : a))} onChange={(animation) => set({ animation })} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Space above" value={s.padTop} options={SPACING} onChange={(padTop) => set({ padTop })} />
        <Select label="Space below" value={s.padBottom} options={SPACING} onChange={(padBottom) => set({ padBottom })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Width" value={s.width} options={WIDTHS} onChange={(width) => set({ width })} />
        {!feature && <Select label="Text alignment" value={s.align} options={ALIGNS} onChange={(align) => set({ align })} />}
      </div>
      <Select label="Show on" value={s.hideOn} options={HIDE_ON} onChange={(hideOn) => set({ hideOn })} />
      {styled(s) && (
        <button type="button" className="w-fit text-[13px] text-pin underline underline-offset-4" onClick={() => set({ ...BLANK_STYLE })}>
          Reset this block&apos;s style
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// the live preview
// ---------------------------------------------------------------------------

function Preview({
  path,
  version,
  device,
  selected,
  onPick,
  resolve,
}: {
  path: string;
  version: number;
  device: "desktop" | "phone";
  selected: string;
  onPick: (id: string, hit: Hit | null) => void;
  /** which field of a block the clicked element shows */
  resolve: (id: string, target: Element, blockEl: Element) => Picked | null;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [width, setWidth] = useState(900);
  const [loading, setLoading] = useState(true);
  // the first load turns preview on for this browser; later ones just reload the page
  const [src, setSrc] = useState(`/api/admin/preview?to=${encodeURIComponent(path)}`);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setLoading(true);
    setSrc(`${path}${path.includes("?") ? "&" : "?"}preview=${version}`);
  }, [path, version]);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pickRef = useRef(onPick);
  const resolveRef = useRef(resolve);
  const selectedRef = useRef(selected);
  // a block picked in the preview is already in view: don't scroll the preview to its top
  const pickedHere = useRef("");
  useEffect(() => {
    pickRef.current = onPick;
    resolveRef.current = resolve;
    selectedRef.current = selected;
  });

  // outline blocks on hover, pick one with a click, and show which one is selected
  const wire = useCallback(() => {
    setLoading(false);
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    const boxOf = (el: Element) => {
      const kids = (el as HTMLElement).classList.contains("contents") ? Array.from(el.children) : [el];
      const rs = kids.map((k) => k.getBoundingClientRect()).filter((r) => r.width || r.height);
      if (!rs.length) return null;
      const top = Math.min(...rs.map((r) => r.top));
      const bottom = Math.max(...rs.map((r) => r.bottom));
      return { top, height: bottom - top };
    };
    const mk = (color: string, style: string) => {
      const d = doc.createElement("div");
      d.style.cssText = `position:fixed;left:0;right:0;pointer-events:none;z-index:2147483646;border:3px ${style} ${color};display:none`;
      doc.body.appendChild(d);
      return d;
    };
    const hover = mk("rgba(62,94,241,.55)", "dashed");
    const sel = mk("#3e5ef1", "solid");
    // the thing under the mouse, outlined, with the name of the field it comes from
    const item = doc.createElement("div");
    item.style.cssText = "position:fixed;pointer-events:none;z-index:2147483647;outline:2px solid #3e5ef1;outline-offset:3px;border-radius:2px;display:none";
    const tag = doc.createElement("span");
    tag.style.cssText =
      "position:absolute;left:-5px;bottom:100%;margin-bottom:6px;white-space:nowrap;background:#3e5ef1;color:#fff;font:600 12px/1.2 system-ui,sans-serif;padding:4px 7px;border-radius:4px;letter-spacing:0;text-transform:none";
    item.appendChild(tag);
    doc.body.appendChild(item);
    let itemEl: Element | null = null;
    const place = (d: HTMLDivElement, el: Element | null) => {
      const r = el && boxOf(el);
      if (!r) return void (d.style.display = "none");
      Object.assign(d.style, { display: "block", top: `${r.top}px`, height: `${r.height}px` });
    };
    const selectedEl = () => (selectedRef.current ? doc.querySelector(`[data-block="${selectedRef.current}"]`) : null);
    let hovered: Element | null = null;
    // the element a field's words or photo sit in: the smallest one holding the whole match
    const hitAt = (target: Element) => {
      const block = target.closest?.("[data-block]");
      if (!block) return { block: null, hit: null, el: null };
      const picked = resolveRef.current(block.getAttribute("data-block") || "", target, block);
      return { block, hit: picked?.hit ?? null, el: picked?.el ?? null };
    };
    doc.addEventListener("mouseover", (e) => {
      const { block, hit, el } = hitAt(e.target as Element);
      hovered = block;
      place(hover, hovered);
      itemEl = el;
      tag.textContent = hit ? `${hit.label} · click to edit` : "";
    });
    doc.addEventListener(
      "click",
      (e) => {
        const { block, hit } = hitAt(e.target as Element);
        if (!block) return;
        e.preventDefault();
        e.stopPropagation();
        const id = block.getAttribute("data-block") || "";
        pickedHere.current = id;
        pickRef.current(id, hit);
      },
      true,
    );
    const tick = () => {
      if (!frame.current?.contentDocument) return;
      place(sel, selectedEl());
      place(hover, hovered);
      const r = itemEl?.getBoundingClientRect();
      if (r && (r.width || r.height)) Object.assign(item.style, { display: "block", left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
      else item.style.display = "none";
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const el = selectedEl();
    if (el) (el.classList.contains("contents") ? el.firstElementChild : el)?.scrollIntoView({ block: "start" });
  }, []);

  // bring the selected block into view (unless it was just clicked there)
  useEffect(() => {
    if (pickedHere.current && pickedHere.current === selected) return;
    pickedHere.current = "";
    const doc = frame.current?.contentDocument;
    const el = selected && doc?.querySelector(`[data-block="${selected}"]`);
    if (el) (el.classList.contains("contents") ? el.firstElementChild : el)?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [selected]);

  const w = device === "phone" ? 390 : PREVIEW_W;
  const scale = Math.min(1, width / w);
  return (
    <div ref={wrap} className="relative h-full overflow-hidden border border-line bg-paper-2">
      {loading && <div className="absolute inset-x-0 top-0 z-10 h-1 animate-pulse bg-[#3e5ef1]" />}
      <iframe
        ref={frame}
        src={src}
        onLoad={wire}
        title="Preview of the page"
        className="origin-top-left border-0 bg-white"
        style={{ width: w, height: `${100 / scale}%`, transform: `scale(${scale})`, marginLeft: device === "phone" ? Math.max(0, (width - w * scale) / 2) : 0 }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// one page
// ---------------------------------------------------------------------------

type SaveState = "idle" | "pending" | "saving" | "error";

function PageBuilder({
  page,
  content,
  reload,
  notify,
  openTab,
}: {
  page: PageId;
  content: SiteContent;
  reload: () => Promise<void>;
  notify: (m: string) => void;
  openTab: (tab: "images") => void;
}) {
  const def = PAGES[page];
  const side = def.side;
  const [items, setItems] = useState<LayoutBlock[]>(() => content.layoutDrafts[page] ?? content.layouts[page]);
  const [hasDraft, setHasDraft] = useState(Boolean(content.layoutDrafts[page]));
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [panel, setPanel] = useState<"content" | "style">("content");
  const [adding, setAdding] = useState(false);
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState("");
  const [drag, setDrag] = useState(-1);
  const [focus, setFocus] = useState<Focus | null>(null);
  const photo = usePhotoUpload(setError);
  const src = (id: string) => photo.previews.get(id) ?? photoSrc(id, content.uploadsPublic);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(items);
  useEffect(() => {
    latest.current = items;
  }, [items]);

  const saveDraft = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setState("saving");
    setError("");
    try {
      await postJson("/api/admin/layout", { page, items: latest.current });
      setHasDraft(true);
      setState("idle");
      setVersion((v) => v + 1);
    } catch (err) {
      setState("error");
      setError((err as Error).message);
    }
  }, [page]);

  // every change is saved as a draft a moment after the last edit, and the preview reloads
  const change = (next: LayoutBlock[]) => {
    setItems(next);
    latest.current = next;
    setState("pending");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(saveDraft, 1200);
  };
  useEffect(
    () => () => {
      // leaving the page with an edit waiting: save it now
      if (timer.current) {
        clearTimeout(timer.current);
        postJson("/api/admin/layout", { page, items: latest.current }).catch(() => undefined);
      }
    },
    [page],
  );

  const update = (id: string, fn: (b: LayoutBlock) => LayoutBlock) => change(items.map((b) => (b.id === id ? fn(b) : b)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [b] = next.splice(from, 1);
    next.splice(to, 0, b);
    change(next);
  };
  const insert = (type: string) => {
    const b = starter(type, side);
    const at = selected ? items.findIndex((x) => x.id === selected) + 1 : items.length;
    const next = [...items];
    next.splice(at, 0, b);
    change(next);
    setSelected(b.id);
    setPanel("content");
    setAdding(false);
  };

  const run = async (label: string, fn: () => Promise<unknown>, done: string) => {
    setBusy(label);
    setError("");
    try {
      await fn();
      await reload();
      setVersion((v) => v + 1);
      notify(done);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy("");
    }
  };
  const publish = () =>
    run(
      "Publishing…",
      async () => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        await postJson("/api/admin/layout", { page, items: latest.current, publish: true });
        setHasDraft(false);
        setState("idle");
      },
      `${def.label} is live. Visitors see it within a few seconds.`,
    );
  const discard = () => {
    if (!confirm("Throw away the changes that aren't live yet?")) return;
    return run(
      "Discarding…",
      async () => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        await postJson("/api/admin/layout", { page }, "DELETE");
        setItems(content.layouts[page]);
        latest.current = content.layouts[page];
        setHasDraft(false);
        setState("idle");
      },
      "Changes thrown away.",
    );
  };
  const restore = () => {
    if (!confirm(`Put ${def.label} back to how it was designed? Blocks you've added to it, and its styles, are removed from the live page.`)) return;
    return run(
      "Restoring…",
      async () => {
        await postJson("/api/admin/layout", { page, live: true }, "DELETE");
        const d = await fetch("/api/admin/content", { cache: "no-store" }).then((r) => r.json());
        const fresh = d.content?.layouts?.[page] as LayoutBlock[] | undefined;
        if (fresh) {
          setItems(fresh);
          latest.current = fresh;
        }
        setHasDraft(false);
        setState("idle");
      },
      `${def.label} is back as designed.`,
    );
  };

  // a click in the preview: open its block, and the field it comes from
  const pick = (id: string, hit: Hit | null) => {
    setSelected(id);
    if (!hit) return setFocus(null);
    const style = hit.kind === "prop" && hit.dom.endsWith("-bgImage");
    setPanel(style ? "style" : "content");
    setFocus({ hit, n: Date.now() });
  };
  useEffect(() => {
    if (focus?.hit.kind === "prop") focusField(focus.hit.dom, focus.hit.raw);
    if (focus?.hit.kind === "slot") focusField("slot-note");
  }, [focus]);
  const resolve = (id: string, target: Element, blockEl: Element) => {
    const b = latest.current.find((x) => x.id === id);
    return b ? resolveClick(target, blockEl, blockFields(b, content)) : null;
  };

  const sel = items.find((b) => b.id === selected);
  const selDef = sel ? DEFS[sel.type] : undefined;
  const status =
    state === "saving" ? "Saving draft…" : state === "pending" ? "Unsaved changes…" : state === "error" ? "Couldn't save" : hasDraft ? "Draft saved · not live yet" : "Live";

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 border border-line bg-white p-4">
          <span className={`inline-flex items-center gap-2 text-[13px] ${state === "error" ? "text-pin" : hasDraft || state !== "idle" ? "text-ink" : "text-ok"}`}>
            <span className={`h-2 w-2 rounded-full ${state === "error" ? "bg-pin" : hasDraft || state !== "idle" ? "bg-[#d79a1e]" : "bg-ok"}`} />
            {status}
          </span>
          <span className="ml-auto flex flex-wrap gap-2">
            {(hasDraft || state !== "idle") && (
              <button className="text-[13px] underline underline-offset-4" onClick={discard} disabled={Boolean(busy)}>
                Discard
              </button>
            )}
            <button className="btn !px-4 !py-2.5" onClick={publish} disabled={Boolean(busy) || state === "saving" || (!hasDraft && state === "idle")}>
              {busy === "Publishing…" ? busy : "Publish"}
            </button>
          </span>
          {error && <p className="w-full text-[13px] text-pin">{error}</p>}
        </div>

        {!sel ? (
          <div className="border border-line bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-line p-4">
              <p className="text-[13px] text-ink-2">Top to bottom. Drag or use the arrows to reorder; click a block here, or anything in the preview, to edit it.</p>
              <button className="btn !shrink-0 !px-4 !py-2.5" onClick={() => setAdding(true)}>
                + Add
              </button>
            </div>
            <ol>
              {items.map((b, i) => {
                const d = DEFS[b.type];
                return (
                  <li
                    key={b.id}
                    draggable
                    onDragStart={() => setDrag(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      move(drag, i);
                      setDrag(-1);
                    }}
                    className={`group flex items-center gap-2 border-b border-line px-3 py-2.5 last:border-b-0 ${drag === i ? "opacity-40" : ""} ${b.hidden ? "bg-paper-2/60" : ""}`}
                  >
                    <span className="cursor-grab select-none px-1 text-muted" aria-hidden>
                      ⋮⋮
                    </span>
                    <button className="min-w-0 flex-1 text-left" onClick={() => setSelected(b.id)}>
                      <span className={`block truncate text-[14px] font-medium ${b.hidden ? "text-muted line-through" : "text-ink"}`}>{describe(b)}</span>
                      <span className="block truncate text-[12px] text-muted">
                        {d?.kind === "feature" ? "Designed section" : d?.label}
                        {styled(b.style) ? " · styled" : ""}
                      </span>
                    </button>
                    <span className="flex shrink-0 items-center gap-1 text-[13px]">
                      <button className="px-1 text-muted hover:text-ink disabled:opacity-25" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up">
                        ▲
                      </button>
                      <button className="px-1 text-muted hover:text-ink disabled:opacity-25" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} aria-label="Move down">
                        ▼
                      </button>
                      <button className="px-1 text-muted hover:text-ink" onClick={() => update(b.id, (x) => ({ ...x, hidden: !x.hidden }))} aria-label={b.hidden ? "Show" : "Hide"} title={b.hidden ? "Hidden: click to show" : "Hide"}>
                        {b.hidden ? "◌" : "◉"}
                      </button>
                      <button
                        className="px-1 text-muted hover:text-ink"
                        title="Duplicate"
                        aria-label="Duplicate"
                        onClick={() => {
                          const next = [...items];
                          next.splice(i + 1, 0, { ...structuredClone(b), id: newId() });
                          change(next);
                        }}
                      >
                        ⧉
                      </button>
                      <button
                        className="px-1 text-pin"
                        title="Delete"
                        aria-label="Delete"
                        onClick={() => {
                          if (confirm(`Remove “${describe(b)}” from this page?`)) change(items.filter((x) => x.id !== b.id));
                        }}
                      >
                        ✕
                      </button>
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 text-[13px]">
              <a href={def.path} target="_blank" className="underline underline-offset-4">
                Open the live page ↗
              </a>
              {content.layoutSaved.includes(page) && (
                <button className="text-pin underline underline-offset-4" onClick={restore} disabled={Boolean(busy)}>
                  Back to the original design
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="border border-line bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-line p-4">
              <button className="text-[13px] underline underline-offset-4" onClick={() => setSelected("")}>
                ← All blocks
              </button>
              <label className="flex items-center gap-2 text-[13px]">
                <input type="checkbox" checked={!sel.hidden} onChange={(e) => update(sel.id, (x) => ({ ...x, hidden: !e.target.checked }))} /> Showing
              </label>
            </div>
            <div className="p-4">
              <p className="eyebrow">{selDef?.kind === "feature" ? "Designed section" : "Block"}</p>
              <h3 className="font-display mt-1 text-2xl">{selDef?.label ?? sel.type}</h3>
              {selDef && <p className="mt-1 text-[13px] text-muted">{selDef.hint}</p>}
              <div className="mt-4 flex border-b border-line" role="tablist">
                {(["content", "style"] as const).map((t) => (
                  <button key={t} role="tab" aria-selected={panel === t} onClick={() => setPanel(t)} className={`-mb-px border-b-2 px-4 py-2 text-[14px] ${panel === t ? "border-ink font-medium" : "border-transparent text-muted"}`}>
                    {t === "content" ? "Content" : "Style"}
                  </button>
                ))}
              </div>
              <div className="mt-5">
                {panel === "content" && selDef?.kind === "generic" && (
                  <GenericContent key={sel.id} b={sel} def={selDef} set={(p) => update(sel.id, (x) => ({ ...x, props: { ...x.props, ...p } }))} photo={{ ...photo, src }} />
                )}
                {panel === "content" && selDef?.kind === "feature" && (
                  <FeatureContent
                    def={selDef}
                    focus={focus}
                    openTab={openTab}
                    content={content}
                    reload={async () => {
                      await reload();
                      setVersion((v) => v + 1);
                    }}
                    notify={notify}
                  />
                )}
                {panel === "style" && <StyleFields b={sel} feature={selDef?.kind === "feature"} side={side} set={(s) => update(sel.id, (x) => ({ ...x, style: { ...x.style, ...s } }))} photo={{ ...photo, src }} />}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-3 xl:sticky xl:top-36 xl:h-[calc(100vh-10rem)]">
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="text-muted">Preview with your unpublished changes · click any words or photo to edit them</span>
          <span className="flex gap-1">
            {(["desktop", "phone"] as const).map((d) => (
              <button key={d} onClick={() => setDevice(d)} className={`chip !py-1 !text-[12px] ${device === d ? "!border-ink !bg-ink !text-white" : ""}`}>
                {d === "desktop" ? "Computer" : "Phone"}
              </button>
            ))}
          </span>
        </div>
        <div className="h-[70vh] xl:h-auto xl:flex-1">
          <Preview
            path={def.path}
            version={version}
            device={device}
            selected={selected}
            onPick={pick}
            resolve={resolve}
          />
        </div>
      </div>

      {adding && <AddPicker page={page} onPick={insert} onClose={() => setAdding(false)} />}
    </div>
  );
}

function AddPicker({ page, onPick, onClose }: { page: PageId; onPick: (type: string) => void; onClose: () => void }) {
  const list = addable(page);
  const groups: [string, [string, BlockDef][]][] = [
    ["Text", list.filter(([, d]) => d.kind === "generic" && d.group === "Text")],
    ["Photos & video", list.filter(([, d]) => d.kind === "generic" && d.group === "Media")],
    ["Layout", list.filter(([, d]) => d.kind === "generic" && d.group === "Layout")],
    ["The site's designed sections", list.filter(([, d]) => d.kind === "feature")],
  ];
  return (
    <div className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/40 p-4 md:place-items-center" role="dialog" aria-modal aria-label="Add a block" onClick={onClose}>
      <div className="w-full max-w-4xl bg-white p-6 shadow-2xl md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl">Add a block</h2>
          <button onClick={onClose} className="text-sm underline underline-offset-4">
            Close
          </button>
        </div>
        <p className="mt-1 text-[13px] text-muted">It goes under the block you have open, or at the end of the page.</p>
        {groups.map(([name, defs]) =>
          defs.length ? (
            <div key={name} className="mt-6">
              <p className={lab}>{name}</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {defs.map(([type, d]) => (
                  <button key={type} onClick={() => onPick(type)} className="border border-line p-3 text-left transition hover:border-ink">
                    <span className="block text-[14px] font-medium">{d.label}</span>
                    <span className="block text-[12px] text-muted">{d.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// the tab
// ---------------------------------------------------------------------------

/** Pages: lay out each page block by block, style each block, preview, then publish. */
export default function BuilderTab({
  content,
  side,
  reload,
  notify,
  openTab,
}: {
  content: SiteContent;
  side: SideFilter;
  reload: () => Promise<void>;
  notify: (m: string) => void;
  openTab: (tab: "images") => void;
}) {
  const pages = PAGE_IDS.filter((p) => side === "all" || PAGES[p].side === side);
  const [page, setPage] = useState<PageId>(pages[0]);
  const current = pages.includes(page) ? page : pages[0];
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        {(["talent", "tech"] as const).map((sd) => {
          const list = pages.filter((p) => PAGES[p].side === sd);
          if (!list.length) return null;
          return (
            <div key={sd} className="flex flex-wrap items-center gap-2">
              <span className="eyebrow mr-1">{sd === "tech" ? "Tech" : "Mode Society"}</span>
              {list.map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`chip !py-1.5 !text-[13px] ${p === current ? "!border-ink !bg-ink !text-white" : ""}`}>
                  {PAGES[p].label}
                  {content.layoutDrafts[p] ? " •" : ""}
                </button>
              ))}
            </div>
          );
        })}
      </div>
      <PageBuilder key={current} page={current} content={content} reload={reload} notify={notify} openTab={openTab} />
    </div>
  );
}
