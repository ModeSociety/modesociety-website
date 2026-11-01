"use client";

import { useState } from "react";
import { postJson } from "@/lib/upload";
import { FONTS, fontHref, HEX, THEME_FIELDS, type ThemeField } from "@/lib/theme";
import type { SideFilter } from "@/lib/side";

type Values = Record<string, string>;

// every font on offer, so the menus and previews show the real thing (the originals of the Tech side aren't loaded in the panel)
const PREVIEW_FONTS =
  fontHref(Object.values(FONTS).flat()) + "&family=Anybody:wdth,wght@50..150,700..800&family=Instrument+Sans:wght@400;600";

const familyOf = (f: ThemeField, v: string) => (f.kind === "font" ? FONTS[f.list].find((o) => o.id === v)?.family ?? FONTS[f.list][0].family : "");

function ColourInput({ f, value, onChange }: { f: ThemeField & { kind: "colour" }; value: string; onChange: (v: string) => void }) {
  const shown = value || f.original;
  const [text, setText] = useState(shown);
  const [last, setLast] = useState(shown);
  if (shown !== last) {
    setLast(shown);
    setText(shown);
  }
  return (
    <div className="flex items-center gap-3">
      <input type="color" value={shown} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 cursor-pointer border border-line bg-white p-1" aria-label={f.label} />
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const v = e.target.value.trim();
          if (HEX.test(v)) onChange(v.toLowerCase());
        }}
        className="w-28 border border-line bg-white px-3 py-2 font-mono text-[14px] uppercase"
        aria-label={`${f.label} code`}
      />
    </div>
  );
}

function Preview({ side, v }: { side: "talent" | "tech"; v: Values }) {
  const f = (key: string) => THEME_FIELDS.find((x) => x.key === key)!;
  const col = (key: string) => v[key] || (f(key) as ThemeField & { kind: "colour" }).original;
  const fam = (key: string) => `"${familyOf(f(key), v[key] || "")}"`;
  if (side === "talent")
    return (
      <div className="border border-line p-6" style={{ background: col("themePaper"), color: col("themeInk"), fontFamily: fam("themeFontBody") }}>
        <p style={{ fontFamily: fam("themeFontDisplay"), textTransform: "uppercase", fontSize: 54, lineHeight: 0.92 }}>
          Let&apos;s work <span style={{ fontFamily: fam("themeFontSerif"), fontStyle: "italic", textTransform: "none" }}>together.</span>
        </p>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed opacity-85">
          Think of us as your external PR team. We find the right creators and run the collab from brief to{" "}
          <span style={{ borderBottom: `2px solid ${col("themeAccent")}` }}>payment</span>.
        </p>
        <span className="mt-5 inline-block px-5 py-3 font-mono text-[12px] uppercase tracking-[0.06em]" style={{ background: col("themeInk"), color: col("themePaper") }}>
          Book a call →
        </span>
      </div>
    );
  return (
    <div className="rounded-[18px] border border-line p-6" style={{ background: col("techThemeGround"), color: col("techThemeText"), fontFamily: fam("techThemeFontBody") }}>
      <p style={{ fontFamily: fam("techThemeFontDisplay"), fontVariationSettings: '"wdth" 128', fontWeight: 700, textTransform: "uppercase", fontSize: 46, lineHeight: 0.95 }}>
        Not just <span style={{ color: col("techThemeBlue") }}>gaming.</span>
      </p>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed opacity-80">We sign streamers, content creators and esports athletes, and build brand campaigns around them.</p>
      <span className="mt-5 inline-block rounded-full px-5 py-2.5 text-[14px] font-semibold text-white" style={{ background: col("techThemeBlue") }}>
        Brand enquiry →
      </span>
    </div>
  );
}

/** Colours & fonts: the brand colours and a choice of fonts, per side. Only what's changed is applied. */
export default function ThemeTab({ saved, side, reload, notify }: { saved: Values; side: SideFilter; reload: () => Promise<void>; notify: (m: string) => void }) {
  const [draft, setDraft] = useState<Values>(saved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const sides = (["talent", "tech"] as const).filter((s) => side === "all" || side === s);
  const changed = THEME_FIELDS.filter((f) => (draft[f.key] || "") !== (saved[f.key] || ""));

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await postJson("/api/admin/settings", { values: Object.fromEntries(changed.map((f) => [f.key, draft[f.key] || ""])) });
      await reload();
      notify("Colours and fonts saved. They're live within a few seconds.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const set = (key: string, v: string) => setDraft((d) => ({ ...d, [key]: v }));

  return (
    <div className="grid gap-12">
      <link rel="stylesheet" href={PREVIEW_FONTS} />
      {sides.map((sd) => (
        <section key={sd}>
          <h2 className="eyebrow mb-4 border-b border-line pb-3">{sd === "talent" ? "Mode Society" : "ModeSociety Tech"}</h2>
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <div className="grid gap-6">
              {THEME_FIELDS.filter((f) => f.side === sd).map((f) => {
                const value = draft[f.key] || "";
                return (
                  <div key={f.key} className="grid gap-2 sm:grid-cols-[200px_1fr] sm:items-center">
                    <div>
                      <p className="font-medium text-ink">{f.label}</p>
                      <p className="text-[12px] text-muted">{f.hint}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      {f.kind === "colour" ? (
                        <ColourInput f={f} value={value} onChange={(v) => set(f.key, v.toLowerCase() === f.original ? "" : v)} />
                      ) : (
                        <select
                          value={value}
                          onChange={(e) => set(f.key, e.target.value)}
                          className="min-w-[240px] border border-line bg-white px-3 py-2 text-[16px]"
                          style={{ fontFamily: `"${familyOf(f, value)}"` }}
                          aria-label={f.label}
                        >
                          {FONTS[f.list].map((o) => (
                            <option key={o.id} value={o.id} style={{ fontFamily: `"${o.family}"` }}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {value && (
                        <button className="text-sm text-ink-2 underline underline-offset-4" onClick={() => set(f.key, "")}>
                          Back to original
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <p className="eyebrow mb-2">Preview</p>
              <Preview side={sd} v={draft} />
            </div>
          </div>
        </section>
      ))}
      <div className="sticky bottom-0 z-20 -mx-[var(--gutter)] flex flex-wrap items-center gap-4 border-t border-line bg-paper/90 px-[var(--gutter)] py-4 backdrop-blur">
        <button className="btn" disabled={!changed.length || busy} onClick={save}>
          {busy ? "Saving…" : "Save colours & fonts"}
        </button>
        {changed.length > 0 && (
          <button className="text-sm underline underline-offset-4" onClick={() => setDraft(saved)} disabled={busy}>
            Undo changes
          </button>
        )}
        {changed.length > 0 && <span className="text-sm text-muted">{changed.length} unsaved change{changed.length === 1 ? "" : "s"}</span>}
        {error && <span className="text-sm text-pin">{error}</span>}
      </div>
    </div>
  );
}
