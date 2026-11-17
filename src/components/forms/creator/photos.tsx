"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_PHOTO_BYTES, MAX_PHOTOS, MIN_PHOTO_SIDE, PHOTO_TOO_SMALL, photosProblems } from "@/lib/application";
import { encodeFile, postJson } from "@/lib/upload";
import type { StepDef, StepProps } from "./types";

type Item = { key: string; preview: string; status: "checking" | "uploading" | "done" | "error"; fileId?: string; error?: string };

/** Previews of uploaded photos by Drive file id, so going Back and forth keeps showing them. */
const previews = new Map<string, string>();

const ACCEPT = "image/jpeg,image/png,image/heic,image/heif,.heic,.heif";

/** The photo's pixel size, or null when this browser can't read it (e.g. HEIC outside Safari). */
async function sizeOf(file: File): Promise<{ w: number; h: number } | null> {
  try {
    const bmp = await createImageBitmap(file);
    const s = { w: bmp.width, h: bmp.height };
    bmp.close();
    return s;
  } catch {
    return null;
  }
}

async function upload(file: File | Blob, name: string, maxDim: number, quality: number) {
  const f = file instanceof File ? file : new File([file], name, { type: file.type });
  const enc = await encodeFile(f, maxDim, quality);
  const { fileId } = await postJson<{ fileId: string }>("/api/forms/upload", { filename: enc.filename, mimeType: enc.mimeType, data: enc.data });
  return fileId;
}

/** A 512 px square JPEG of the chosen part of the photo (the round profile picture's source). */
async function squareCrop(src: string, crop: Crop): Promise<Blob> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const side = Math.min(img.naturalWidth, img.naturalHeight) / crop.zoom;
  const sx = (img.naturalWidth - side) * crop.x;
  const sy = (img.naturalHeight - side) * crop.y;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  c.getContext("2d")!.drawImage(img, sx, sy, side, side, 0, 0, 512, 512);
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't crop the photo"))), "image/jpeg", 0.9));
}

/** x, y: where the square sits within the photo (0 to 1); zoom: 1 is the largest square. */
type Crop = { x: number; y: number; zoom: number };

/** Drag to move, slide to zoom: the photo in a circle, as brands will see it. */
function CircleCrop({ src, onSave, saving, saved }: { src: string; onSave: (c: Crop) => void; saving: boolean; saved: boolean }) {
  const [crop, setCrop] = useState<Crop>({ x: 0.5, y: 0.3, zoom: 1 });
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const drag = useRef<{ x: number; y: number; c: Crop } | null>(null);
  const BOX = 220;
  useEffect(() => {
    const img = new Image();
    img.onload = () => setSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
  }, [src]);
  if (!size) return null;
  // the photo drawn so the chosen square fills the circle
  const side = Math.min(size.w, size.h) / crop.zoom;
  const scale = BOX / side;
  const left = -(size.w - side) * crop.x * scale;
  const top = -(size.h - side) * crop.y * scale;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        className="relative shrink-0 cursor-grab touch-none overflow-hidden rounded-full border border-line bg-paper-2 active:cursor-grabbing"
        style={{ width: BOX, height: BOX }}
        role="img"
        aria-label="Your profile photo, as it will appear"
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, c: crop };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const spanX = (size.w - side) * scale || 1;
          const spanY = (size.h - side) * scale || 1;
          setCrop({ ...d.c, x: clamp(d.c.x - (e.clientX - d.x) / spanX), y: clamp(d.c.y - (e.clientY - d.y) / spanY) });
        }}
        onPointerUp={() => (drag.current = null)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" draggable={false} className="pointer-events-none absolute max-w-none select-none" style={{ left, top, width: size.w * scale, height: size.h * scale }} />
      </div>
      <div className="grid gap-3 text-sm">
        <label className="grid gap-1">
          <span className="text-muted">Zoom</span>
          <input type="range" min={1} max={3} step={0.01} value={crop.zoom} onChange={(e) => setCrop({ ...crop, zoom: Number(e.target.value) })} />
        </label>
        <p className="max-w-56 text-muted">Drag the photo to centre your face.</p>
        <button type="button" className="btn !justify-center !py-2.5" disabled={saving} onClick={() => onSave(crop)}>
          {saving ? "Saving…" : saved ? "Update the crop" : "Use this crop"}
        </button>
      </div>
    </div>
  );
}

