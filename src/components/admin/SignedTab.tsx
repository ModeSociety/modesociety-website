"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { flagOf, formatCount, placeOf } from "@/lib/enquiries";
import type { PaymentView } from "@/lib/payment";
import { postJson } from "@/lib/upload";
import { CONTRACT_TYPES, localDate, nextRenewal, optOutWindow, type Contract, type SignedCreator } from "@/lib/signed";
import type { Side } from "@/lib/side";
import LeadImages from "./LeadImages";
import { Channels, Linkified } from "./LeadsTab";

/** The last list this browser saw per business, so coming back shows it at once. */
const kept: Partial<Record<Side, SignedCreator[]>> = {};

/** "17 Nov 2026" from a YYYY-MM-DD or an ISO date-time ("—" when there's none). */
export function showDate(v: string | null) {
  const day = v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : v ? localDate(v) : "";
  if (!day) return "—";
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

const nameOf = (s: SignedCreator) => s.application?.title || s.contract.reference;
const contractLabel = (s: SignedCreator) => (s.contract.type ? `${s.contract.type}${s.contract.commission ? ` (${s.contract.commission})` : ""}` : "Not set");

/**
 * Signed Talent: the open business's signed creators (Asha's brief): photo, name, main channel,
 * followers, representation, location, signed date and renewal date, with search and filters.
 * Creators join the list when their lead is marked Signed.
 */
/** What an admin can change on a signed creator (the API's PATCH body). */
export type SignedPatch = { modeEmailInBio?: boolean; dedicatedEmail?: string; type?: string; signedAt?: string };

export default function SignedTab({ side, disabled, notify }: { side: Side; disabled: boolean; notify: (m: string) => void }) {
  const [items, setItems] = useState<SignedCreator[] | null>(kept[side] ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [rep, setRep] = useState("");
  const [platform, setPlatform] = useState("");
  const [country, setCountry] = useState("");
  const [noBio, setNoBio] = useState(false);
  const [open, setOpen] = useState("");

  /** the kept copy first (instant), then a fresh one from the Sheet */
  const load = useCallback(async () => {
    if (disabled) return;
    setError("");
    const get = async (fresh: boolean) => {
      const r = await fetch(`/api/admin/signed?side=${side}${fresh ? "&fresh=1" : ""}`);
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      return d.items as SignedCreator[];
    };
    try {
      if (!kept[side]) setItems((kept[side] = await get(false)));
      setLoading(true);
      setItems((kept[side] = await get(true)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [disabled, side]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on open
    load();
  }, [load]);

  const options = useMemo(() => {
    const all = items || [];
    const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort();
    return {
      platforms: uniq(all.map((s) => s.application?.creator?.platform || "")),
      countries: uniq(all.map((s) => s.application?.creator?.country || "")),
    };
  }, [items]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items || []).filter((s) => {
      const c = s.application?.creator;
      if (rep && s.contract.type !== rep) return false;
      if (platform && c?.platform !== platform) return false;
      if (country && c?.country !== country) return false;
      if (noBio && s.contract.modeEmailInBio) return false;
      if (!q) return true;
      return [nameOf(s), s.contract.reference, s.application?.email, s.contract.dedicatedEmail, ...(s.application?.fields.map((f) => f.value) || [])]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, rep, platform, country, noBio]);

  /** saves a change to the Sheet, then shows it here (and in this browser's kept copy) */
  const save = async (reference: string, patch: SignedPatch) => {
    const res = await postJson<{ patch: Record<string, string> }>("/api/admin/signed", { reference, side, patch }, "PATCH");
    const p = res.patch;
    const next = (items || []).map((s) => {
      if (s.contract.reference !== reference) return s;
      const c: Contract = { ...s.contract };
      if (p.contract !== undefined) c.type = p.contract;
      if (p.commission !== undefined) c.commission = p.commission;
      if (p.signedAt !== undefined) c.signedAt = `${p.signedAt}T12:00:00+10:00`; // midday Melbourne: the same date in summer and winter
      if (p.modeEmailInBio !== undefined) c.modeEmailInBio = p.modeEmailInBio === "Yes";
      if (p.dedicatedEmail !== undefined) c.dedicatedEmail = p.dedicatedEmail;
      return { ...s, contract: c };
    });
    setItems((kept[side] = next));
    notify("Saved to the Signed Talent sheet");
  };

  if (disabled) return <p className="text-ink-2">Connect the Google Sheet backend to see signed talent.</p>;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search signed talent…" aria-label="Search" className="min-w-[220px] flex-1 border border-line bg-white px-3 py-2" />
        <select value={rep} onChange={(e) => setRep(e.target.value)} aria-label="Representation" className="border border-line bg-white px-3 py-2">
          <option value="">All contracts</option>
          <option>Exclusive</option>
          <option>Non-exclusive</option>
        </select>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} aria-label="Platform" className="border border-line bg-white px-3 py-2">
          <option value="">All platforms</option>
          {options.platforms.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Country" className="border border-line bg-white px-3 py-2">
          <option value="">All countries</option>
          {options.countries.map((c) => (
            <option key={c} value={c}>
              {`${flagOf(c)} ${c}`.trim()}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" checked={noBio} onChange={(e) => setNoBio(e.target.checked)} /> No Mode email in bio yet
        </label>
        <button className="chip" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>
      {error && <p className="text-pin">{error}</p>}
      {!items ? (
        <p className="text-ink-2">Loading…</p>
      ) : !list.length ? (
        <p className="border border-line bg-white px-6 py-10 text-center text-ink-2">
          {items.length ? "No signed creators match." : "No signed creators yet. A creator joins this list when their lead is marked Signed."}
        </p>
      ) : (
        <ul className="border border-line bg-white">
          <li className="hidden grid-cols-[40px_minmax(0,1.3fr)_minmax(0,1.3fr)_64px_130px_minmax(0,1fr)_100px_100px] gap-x-4 border-b border-line px-6 py-2 font-mono text-[11px] uppercase tracking-wider text-muted lg:grid">
            <span />
            <span>Name</span>
            <span>Main channel</span>
            <span className="text-right">Followers</span>
            <span>Contract</span>
            <span>Location</span>
            <span>Signed</span>
            <span>Renews</span>
          </li>
          {list.map((s) => (
            <li key={s.contract.reference} className="border-b border-line last:border-b-0">
              <Row s={s} side={side} isOpen={open === s.contract.reference} onToggle={() => setOpen(open === s.contract.reference ? "" : s.contract.reference)} />
              {open === s.contract.reference && <Profile s={s} side={side} onSave={(patch) => save(s.contract.reference, patch)} />}
            </li>
          ))}
        </ul>
      )}
      <p className="font-mono text-[11px] text-muted">
        {list.length} of {items?.length ?? 0} signed {side === "tech" ? "Tech creators" : "creators"}
      </p>
    </div>
  );
}

/** One signed creator in the list. */
function Row({ s, side, isOpen, onToggle }: { s: SignedCreator; side: Side; isOpen: boolean; onToggle: () => void }) {
  const c = s.application?.creator;
  const renewal = nextRenewal(s.contract);
  return (
    <div
      onClick={(ev) => !(ev.target as Element).closest("a") && onToggle()}
      className="grid cursor-pointer grid-cols-[40px_1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-paper-2/50 md:px-6 lg:grid-cols-[40px_minmax(0,1.3fr)_minmax(0,1.3fr)_64px_130px_minmax(0,1fr)_100px_100px]"
    >
      <span className="h-10 w-10 overflow-hidden rounded-full bg-paper-2">
        {c?.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/admin/enquiries/file/${c.photo}?side=${side}&size=thumb`} alt="" loading="lazy" className="h-full w-full object-cover" />
        )}
      </span>
      <span className="min-w-0">
        <button type="button" aria-expanded={isOpen} className="block max-w-full truncate text-left text-[15px] text-ink hover:underline" onClick={(ev) => (ev.stopPropagation(), onToggle())}>
          {nameOf(s)}
        </button>
        {!s.contract.modeEmailInBio && <span className="block text-[11px] text-pin">No Mode email in bio</span>}
        <span className="block truncate text-[12px] text-muted lg:hidden">
          {[c?.platform, c && formatCount(c.followers), contractLabel(s), c && placeOf(c), renewal && `renews ${showDate(renewal)}`].filter((x) => x && x !== "—").join(" · ")}
        </span>
      </span>
      <span className="hidden min-w-0 truncate text-[14px] lg:block">
        {c?.channelUrl ? (
          <a href={c.channelUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" title={`Open ${c.platform} in a new tab`}>
            <span className="text-muted">{c.platform}</span> {c.channel.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "")} ↗
          </a>
        ) : (
          <span className="text-ink-2">{[c?.platform, c?.channel].filter(Boolean).join(" ") || "—"}</span>
        )}
      </span>
      <span className="hidden text-right font-mono text-[13px] tabular-nums text-ink lg:block">{formatCount(c?.followers ?? null)}</span>
      <span className="hidden lg:block">
        <span className={`rounded-full px-2 py-0.5 text-[11px] ${s.contract.type === "Exclusive" ? "bg-ink text-paper" : s.contract.type ? "border border-line text-ink-2" : "bg-[#f3e3c3] text-[#6b4a12]"}`}>{contractLabel(s)}</span>
      </span>
      <span className="hidden min-w-0 truncate text-[13px] text-ink-2 lg:block">{c ? placeOf(c) : "—"}</span>
      <span className="hidden font-mono text-[12px] text-ink-2 lg:block">{showDate(s.contract.signedAt)}</span>
      <span className="font-mono text-[12px] text-ink-2 max-lg:hidden">{showDate(renewal)}</span>
    </div>
  );
}

/** The profile's sections, by the application's Sheet columns; anything else goes under "More". */
const SECTIONS: [string, string[]][] = [
  ["Contact", ["Full Name", "Creator Name", "Mobile", "Date of Birth", "Guardian"]],
  ["Location and postal address", ["Based", "Country", "State / Region", "UAE Permit", "Postal Address"]],
  [
    "Socials",
    ["Main Platform", "Main Channel", "Main Followers", "Average views per post", "Average live viewers (if streaming)", "Other Platforms", "Audience Top Country", "Audience 18+", "Media Kit"],
  ],
  ["Work", ["Niche", "Work Open To", "Games", "Setup", "Past Collaborations", "Agency", "Tags"]],
];
const HIDDEN = new Set(["Profile Photo", "Profile Photo (Round)", "Photos", "Status"]);

/** One label and value. */
function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className={value.length > 80 || value.includes("\n") ? "sm:col-span-2" : ""}>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-ink">
        {label.startsWith("Channels") || label === "Other Platforms" ? <Channels text={value} /> : <Linkified text={value} />}
      </dd>
    </div>
  );
}

/**
 * A signed creator's profile: their application (read from its Sheet row by reference) in sections,
 * their photos, and the contract beside it (type, commission, signed date, renewal, opt-out window, links).
 */
function Profile({ s, side, onSave }: { s: SignedCreator; side: Side; onSave: (patch: SignedPatch) => Promise<void> }) {
  const a = s.application;
  const k = s.contract;
  const renewal = nextRenewal(k);
  const optOut = renewal ? optOutWindow(renewal) : null;
  const fields = (a?.fields || []).filter((f) => !HIDDEN.has(f.label));
  const by = new Map(fields.map((f) => [f.label, f.value]));
  const placed = new Set(SECTIONS.flatMap(([, labels]) => labels));
  const more = fields.filter((f) => !placed.has(f.label));
  return (
    <div className="grid gap-8 border-t border-line bg-paper-2/30 px-4 py-6 md:px-6 lg:grid-cols-[1fr_300px]">
      <div className="grid gap-8">
        {!a && <p className="text-pin">The application ({k.reference}) is no longer in the Sheet, so only the contract is shown.</p>}
        {a && a.files.length > 0 && (
          <section>
            <p className="eyebrow mb-3">Photos ({a.files.length})</p>
            <LeadImages ids={a.files} label="Photo" side={side} />
          </section>
        )}
        {a &&
          [...SECTIONS.map(([title, labels]) => [title, labels.filter((l) => by.get(l)).map((l) => ({ label: l, value: by.get(l)! }))] as const), ["More", more] as const]
            .filter(([, items]) => items.length)
            .map(([title, items]) => (
              <section key={title}>
                <h3 className="mb-3 font-display text-xl">{title}</h3>
                <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {title === "Contact" && a.email && <Item label="Email" value={a.email} />}
                  {items.map((f) => (
                    <Item key={f.label} label={f.label} value={f.value} />
                  ))}
                </dl>
              </section>
            ))}
      </div>
      <aside className="grid content-start gap-4 text-sm">
        <h3 className="font-display text-xl">Contract</h3>
        <dl className="grid gap-3">
          <div>
            <dt className="eyebrow">Type</dt>
            <dd className="text-[15px]">{k.type ? `${k.type}${k.commission ? `, ${k.commission} commission` : ""}` : "Not set yet"}</dd>
          </div>
          <div>
            <dt className="eyebrow">Signed</dt>
            <dd className="text-[15px]">{showDate(k.signedAt)}</dd>
          </div>
          <div>
            <dt className="eyebrow">Renews</dt>
            <dd className="text-[15px]">{k.type === "Exclusive" ? showDate(renewal) : "Doesn't renew (non-exclusive)"}</dd>
          </div>
          {optOut && (
            <div>
              <dt className="eyebrow">Opt-out window</dt>
              <dd className="text-[15px]">
                {showDate(optOut[0])} to {showDate(optOut[1])}
              </dd>
            </div>
          )}
        </dl>
        <ContractEdit contract={k} onSave={onSave} />
        <PaymentBox reference={k.reference} side={side} hasDoc={Boolean(k.pandadocId)} />
        <ModeEmail contract={k} side={side} onSave={onSave} />
        {k.contractLink ? (
          <a href={k.contractLink} target="_blank" rel="noreferrer" className="link-underline w-fit text-ink-2">
            Signed contract in Drive ↗
          </a>
        ) : (
          <p className="text-muted">The signed contract is linked here once it&apos;s saved to Drive.</p>
        )}
        {a?.folderUrl && (
          <a href={a.folderUrl} target="_blank" rel="noreferrer" className="link-underline w-fit text-ink-2">
            Application folder in Drive ↗
          </a>
        )}
        <p className="font-mono text-[11px] text-muted">
          Ref {k.reference}
          {k.updatedBy ? ` · updated by ${k.updatedBy}` : ""}
        </p>
      </aside>
    </div>
  );
}

/**
 * Asha's "Put mode in bio" (16 Nov 2026): a tick an admin sets after checking the creator's bios,
 * and, for an exclusive creator, their dedicated Mode email address.
 */
function ModeEmail({ contract: k, side, onSave }: { contract: Contract; side: Side; onSave: (patch: SignedPatch) => Promise<void> }) {
  const domain = side === "tech" ? "modesocietytech.com" : "modesociety.com.au";
  const [email, setEmail] = useState(k.dedicatedEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = async (patch: SignedPatch) => {
    setBusy(true);
    setError("");
    try {
      await onSave(patch);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid gap-3 border-y border-line py-4">
      <label className="flex items-start gap-2 text-[15px]">
        <input type="checkbox" className="mt-1" checked={k.modeEmailInBio} disabled={busy} onChange={(e) => run({ modeEmailInBio: e.target.checked })} />
        <span>
          Mode email in bio
          <span className="block text-[12px] text-muted">Tick once you&apos;ve checked their bios show their Mode email.</span>
        </span>
      </label>
      {k.type === "Exclusive" && (
        <form
          className="grid gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            run({ dedicatedEmail: email.trim() });
          }}
        >
          <span className="eyebrow">Dedicated email</span>
          <div className="flex gap-2">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={`name@${domain}`} aria-label="Dedicated email" className="min-w-0 flex-1 border border-line bg-white px-3 py-2" />
            <button className="chip" disabled={busy || email.trim() === k.dedicatedEmail}>
              Save
            </button>
          </div>
        </form>
      )}
      {error && <p className="text-pin">{error}</p>}
    </div>
  );
}

/**
 * Corrects the contract type or the signed date: for a creator from before 16 Nov 2026 (whose
 * application had no representation), or when they were marked Signed later than they signed.
 * Opens by itself while the type is still missing.
 */
function ContractEdit({ contract: k, onSave }: { contract: Contract; onSave: (patch: SignedPatch) => Promise<void> }) {
  const [editing, setEditing] = useState(!k.type);
  const [type, setType] = useState(k.type);
  const [signed, setSigned] = useState(localDate(k.signedAt));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!editing) {
    return (
      <button type="button" className="w-fit text-ink-2 underline underline-offset-4" onClick={() => setEditing(true)}>
        Correct the contract type or signed date
      </button>
    );
  }
  return (
    <form
      className="grid gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const patch: SignedPatch = {};
        if (type !== k.type) patch.type = type;
        if (signed !== localDate(k.signedAt)) patch.signedAt = signed;
        if (!Object.keys(patch).length) return setEditing(false);
        setBusy(true);
        setError("");
        try {
          await onSave(patch);
          setEditing(false);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="grid gap-1">
        <span className="eyebrow">Contract</span>
        <select value={type} onChange={(e) => setType(e.target.value)} className="border border-line bg-white px-3 py-2" required>
          <option value="">Choose…</option>
          {CONTRACT_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        <span className="eyebrow">Signed on</span>
        <input type="date" value={signed} max={localDate(new Date())} onChange={(e) => setSigned(e.target.value)} className="border border-line bg-white px-3 py-2" required />
      </label>
      <div className="flex gap-2">
        <button className="chip" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
        {k.type && (
          <button type="button" className="text-ink-2 underline underline-offset-4" onClick={() => setEditing(false)}>
            Cancel
          </button>
        )}
      </div>
      {error && <p className="text-pin">{error}</p>}
    </form>
  );
}

/**
 * Payment details (SP-122), read from the signed contract in PandaDoc each time: masked, with Reveal
 * (logged with the admin's email and the time) showing them in full in this view only.
 */
function PaymentBox({ reference, side, hasDoc }: { reference: string; side: Side; hasDoc: boolean }) {
  const [view, setView] = useState<PaymentView | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!hasDoc) return;
    let live = true;
    fetch(`/api/admin/signed/payment?side=${side}&reference=${encodeURIComponent(reference)}`)
      .then((r) => r.json())
      .then((d) => live && (d.ok ? setView(d.payment) : setError(d.error)))
      .catch((err) => live && setError((err as Error).message));
    return () => {
      live = false;
    };
  }, [reference, side, hasDoc]);
  const reveal = async () => {
    setBusy(true);
    setError("");
    try {
      const d = await postJson<{ payment: PaymentView }>("/api/admin/signed/payment", { side, reference });
      setView(d.payment);
      setRevealed(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid gap-2 border-y border-line py-4">
      <span className="eyebrow">Payment details</span>
      {!hasDoc ? (
        <p className="text-muted">They signed before contracts went through the website: their payment details are in their signed contract.</p>
      ) : error ? (
        <p className="text-pin">{error}</p>
      ) : !view ? (
        <p className="text-muted">Reading the signed contract…</p>
      ) : (
        <>
          <dl className="grid gap-1.5 text-[14px]">
            {(
              [
                ["Method", view.method],
                ["ABN", view.abn || (view.part === "A" ? "None" : "")],
                ["GST registered", view.gst],
                ...view.rows,
              ] as [string, string][]
            )
              .filter(([, v]) => v)
              .map(([l, v]) => (
                <div key={l} className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="text-muted">{l}</dt>
                  <dd className="break-all font-mono text-[13px] text-ink">{v}</dd>
                </div>
              ))}
          </dl>
          {view.notes.map((n) => (
            <p key={n} className="text-[13px] text-pin">
              {n}
            </p>
          ))}
          {!revealed && (
            <button type="button" className="chip w-fit" disabled={busy} onClick={reveal}>
              {busy ? "Revealing…" : "Reveal"}
            </button>
          )}
          <p className="text-[11px] text-muted">{revealed ? "Shown in full in this view only; the reveal was logged." : "Reveal is logged with your email and the time."}</p>
        </>
      )}
    </div>
  );
}
