"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { encodeFile, postJson } from "@/lib/upload";

export type UploadItem = { key: string; name: string; preview: string; status: "uploading" | "done" | "error"; fileId?: string; error?: string };

/** Each photo "develops" like a polaroid while it uploads to Drive. */
export function PolaroidUploads({
  items,
  setItems,
  max,
  label,
  accept = "image/*",
}: {
  items: UploadItem[];
  setItems: React.Dispatch<React.SetStateAction<UploadItem[]>>;
  max: number;
  label: string;
  accept?: string;
}) {
  const input = useRef<HTMLInputElement>(null);

  const add = async (files: FileList | null) => {
    if (!files) return;
    const chosen = Array.from(files).slice(0, Math.max(0, max - items.length));
    for (const file of chosen) {
      const key = `${file.name}-${file.size}-${Math.random()}`;
      const isImage = file.type.startsWith("image/");
      setItems((cur) => [...cur, { key, name: file.name, preview: isImage ? URL.createObjectURL(file) : "", status: "uploading" }]);
      try {
        const enc = await encodeFile(file, 2000, 0.84);
        const { fileId } = await postJson<{ fileId: string }>("/api/forms/upload", {
          filename: enc.filename,
          mimeType: enc.mimeType,
          data: enc.data,
        });
        setItems((cur) => cur.map((it) => (it.key === key ? { ...it, status: "done", fileId } : it)));
      } catch (err) {
        setItems((cur) => cur.map((it) => (it.key === key ? { ...it, status: "error", error: (err as Error).message } : it)));
      }
    }
    if (input.current) input.current.value = "";
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {items.map((it, i) => (
          <div
            key={it.key}
            className="polaroid !relative"
            style={{ transform: `rotate(${((i * 37) % 9) - 4}deg)`, ["--w" as string]: "118px", ["--pin-color" as string]: i % 2 ? "#b08d57" : "#c3362b" }}
          >
            <span className="pin" />
            <div className="photo !aspect-square">
              {it.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.preview}
                  alt={it.name}
                  className="transition-[filter,opacity] duration-[1600ms]"
                  style={
                    it.status === "uploading"
                      ? { filter: "brightness(1.8) saturate(0) blur(2px)", opacity: 0.6 }
                      : it.status === "error"
                        ? { filter: "grayscale(1)", opacity: 0.4 }
                        : undefined
                  }
                />
              ) : (
                <div className="grid h-full place-items-center text-xs text-muted">PDF</div>
              )}
            </div>
            <div className="caption !text-[11px]">
              <span className="truncate">{it.status === "uploading" ? "developing…" : it.status === "error" ? "failed" : "✓ ready"}</span>
              <button
                type="button"
                className="not-italic text-muted hover:text-pin"
                aria-label={`Remove ${it.name}`}
                onClick={() => setItems((cur) => cur.filter((x) => x.key !== it.key))}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        {items.length < max && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="grid h-[150px] w-[118px] place-items-center border border-dashed border-ink/30 text-center text-xs uppercase tracking-[0.14em] text-muted transition hover:border-ink hover:text-ink"
            data-cursor="add"
          >
            <span>
              <span className="font-serif block text-3xl normal-case italic">+</span>
              {label}
            </span>
          </button>
        )}
      </div>
      {items.some((i) => i.status === "error") && (
        <p className="mt-3 text-sm text-pin">{items.find((i) => i.status === "error")?.error} — remove it and try again.</p>
      )}
      <input ref={input} type="file" accept={accept} multiple hidden onChange={(e) => add(e.target.files)} />
    </div>
  );
}

export type SuccessLink = { href: string; label: string; external?: boolean };

const REDIRECT_SECONDS = 15;

/**
 * Falling pins + a pinned polaroid for the success screen, with clear next steps and a
 * gentle auto-return to the homepage that the visitor can cancel.
 */
export function SuccessBoard({
  title,
  body,
  reference,
  image,
  links,
}: {
  title: string;
  body: string;
  reference: string;
  image?: string;
  links: SuccessLink[];
}) {
  const router = useRouter();
  const [left, setLeft] = useState(REDIRECT_SECONDS);
  const [stay, setStay] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (stay) return;
    if (left <= 0) {
      router.push("/");
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, stay, router]);

  return (
    <div className="relative py-10 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="pin !absolute"
            style={{
              left: `${(i * 53) % 100}%`,
              top: "-20px",
              ["--pin-color" as string]: ["#c3362b", "#b08d57", "#1b1b1b"][i % 3],
              animation: `pinfall ${1.6 + (i % 5) * 0.3}s ${(i % 7) * 0.12}s cubic-bezier(.3,.6,.4,1) forwards`,
            }}
          />
        ))}
      </div>
      {image && (
        <div className="polaroid !relative mx-auto rotate-[-3deg] [--w:200px] animate-[pinin_1s_cubic-bezier(.16,1,.3,1)]">
          <span className="pin" />
          <div className="photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" />
          </div>
          <div className="caption">
            <span>You, pinned.</span>
          </div>
        </div>
      )}
      <p className="eyebrow mt-10">Reference {reference}</p>
      <h2 className="font-display mt-3 text-[clamp(28px,4vw,52px)]">{title}</h2>
      <p className="mx-auto mt-4 max-w-md text-ink-2">{body}</p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn">
          Back to home <span className="arrow">→</span>
        </Link>
        {links.map((l) =>
          l.external ? (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn ghost">
              {l.label} ↗
            </a>
          ) : (
            <Link key={l.href} href={l.href} className="btn ghost">
              {l.label}
            </Link>
          ),
        )}
      </div>

      <p className="mt-8 text-sm text-muted" aria-live="polite">
        {stay ? (
          "No rush. Take your time."
        ) : (
          <>
            Taking you back to the homepage in {left}s ·{" "}
            <button type="button" onClick={() => setStay(true)} className="underline underline-offset-4 hover:text-ink">
              stay here
            </button>
          </>
        )}
      </p>
      {!stay && (
        <div className="mx-auto mt-3 h-px w-40 overflow-hidden bg-line">
          <div className="h-full bg-ink" style={{ width: `${(left / REDIRECT_SECONDS) * 100}%`, transition: "width 1s linear" }} />
        </div>
      )}
      <style>{`
        @keyframes pinfall { to { transform: translateY(520px) rotate(360deg); opacity: 0; } }
        @keyframes pinin { from { transform: translateY(-120px) rotate(12deg); opacity: 0; } to { transform: rotate(-3deg); opacity: 1; } }
      `}</style>
    </div>
  );
}
