"use client";

export type EncodedFile = { filename: string; mimeType: string; data: string; previewUrl: string };

const MAX_BYTES = 2_900_000;

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

async function hasAlpha(bitmap: ImageBitmap) {
  const c = document.createElement("canvas");
  const s = 64;
  c.width = s;
  c.height = s;
  const g = c.getContext("2d")!;
  g.drawImage(bitmap, 0, 0, s, s);
  const d = g.getImageData(0, 0, s, s).data;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 250) return true;
  return false;
}

/** Turns near-white pixels connected to the image edge transparent (a logo on a white background). */
function knockOutWhite(g: CanvasRenderingContext2D, w: number, h: number) {
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  const whiteish = (i: number) => d[i * 4 + 3] > 0 && d[i * 4] > 232 && d[i * 4 + 1] > 232 && d[i * 4 + 2] > 232;
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const i = stack.pop()!;
    if (seen[i] || !whiteish(i)) continue;
    seen[i] = 1;
    d[i * 4 + 3] = 0;
    const x = i % w;
    if (x > 0) stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (i >= w) stack.push(i - w);
    if (i < w * (h - 1)) stack.push(i + w);
  }
  g.putImageData(img, 0, 0);
}

/**
 * Downscales photos so uploads stay small and fast. Transparent PNGs (logos)
 * stay PNG; SVG/GIF/PDF are passed through untouched.
 */
export async function encodeFile(
  file: File,
  maxDim = 2400,
  quality = 0.86,
  opts: { knockout?: boolean } = {},
): Promise<EncodedFile> {
  const previewUrl = URL.createObjectURL(file);
  const passThrough = /svg|gif|pdf/.test(file.type);
  if (passThrough || !file.type.startsWith("image/")) {
    if (file.size > MAX_BYTES) throw new Error(`${file.name} is too large (max ~3 MB).`);
    return { filename: file.name, mimeType: file.type, data: await toBase64(file), previewUrl };
  }
  const bitmap = await createImageBitmap(file);
  const keepPng = opts.knockout || (file.type === "image/png" && (await hasAlpha(bitmap)));
  let dim = maxDim;
  for (let attempt = 0; attempt < 4; attempt++) {
    const scale = Math.min(1, dim / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const g = canvas.getContext("2d")!;
    if (!keepPng) {
      g.fillStyle = "#fff";
      g.fillRect(0, 0, canvas.width, canvas.height);
    }
    g.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    if (opts.knockout) knockOutWhite(g, canvas.width, canvas.height);
    const type = keepPng ? "image/png" : "image/jpeg";
    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), type, quality));
    if (blob.size <= MAX_BYTES) {
      const base = file.name.replace(/\.[^.]+$/, "");
      return { filename: `${base}${keepPng ? ".png" : ".jpg"}`, mimeType: type, data: await toBase64(blob), previewUrl };
    }
    dim = Math.round(dim * 0.7);
  }
  throw new Error(`${file.name} is too large to upload.`);
}

export async function postJson<T = unknown>(url: string, body: unknown, method = "POST"): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
  if (!res.ok || !data.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}
