"use client";

import { useRef, useState } from "react";
import { APP_OPTIONS, MAX_SCREENSHOTS, MEDIA_KIT_MAX_MB, socialsProblems, type Channel } from "@/lib/application";
import { encodeFile, postJson } from "@/lib/upload";
import { Field } from "../StepForm";
import type { StepDef, StepProps } from "./types";

const PLACEHOLDER: Record<string, string> = {
  Instagram: "instagram.com/yourname or @yourname",
  TikTok: "tiktok.com/@yourname or @yourname",
  YouTube: "youtube.com/@yourchannel",
  "YouTube Gaming": "youtube.com/@yourchannel",
  Twitch: "twitch.tv/yourname",
  Kick: "kick.com/yourname",
  Discord: "discord.gg/yourserver",
};

function PlatformSelect({ side, value, onChange, label }: { side: StepProps["side"]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <select className="input" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Choose…</option>
      {APP_OPTIONS[side].platforms.map((p) => (
        <option key={p}>{p}</option>
      ))}
    </select>
  );
}

/** The optional media kit: a PDF (small enough to upload here) or a link to one. */
function MediaKit({ a, set }: StepProps) {
  const [status, setStatus] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const uploaded = /^[\w-]{10,}$/.test(a.mediaKit);
  const upload = async (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") return setStatus("Choose a PDF.");
    if (file.size > MEDIA_KIT_MAX_MB * 1024 * 1024) return setStatus(`That PDF is over ${MEDIA_KIT_MAX_MB} MB: paste a link to it instead (Google Drive, Dropbox…).`);
    setStatus("Uploading…");
    try {
      const enc = await encodeFile(file);
      const { fileId } = await postJson<{ fileId: string }>("/api/forms/upload", { filename: enc.filename, mimeType: enc.mimeType, data: enc.data });
      set({ mediaKit: fileId });
      setStatus(`✓ ${file.name} uploaded`);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      if (input.current) input.current.value = "";
    }
  };
  return (
    <Field label="Media kit" optional>
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="chip" onClick={() => input.current?.click()}>
            {uploaded ? "Replace the PDF" : `Upload a PDF (up to ${MEDIA_KIT_MAX_MB} MB)`}
          </button>
          {uploaded && (
            <button type="button" className="text-sm text-pin underline underline-offset-4" onClick={() => (set({ mediaKit: "" }), setStatus(""))}>
              Remove
            </button>
          )}
          {status && <span className="text-sm text-muted">{status}</span>}
        </div>
        {!uploaded && (
          <input className="input" value={a.mediaKit} onChange={(e) => set({ mediaKit: e.target.value })} placeholder="…or paste a link to it" inputMode="url" />
        )}
      </div>
      <input ref={input} type="file" accept="application/pdf" hidden onChange={(e) => upload(e.target.files?.[0])} />
    </Field>
  );
}

