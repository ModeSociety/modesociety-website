"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StepForm, { Chips, Field, isEmail } from "@/components/forms/StepForm";
import { postJson } from "@/lib/upload";
import {
  PLATFORMS,
  TECH_APPLY_AS,
  TECH_BUDGETS,
  TECH_CATEGORY_OPTIONS,
  TECH_FORMAT_OPTIONS,
  TECH_REGIONS,
  TECH_TIMELINES,
} from "@/lib/tech";

type Kind = "brand" | "creator";

function Done({ reference, kind }: { reference: string; kind: Kind }) {
  return (
    <div className="t-panel p-8 text-center md:p-12" role="status">
      <p className="tech-mono text-[11px] uppercase text-taccent">Received · {reference}</p>
      <h2 className="tech-wide mt-4 text-[clamp(34px,4vw,56px)] text-t">Thanks!</h2>
      <p className="mx-auto mt-4 max-w-md text-[16px] text-t2">
        {kind === "brand"
          ? "Our team will read your brief and email you to set up a call."
          : "Our team reviews every application and will email you either way."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/tech/talent" className="btn ghost">
          See the roster
        </Link>
        <Link href="/tech" className="btn">
          Back to ModeSociety Tech
        </Link>
      </div>
    </div>
  );
}

function BrandForm() {
  const [f, setF] = useState({ brand: "", website: "", name: "", email: "", about: "", budget: "", timeline: "" });
  const [categories, setCategories] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [honey, setHoney] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await postJson<{ reference: string }>("/api/forms/tech-brand", { fields: { ...f, categories, formats }, website_url: honey });
      setDone(res.reference);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };
  if (done) return <Done reference={done} kind="brand" />;

  return (
    <>
      <input className="honeypot" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} aria-hidden />
      <StepForm
        submitting={submitting}
        error={error}
        submitLabel="Send enquiry"
        onSubmit={submit}
        steps={[
          {
            kicker: "About you",
            title: "Who are we talking to?",
            valid: Boolean(f.brand.trim() && f.name.trim()) && isEmail(f.email),
            hint: "Brand name, your name and a valid email are needed.",
            content: (
              <>
                <div className="grid gap-8 md:grid-cols-2">
                  <Field label="Brand name *">
                    <input className="input" value={f.brand} onChange={set("brand")} autoComplete="organization" />
                  </Field>
                  <Field label="Website" optional>
                    <input className="input" value={f.website} onChange={set("website")} placeholder="yourbrand.com" />
                  </Field>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                  <Field label="Your name *">
                    <input className="input" value={f.name} onChange={set("name")} autoComplete="name" />
                  </Field>
                  <Field label="Email *">
                    <input className="input" type="email" value={f.email} onChange={set("email")} autoComplete="email" />
                  </Field>
                </div>
              </>
            ),
          },
          {
            kicker: "The brief",
            title: "What are you launching?",
            valid: f.about.trim().length > 10,
            hint: "Tell us a little about the campaign.",
            content: (
              <>
                <Field label="Your category" optional>
                  <Chips options={TECH_CATEGORY_OPTIONS} value={categories} onChange={setCategories} />
                </Field>
                <Field label="Formats you're interested in" optional>
                  <Chips options={TECH_FORMAT_OPTIONS} value={formats} onChange={setFormats} />
                </Field>
                <Field label="About the campaign *">
                  <textarea className="input" value={f.about} onChange={set("about")} placeholder="The product, the goal, the audience, any dates." />
                </Field>
                <div className="grid gap-8 md:grid-cols-2">
                  <Field label="Budget" optional>
                    <select className="input" value={f.budget} onChange={set("budget")}>
                      <option value="">Choose…</option>
                      {TECH_BUDGETS.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Timeline" optional>
                    <select className="input" value={f.timeline} onChange={set("timeline")}>
                      <option value="">Choose…</option>
                      {TECH_TIMELINES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </>
            ),
          },
        ]}
      />
    </>
  );
}

type Channel = { platform: string; handle: string; followers: string };

function CreatorForm() {
  const [f, setF] = useState({ name: "", handle: "", email: "", as: "", niche: "", region: "", notes: "" });
  const [channels, setChannels] = useState<Channel[]>([{ platform: "Twitch", handle: "", followers: "" }]);
  const [adult, setAdult] = useState(false);
  const [honey, setHoney] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const setCh = (i: number, k: keyof Channel, v: string) => setChannels(channels.map((c, j) => (j === i ? { ...c, [k]: v } : c)));
  const filled = channels.filter((c) => c.handle.trim());

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await postJson<{ reference: string }>("/api/forms/tech-creator", { fields: { ...f, channels: filled, adult }, website_url: honey });
      setDone(res.reference);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };
  if (done) return <Done reference={done} kind="creator" />;

  return (
    <>
      <input className="honeypot" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} aria-hidden />
      <StepForm
        submitting={submitting}
        error={error}
        submitLabel="Apply to sign"
        onSubmit={submit}
        steps={[
          {
            kicker: "About you",
            title: "First, who are you?",
            valid: Boolean(f.name.trim() && f.as) && isEmail(f.email),
            hint: "Your name, a valid email and what you're applying as are needed.",
            content: (
              <>
                <div className="grid gap-8 md:grid-cols-2">
                  <Field label="Name *">
                    <input className="input" value={f.name} onChange={set("name")} autoComplete="name" />
                  </Field>
                  <Field label="Your @" optional>
                    <input className="input" value={f.handle} onChange={set("handle")} placeholder="@yourhandle" />
                  </Field>
                </div>
                <Field label="Email *">
                  <input className="input" type="email" value={f.email} onChange={set("email")} autoComplete="email" />
                </Field>
                <Field label="Applying as *">
                  <Chips options={TECH_APPLY_AS} value={f.as ? [f.as as (typeof TECH_APPLY_AS)[number]] : []} onChange={(v) => setF({ ...f, as: v[0] || "" })} multiple={false} />
                </Field>
              </>
            ),
          },
          {
            kicker: "Your channels",
            title: "Where's your audience?",
            valid: filled.length > 0,
            hint: "Add at least one channel with your handle.",
            content: (
              <>
                {channels.map((c, i) => (
                  <div key={i} className="grid gap-6 md:grid-cols-[160px_1fr_140px_auto] md:items-end">
                    <Field label="Platform">
                      <select className="input" value={c.platform} onChange={(e) => setCh(i, "platform", e.target.value)}>
                        {PLATFORMS.map((p) => (
                          <option key={p.id}>{p.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Handle or link">
                      <input className="input" value={c.handle} onChange={(e) => setCh(i, "handle", e.target.value)} placeholder="@handle or URL" />
                    </Field>
                    <Field label="Followers">
                      <input className="input" value={c.followers} onChange={(e) => setCh(i, "followers", e.target.value)} placeholder="e.g. 18K" />
                    </Field>
                    {channels.length > 1 ? (
                      <button type="button" onClick={() => setChannels(channels.filter((_, j) => j !== i))} className="pb-3 text-[13px] text-t3 hover:text-t" aria-label="Remove this channel">
                        Remove
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                ))}
                {channels.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setChannels([...channels, { platform: PLATFORMS.find((p) => !channels.some((c) => c.platform === p.label))?.label || "YouTube", handle: "", followers: "" }])}
                    className="chip w-fit"
                  >
                    + Add a channel
                  </button>
                )}
                <div className="grid gap-8 md:grid-cols-2">
                  <Field label="Games or niche" optional>
                    <input className="input" value={f.niche} onChange={set("niche")} placeholder="e.g. FPS, PC builds, mobile, tech reviews" />
                  </Field>
                  <Field label="Where you're based" optional>
                    <select className="input" value={f.region} onChange={set("region")}>
                      <option value="">Choose…</option>
                      {TECH_REGIONS.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </>
            ),
          },
          {
            kicker: "Last thing",
            title: "Anything else?",
            valid: adult,
            hint: "Every creator we sign is 18 or over; for a team, that means every member.",
            content: (
              <>
                <Field label="Anything you'd like us to know" optional>
                  <textarea className="input" value={f.notes} onChange={set("notes")} placeholder="Brands you've worked with, what you're looking for…" />
                </Field>
                <label className="flex cursor-pointer items-start gap-3 text-[15px] text-t2">
                  <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="mt-1 h-4 w-4 accent-[#4b6ff5]" />
                  I&apos;m 18 or over (for a team: every member is).
                </label>
              </>
            ),
          },
        ]}
      />
    </>
  );
}

const HASH: Record<string, Kind> = { "#enquire": "brand", "#apply": "creator" };

/**
 * "I'm a brand" / "I'm a creator", each opening its form. On the Contact page ?as=brand|creator
 * preselects; on the landing page (`onPage`) the links #enquire and #apply do.
 */
export default function TechForms({ initial = "brand", onPage = false }: { initial?: Kind; onPage?: boolean }) {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>(initial);
  const choose = (k: Kind) => {
    setKind(k);
    if (!onPage) router.replace(`/tech/contact?as=${k}`, { scroll: false });
  };
  useEffect(() => {
    if (!onPage) return;
    const fromHash = () => {
      const k = HASH[location.hash];
      if (k) setKind(k);
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the hash is only known in the browser
    fromHash();
    addEventListener("hashchange", fromHash);
    return () => removeEventListener("hashchange", fromHash);
  }, [onPage]);
  return (
    <div>
      <div role="tablist" aria-label="Who are you?" className="mb-10 inline-flex rounded-full bg-tsurface p-1 shadow-[inset_0_0_0_1px_rgba(10,18,56,0.14)]">
        {(
          [
            ["brand", "I'm a brand"],
            ["creator", "I'm a creator"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={kind === k}
            onClick={() => choose(k)}
            className={`rounded-full px-5 py-2.5 text-[14px] font-medium transition-colors ${kind === k ? "bg-[linear-gradient(180deg,#5a7bff,#2f4fe0)] text-white" : "text-t2 hover:text-t"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" key={kind}>
        {kind === "brand" ? <BrandForm /> : <CreatorForm />}
      </div>
    </div>
  );
}