function Photos({ a, set }: StepProps) {
  const [items, setItems] = useState<Item[]>(() => a.photos.map((id) => ({ key: id, preview: previews.get(id) || "", status: "done", fileId: id })));
  const [cropping, setCropping] = useState(false);
  const [cropError, setCropError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const done = items.filter((i) => i.status === "done" && i.fileId);

  // the answer is the uploaded photos, in order (the first is the profile photo)
  const ids = done.map((i) => i.fileId!);
  const key = ids.join(",");
  useEffect(() => {
    if (key === a.photos.join(",")) return;
    set(ids[0] === a.photos[0] ? { photos: ids } : { photos: ids, profileThumb: "" }); // a new first photo needs a new crop
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs when the uploaded photos change
  }, [key]);
  const update = (k: string, patch: Partial<Item>) => setItems((cur) => cur.map((i) => (i.key === k ? { ...i, ...patch } : i)));

  const add = async (files: FileList | null) => {
    if (!files) return;
    const room = MAX_PHOTOS - items.filter((i) => i.status !== "error").length;
    for (const file of Array.from(files).slice(0, Math.max(0, room))) {
      const k = `${file.name}-${file.size}-${Math.random()}`;
      const preview = URL.createObjectURL(file);
      setItems((cur) => [...cur, { key: k, preview, status: "checking" }]);
      if (file.size > MAX_PHOTO_BYTES) {
        update(k, { status: "error", error: "This photo is over 15 MB." });
        continue;
      }
      const size = await sizeOf(file);
      if (!size) {
        update(k, { status: "error", error: "This browser can't open that photo. Please choose a JPG or PNG (on iPhone: Photos → Share → Save as JPEG)." });
        continue;
      }
      if (Math.min(size.w, size.h) < MIN_PHOTO_SIDE) {
        update(k, { status: "error", error: PHOTO_TOO_SMALL });
        continue;
      }
      update(k, { status: "uploading" });
      try {
        const fileId = await upload(file, file.name, 2160, 0.9);
        previews.set(fileId, preview);
        update(k, { status: "done", fileId });
      } catch (err) {
        update(k, { status: "error", error: (err as Error).message });
      }
    }
    if (input.current) input.current.value = "";
  };

  const remove = (k: string) => setItems((cur) => cur.filter((i) => i.key !== k));
  const makeFirst = (k: string) => setItems((cur) => [...cur.filter((i) => i.key === k), ...cur.filter((i) => i.key !== k)]);

  const profile = done[0];
  return (
    <>
      <p className="text-[15px] leading-relaxed text-ink-2">
        Upload a clear, high-quality photo of yourself. Face visible, good lighting, no group shots, heavy filters or logos. This is the first thing brands
        see. JPG, PNG or HEIC, at least 1080 x 1080 pixels, up to 15 MB each. The first photo is your profile photo.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((it, n) => (
          <figure key={it.key} className="grid gap-2">
            <div className={`relative aspect-square overflow-hidden border bg-paper-2 ${it.key === profile?.key ? "border-ink" : "border-line"}`}>
              {it.preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.preview} alt={`Photo ${n + 1}`} className={`h-full w-full object-cover ${it.status === "done" ? "" : "opacity-50"}`} />
              )}
              {it.key === profile?.key && <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[11px] text-paper">Profile photo</span>}
            </div>
            <figcaption className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className={it.status === "error" ? "text-pin" : "text-muted"}>
                {it.status === "checking" ? "Checking…" : it.status === "uploading" ? "Uploading…" : it.status === "error" ? it.error : "✓ Uploaded"}
              </span>
              <span className="flex gap-3">
                {it.status === "done" && it.key !== profile?.key && (
                  <button type="button" className="underline underline-offset-2" onClick={() => makeFirst(it.key)}>
                    Make profile photo
                  </button>
                )}
                <button type="button" className="text-pin underline underline-offset-2" onClick={() => remove(it.key)} aria-label={`Remove photo ${n + 1}`}>
                  Remove
                </button>
              </span>
            </figcaption>
          </figure>
        ))}
        {items.filter((i) => i.status !== "error").length < MAX_PHOTOS && (
          <button type="button" onClick={() => input.current?.click()} className="grid aspect-square place-items-center border border-dashed border-line text-sm text-ink-2 hover:border-ink">
            + Add {items.length ? "another photo" : "your best headshots / pics"}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept={ACCEPT} multiple hidden onChange={(e) => add(e.target.files)} />
      {profile?.preview && (
        <div className="grid gap-3">
          <p className="eyebrow">Your profile photo</p>
          <CircleCrop
            src={profile.preview}
            saving={cropping}
            saved={Boolean(a.profileThumb)}
            onSave={async (crop) => {
              setCropping(true);
              setCropError("");
              try {
                const thumb = await upload(await squareCrop(profile.preview, crop), "profile-thumbnail.jpg", 512, 0.9);
                set({ profileThumb: thumb });
              } catch (err) {
                setCropError((err as Error).message);
              } finally {
                setCropping(false);
              }
            }}
          />
          {a.profileThumb && <p className="text-sm text-muted">✓ Crop saved.</p>}
          {cropError && <p className="text-sm text-pin">{cropError}</p>}
        </div>
      )}
    </>
  );
}

/** Step 2: "Upload your best headshots/pics" (required). */
export const photos: StepDef = {
  kicker: "Your photos",
  title: "Upload your best headshots / pics.",
  problems: ({ a }) => photosProblems(a),
  render: (p) => <Photos {...p} />,
};
