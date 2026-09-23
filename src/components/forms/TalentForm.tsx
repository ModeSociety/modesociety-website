"use client";

import { useState } from "react";
import Link from "next/link";
import { HEARD, NICHES } from "@/lib/forms";
import { postJson } from "@/lib/upload";
import StepForm, { Chips, Field, isEmail } from "./StepForm";
import { PolaroidUploads, SuccessBoard, type UploadItem } from "./Uploads";

type Niche = (typeof NICHES)[number];
type Heard = (typeof HEARD)[number];

export default function TalentForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", why: "", instagram: "", tiktok: "", portfolio: "" });
  const [niches, setNiches] = useState<Niche[]>([]);
  const [heard, setHeard] = useState<Heard[]>([]);
  const [work, setWork] = useState<UploadItem[]>([]);
  const [analytics, setAnalytics] = useState<UploadItem[]>([]);
  const [honey, setHoney] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const uploading = [...work, ...analytics].some((u) => u.status === "uploading");
  const workReady = work.filter((w) => w.status === "done");

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await postJson<{ reference: string }>("/api/forms/talent", {
        fields: { ...f, niches, heard: heard[0] || "" },
        workFiles: workReady.map((w) => w.fileId),
        analyticsFiles: analytics.filter((a) => a.status === "done").map((a) => a.fileId),
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
        image={workReady[0]?.preview}
        title="You're on the board."
        body="Thanks for applying to Mode Society. Our team reviews every application personally and will be in touch if it's a fit."
        links={[
          { href: "/about", label: "About Mode Society" },
          { href: "https://instagram.com/modesocietyagency", label: "Follow us", external: true },
        ]}
      />
    );
  }

  return (
    <>
      <input className="honeypot" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} aria-hidden />
      <StepForm
        submitting={submitting}
        error={error}
        submitLabel="Send application"
        onSubmit={submit}
        steps={[
          {
            kicker: "The basics",
            title: "First, who are you?",
            valid: Boolean(f.name.trim()) && isEmail(f.email),
            hint: "Add your name and a valid email to continue.",
            content: (
              <>
                <Field label="Name">
                  <input className="input" value={f.name} onChange={set("name")} autoComplete="name" placeholder="Your full name" />
                </Field>
                <div className="grid gap-8 md:grid-cols-2">
                  <Field label="Email">
                    <input className="input" type="email" value={f.email} onChange={set("email")} autoComplete="email" placeholder="you@email.com" />
                  </Field>
                  <Field label="Phone" optional>
                    <input className="input" type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder="+61" />
                  </Field>
                </div>
              </>
            ),
          },
          {
            kicker: "Your world",
            title: "What's your niche?",
            valid: niches.length > 0 && f.why.trim().length > 10,
            hint: "Pick at least one niche and tell us a little about why Mode Society fits.",
            content: (
              <>
                <Field label="Which of these niches align with you?">
                  <Chips options={NICHES} value={niches} onChange={setNiches} />
                </Field>
                <Field label="Why do you feel Mode Society is the right fit for you?">
                  <textarea className="input" value={f.why} onChange={set("why")} placeholder="Tell us about your content, your audience and the brands you'd love to work with." />
                </Field>
              </>
            ),
          },
          {
            kicker: "Your platforms",
            title: "Where can we find you?",
            valid: Boolean(f.instagram.trim() || f.tiktok.trim() || f.portfolio.trim()),
            hint: "Add at least one link so we can see your work.",
            content: (
              <>
                <Field label="Instagram link">
                  <input className="input" value={f.instagram} onChange={set("instagram")} placeholder="www.instagram.com/yourhandle/" />
                </Field>
                <Field label="TikTok link">
                  <input className="input" value={f.tiktok} onChange={set("tiktok")} placeholder="www.tiktok.com/@yourhandle" />
                </Field>
                <Field label="Portfolio / other platform" optional>
                  <input className="input" value={f.portfolio} onChange={set("portfolio")} placeholder="YouTube, Twitch, website…" />
                </Field>
                <Field label="Where did you hear about us?" optional>
                  <Chips options={HEARD} value={heard} onChange={setHeard} multiple={false} />
                </Field>
              </>
            ),
          },
          {
            kicker: "Final level",
            title: "Show us your best work.",
            valid: workReady.length > 0 && !uploading,
            hint: uploading ? "Hang on, your photos are still developing…" : "Upload at least one image of previous work.",
            content: (
              <>
                <Field label="Clear images of previous work (up to 6)">
                  <PolaroidUploads items={work} setItems={setWork} max={6} label="Add photo" />
                </Field>
                <Field label="Screenshots of your analytics (up to 4)" optional>
                  <PolaroidUploads items={analytics} setItems={setAnalytics} max={4} label="Add screenshot" accept="image/*,application/pdf" />
                </Field>
                <p className="text-xs text-muted">
                  Files are stored privately in Mode Society&apos;s Google Drive and only used to review your application.{" "}
                  <Link href="/contact" className="underline">Questions?</Link>
                </p>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
