"use client";

import { useState } from "react";
import { NICHES, PLATFORMS, ROLES, SIGNED, SUCCESS_MESSAGE } from "@/lib/forms";
import { INSTAGRAM_URL } from "@/lib/content";
import { postJson } from "@/lib/upload";
import StepForm, { Chips, Field, isEmail } from "./StepForm";
import { PolaroidUploads, SuccessBoard, type UploadItem } from "./Uploads";

type Role = (typeof ROLES)[number];
type Platform = (typeof PLATFORMS)[number];
type Niche = (typeof NICHES)[number];
type Signed = (typeof SIGNED)[number];

const HANDLE_HINT: Record<Platform, string> = {
  Instagram: "@yourhandle",
  TikTok: "@yourhandle",
  YouTube: "youtube.com/@channel",
  Twitch: "twitch.tv/yourname",
};

export default function TalentForm({ intro = "" }: { intro?: string }) {
  const [f, setF] = useState({ name: "", email: "", wants: "" });
  const [roles, setRoles] = useState<Role[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [channels, setChannels] = useState<Record<string, { handle: string; followers: string }>>({});
  const [shots, setShots] = useState<Record<string, UploadItem[]>>({});
  const [signed, setSigned] = useState<Signed[]>([]);
  const [consent, setConsent] = useState(false);
  const [honey, setHoney] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const channel = (p: Platform) => channels[p] ?? { handle: "", followers: "" };
  const setChannel = (p: Platform, patch: Partial<{ handle: string; followers: string }>) =>
    setChannels((c) => ({ ...c, [p]: { ...channel(p), ...patch } }));
  const shotsFor = (p: Platform) => shots[p] ?? [];
  const setShotsFor = (p: Platform): React.Dispatch<React.SetStateAction<UploadItem[]>> => (next) =>
    setShots((s) => ({ ...s, [p]: typeof next === "function" ? next(s[p] ?? []) : next }));

  const uploading = Object.values(shots).flat().some((u) => u.status === "uploading");
  const channelsValid =
    platforms.length > 0 &&
    platforms.every((p) => channel(p).handle.trim() && /^\d[\d,.]*\s*[kKmM]?$/.test(channel(p).followers.trim()) && shotsFor(p).some((u) => u.status === "done"));

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await postJson<{ reference: string }>("/api/forms/talent", {
        fields: {
          ...f,
          roles,
          niches,
          signed: signed[0] || "",
          consent,
          channels: platforms.map((p) => ({
            platform: p,
            ...channel(p),
            files: shotsFor(p).filter((u) => u.status === "done").map((u) => u.fileId),
          })),
        },
        website_url: honey,
      });
      setDone(res.reference);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <SuccessBoard
        reference={done}
        title={SUCCESS_MESSAGE}
        body="Our team reviews every application personally."
        links={[
          { href: "/about", label: "About Mode Society" },
          { href: INSTAGRAM_URL, label: "Follow us", external: true },
        ]}
      />
    );
  }

  return (
    <>
      {intro && <p className="font-serif mb-10 text-[clamp(18px,1.6vw,22px)] italic leading-snug text-ink">&ldquo;{intro}&rdquo;</p>}
      <input className="honeypot" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} aria-hidden />
      <StepForm
        submitting={submitting}
        error={error}
        submitLabel="Apply now"
        onSubmit={submit}
        steps={[
          {
            kicker: "The basics",
            title: "First, who are you?",
            valid: Boolean(f.name.trim()) && isEmail(f.email),
            hint: "Add your full name and a valid email to continue.",
            content: (
              <>
                <Field label="Full name *">
                  <input className="input" value={f.name} onChange={set("name")} autoComplete="name" placeholder="Your full name" />
                </Field>
                <Field label="Email *">
                  <input className="input" type="email" value={f.email} onChange={set("email")} autoComplete="email" placeholder="you@email.com" />
                </Field>
              </>
            ),
          },
          {
            kicker: "Your world",
            title: "What do you do?",
            valid: roles.length > 0 && niches.length > 0,
            hint: "Tick at least one thing you do and one niche.",
            content: (
              <>
                <Field label="What do you do? * (tick any)">
                  <Chips options={ROLES} value={roles} onChange={setRoles} />
                </Field>
                <Field label="Niche *">
                  <Chips options={NICHES} value={niches} onChange={setNiches} />
                </Field>
              </>
            ),
          },
          {
            kicker: "Your channels",
            title: "Where can we find you?",
            valid: channelsValid && !uploading,
            hint: uploading
              ? "Hang on, your screenshots are still uploading…"
              : "For each channel, add your handle, follower count (e.g. 12,400 or 12.4k) and an insights screenshot.",
            content: (
              <>
                <Field label="Social handles * (at least one)">
                  <Chips options={PLATFORMS} value={platforms} onChange={setPlatforms} />
                </Field>
                {platforms.map((p) => (
                  <fieldset key={p} className="grid gap-5 border border-espresso/15 p-5">
                    <legend className="px-2 text-[11px] uppercase tracking-[0.18em] text-ink">{p}</legend>
                    <div className="grid gap-6 md:grid-cols-[1fr_160px]">
                      <Field label="Handle *">
                        <input className="input" value={channel(p).handle} onChange={(e) => setChannel(p, { handle: e.target.value })} placeholder={HANDLE_HINT[p]} />
                      </Field>
                      <Field label="Followers *">
                        <input
                          className="input"
                          inputMode="numeric"
                          value={channel(p).followers}
                          onChange={(e) => setChannel(p, { followers: e.target.value })}
                          placeholder="12,400"
                        />
                      </Field>
                    </div>
                    <Field label="Engagement screenshots * (insights showing reach, views, likes, saves)">
                      <PolaroidUploads items={shotsFor(p)} setItems={setShotsFor(p)} max={3} label="Add screenshot" accept="image/*,application/pdf" />
                    </Field>
                  </fieldset>
                ))}
              </>
            ),
          },
          {
            kicker: "Final level",
            title: "Nearly there.",
            valid: consent && signed.length > 0,
            hint: "Let us know if you're signed elsewhere, and tick the consent box.",
            content: (
              <>
                <Field label="What do you want from an agency?" optional>
                  <textarea className="input" value={f.wants} onChange={set("wants")} placeholder="The brands, support and growth you're looking for." />
                </Field>
                <Field label="Signed with another agency?">
                  <Chips options={SIGNED} value={signed} onChange={setSigned} multiple={false} />
                </Field>
                <label className="flex cursor-pointer items-start gap-3 text-[15px] text-ink">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--ink)]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  I&apos;m 18 or over, or have a parent or guardian&apos;s consent. *
                </label>
                <p className="text-xs text-muted">Files are stored privately in Mode Society&apos;s Google Drive and only used to review your application.</p>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