function Socials(props: StepProps) {
  const { side, a, set } = props;
  const opts = APP_OPTIONS[side];
  const setOther = (n: number, patch: Partial<Channel>) => set({ others: a.others.map((c, i) => (i === n ? { ...c, ...patch } : c)) });
  return (
    <>
      <div className="grid gap-8 md:grid-cols-[220px_1fr_180px]">
        <Field label="Main platform *">
          <PlatformSelect side={side} label="Main platform" value={a.mainPlatform} onChange={(v) => set({ mainPlatform: v })} />
        </Field>
        <Field label="Main channel link *">
          <input className="input" value={a.mainLink} onChange={(e) => set({ mainLink: e.target.value })} placeholder={PLACEHOLDER[a.mainPlatform] || "Link to your channel"} inputMode="url" />
        </Field>
        <Field label="Followers *">
          <input className="input" value={a.mainFollowers} onChange={(e) => set({ mainFollowers: e.target.value })} inputMode="numeric" placeholder="12400" />
        </Field>
      </div>
      <p className="-mt-5 text-sm text-muted">Enter your current follower / subscriber count.</p>
      <Field label={opts.avgLabel} optional>
        <input className="input max-w-60" value={a.avgViews} onChange={(e) => set({ avgViews: e.target.value })} inputMode="numeric" />
      </Field>
      {a.others.map((c, n) => (
        <fieldset key={n} className="grid gap-6 border border-line p-5 md:grid-cols-[200px_1fr_160px_auto] md:items-end">
          <legend className="px-2 text-[11px] uppercase tracking-[0.18em] text-ink">Other platform {n + 1}</legend>
          <Field label="Platform">
            <PlatformSelect side={side} label={`Other platform ${n + 1}`} value={c.platform} onChange={(v) => setOther(n, { platform: v })} />
          </Field>
          <Field label="Link">
            <input className="input" value={c.link} onChange={(e) => setOther(n, { link: e.target.value })} placeholder={PLACEHOLDER[c.platform] || "Link"} inputMode="url" />
          </Field>
          <Field label="Followers">
            <input className="input" value={c.followers} onChange={(e) => setOther(n, { followers: e.target.value })} inputMode="numeric" />
          </Field>
          <button type="button" className="mb-3 text-sm text-pin underline underline-offset-4" onClick={() => set({ others: a.others.filter((_, i) => i !== n) })}>
            Remove
          </button>
        </fieldset>
      ))}
      <button type="button" className="chip w-fit" onClick={() => set({ others: [...a.others, { platform: "", link: "", followers: "" }] })}>
        + Add another platform
      </button>
      <MediaKit {...props} />
      <Screenshots {...props} />
    </>
  );
}

/** Previews of uploaded screenshots by Drive file id (kept while the form is open). */
const shotPreviews = new Map<string, string>();

/**
 * Optional screenshots of their insights or analytics (reach, audience, engagement), like the old form
 * asked for: images of any size, up to MAX_SCREENSHOTS, shown with the lead's photos.
 */
function Screenshots({ a, set }: StepProps) {
  const [status, setStatus] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const add = async (files: FileList | null) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith("image/")).slice(0, MAX_SCREENSHOTS - a.screenshots.length);
    if (!list.length) return;
    let ids = [...a.screenshots];
    try {
      for (const [n, file] of list.entries()) {
        setStatus(`Uploading ${n + 1} of ${list.length}…`);
        const enc = await encodeFile(file, 1800, 0.85);
        const { fileId } = await postJson<{ fileId: string }>("/api/forms/upload", { filename: enc.filename, mimeType: enc.mimeType, data: enc.data });
        shotPreviews.set(fileId, enc.previewUrl);
        ids = [...ids, fileId];
        set({ screenshots: ids });
      }
      setStatus("");
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      if (input.current) input.current.value = "";
    }
  };
  return (
    <Field label="Screenshots of your insights" optional>
      <div className="grid gap-3">
        <p className="text-sm text-muted">Your reach, audience and engagement from your platforms&apos; analytics help us pitch you. Up to {MAX_SCREENSHOTS}.</p>
        {a.screenshots.length > 0 && (
          <ul className="flex flex-wrap gap-3">
            {a.screenshots.map((id, n) => (
              <li key={id} className="grid gap-1 text-xs">
                <span className="block h-24 w-24 overflow-hidden border border-line bg-paper-2">
                  {shotPreviews.get(id) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shotPreviews.get(id)} alt={`Screenshot ${n + 1}`} className="h-full w-full object-cover" />
                  )}
                </span>
                <button type="button" className="w-fit text-pin underline underline-offset-2" onClick={() => set({ screenshots: a.screenshots.filter((x) => x !== id) })}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {a.screenshots.length < MAX_SCREENSHOTS && (
            <button type="button" className="chip" onClick={() => input.current?.click()}>
              + Add screenshots
            </button>
          )}
          {status && <span className="text-sm text-muted">{status}</span>}
        </div>
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => add(e.target.files)} />
    </Field>
  );
}

/** Step 3: your socials. A link or a @handle both work: the handle becomes the profile link. */
export const socials: StepDef = {
  kicker: "Your socials",
  title: "Where can brands find you?",
  problems: ({ a, side }) => socialsProblems(a, side),
  render: (p) => <Socials {...p} />,
};
