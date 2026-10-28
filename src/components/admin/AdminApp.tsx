"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { encodeFile, postJson } from "@/lib/upload";
import CopyTab from "./CopyTab";
import EnquiriesTab from "./EnquiriesTab";
import PressTab from "./PressTab";
import RosterTab from "./RosterTab";
import type { SideFilter } from "@/lib/side";
import InsightsTab from "./InsightsTab";
import ScheduleTab from "./ScheduleTab";
import {
  CTA_STYLES,
  FOOTER_STYLES,
  HERO_MODES,
  INTRO_STYLES,
  SLOTS,
  type SiteContent,
  type SiteImage,
  type SiteSettings,
  type SlotDef,
} from "@/lib/slots";

type Me = {
  session: { email: string; name: string; picture: string } | null;
  owner?: string;
  backendOwner?: string;
  admins?: string[];
  backendConfigured?: boolean;
  backendError?: string;
  info?: { spreadsheetUrl: string; folderUrl: string; imagesFolderUrl: string; talentFolderUrl: string } | null;
};

type GoogleId = {
  accounts: {
    id: {
      initialize: (o: { client_id: string; callback: (r: { credential: string }) => void; auto_select?: boolean }) => void;
      renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
      disableAutoSelect: () => void;
    };
  };
};

export default function AdminApp({ clientId, devBypass }: { clientId: string; devBypass: boolean }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loginError, setLoginError] = useState("");
  const [gsiReady, setGsiReady] = useState(false);
  const btn = useRef<HTMLDivElement>(null);

  const loadMe = useCallback(async () => {
    const r = await fetch("/api/admin/me", { cache: "no-store" });
    setMe(await r.json());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    const g = (window as unknown as { google?: GoogleId }).google;
    if (!gsiReady || !g || !clientId || !btn.current || me?.session) return;
    g.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        setLoginError("");
        try {
          await postJson("/api/auth/google", { credential });
          await loadMe();
        } catch (err) {
          setLoginError((err as Error).message);
        }
      },
    });
    g.accounts.id.renderButton(btn.current, { theme: "filled_black", size: "large", shape: "pill", text: "signin_with", width: 280 });
  }, [gsiReady, clientId, me, loadMe]);

  const logout = async () => {
    await postJson("/api/auth/logout", {});
    (window as unknown as { google?: GoogleId }).google?.accounts.id.disableAutoSelect();
    setMe({ session: null });
  };

  if (!me) return <Centered>Loading…</Centered>;

  if (!me.session) {
    return (
      <Centered>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setGsiReady(true)} />
        <p className="eyebrow">Mode Society</p>
        <h1 className="font-display mt-3 text-4xl">Admin</h1>
        <p className="mt-4 max-w-sm text-ink-2">Sign in with an approved Google account to manage the website&apos;s images and animations.</p>
        <div className="mt-8 flex min-h-[44px] justify-center" ref={btn} />
        {!clientId && <p className="mt-4 text-sm text-pin">NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. See README → Keys.</p>}
        {devBypass && (
          <button
            className="btn ghost mt-6"
            onClick={async () => {
              await postJson("/api/auth/dev", {});
              await loadMe();
            }}
          >
            Dev sign-in (local only)
          </button>
        )}
        {loginError && <p className="mt-4 max-w-sm text-sm text-pin">{loginError}</p>}
      </Centered>
    );
  }

  return <Dashboard me={me} reloadMe={loadMe} onLogout={logout} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-screen place-items-center px-6 text-center"><div>{children}</div></div>;
}

// ---------------------------------------------------------------------------

type Tab = "schedule" | "enquiries" | "insights" | "copy" | "press" | "images" | "roster" | "animations" | "access";
type Group = "Day to day" | "Website" | "Team";

/** Which tabs each side uses: the roster is Tech only, Featured in and the animations are the talent site's. */
const TABS: { id: Tab; label: string; group: Group; sides: SideFilter[]; about: string }[] = [
  { id: "schedule", label: "Schedule", group: "Day to day", sides: ["all", "talent", "tech"], about: "The team calendar: calls, meetings, shoots, events and deadlines." },
  { id: "enquiries", label: "Enquiries", group: "Day to day", sides: ["all", "talent", "tech"], about: "Every form sent from the website, newest first. Each one is also emailed to pr@modesociety.com.au." },
  { id: "insights", label: "Insights", group: "Day to day", sides: ["all", "talent", "tech"], about: "Who's visiting the site, where from, and how many enquiries it brings in." },
  { id: "copy", label: "Pages & text", group: "Website", sides: ["all", "talent", "tech"], about: "Change, delete or hide the wording of any section, page by page." },
  { id: "press", label: "Featured in", group: "Website", sides: ["all", "talent"], about: "Press features: a photo, a teaser for the home page and the full article on its own page." },
  { id: "images", label: "Images & video", group: "Website", sides: ["all", "talent", "tech"], about: "Every photo, logo and video on the site, and the Drive folder each one reads from." },
  { id: "roster", label: "Roster", group: "Website", sides: ["all", "tech"], about: "The creators on ModeSociety Tech, with their channels and follower counts." },
  { id: "animations", label: "Animations", group: "Website", sides: ["all", "talent"], about: "How the home page hero, the intro and the footer logo move." },
  { id: "access", label: "Access", group: "Team", sides: ["all", "talent", "tech"], about: "The Google accounts that can sign in to this panel." },
];
const SIDE_KEY = "ms-admin-side";

/** All · Talent · Tech: everyone sees everything, but each team can narrow the panel to its side. */
function SidePicker({ side, onChange }: { side: SideFilter; onChange: (s: SideFilter) => void }) {
  const opts: { id: SideFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "talent", label: "Talent" },
    { id: "tech", label: "Tech" },
  ];
  return (
    <div className="flex rounded-full border border-line p-1 font-mono text-[11px] uppercase tracking-[0.06em]" role="group" aria-label="Show which side of Mode Society">
      {opts.map((o) => (
        <button
          key={o.id}
          aria-pressed={side === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full px-3 py-1.5 transition-colors ${
            side === o.id ? (o.id === "tech" ? "bg-[#3e5ef1] text-white" : "bg-ink text-white") : "text-ink-2 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Dashboard({ me, reloadMe, onLogout }: { me: Me; reloadMe: () => Promise<void>; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("schedule");
  const [side, setSideState] = useState<SideFilter>("all");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore this admin's last choice
      if (saved === "talent" || saved === "tech" || saved === "all") setSideState(saved);
    } catch {
      /* storage blocked */
    }
  }, []);
  const setSide = (s: SideFilter) => {
    setSideState(s);
    try {
      localStorage.setItem(SIDE_KEY, s);
    } catch {
      /* storage blocked */
    }
    if (!TABS.find((t) => t.id === tab)?.sides.includes(s)) setTab("schedule");
  };
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState("");

  const loadContent = useCallback(async () => {
    setLoadError("");
    try {
      const r = await fetch("/api/admin/content", { cache: "no-store" });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      setContent(d.content);
    } catch (err) {
      setLoadError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    if (me.backendConfigured) loadContent();
  }, [me.backendConfigured, loadContent]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="wrap flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-display text-sm">MODE SOCIETY</span>
            <span className="eyebrow hidden sm:inline">Admin</span>
            <SidePicker side={side} onChange={setSide} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <a href="/" target="_blank" className="link-underline hidden sm:inline">View site ↗</a>
            <span className="hidden text-muted md:inline">{me.session!.email}</span>
            <button onClick={onLogout} className="btn ghost !px-4 !py-2">Sign out</button>
          </div>
        </div>
        <nav className="wrap flex gap-8 overflow-x-auto" aria-label="Admin sections">
          {(["Day to day", "Website", "Team"] as Group[]).map((g) => (
            <div key={g} className="shrink-0">
              <p className="hidden pb-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted/70 md:block">{g}</p>
              <div className="flex gap-5">
                {TABS.filter((t) => t.group === g && t.sides.includes(side)).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    aria-current={tab === t.id ? "page" : undefined}
                    className={`whitespace-nowrap border-b-2 pb-3 text-[14px] ${tab === t.id ? "border-ink font-medium text-ink" : "border-transparent text-muted hover:text-ink"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </header>

      <div className="wrap mt-8">
        {!me.backendConfigured && (
          <Notice>
            The Google Drive backend isn&apos;t connected yet. Set <code>APPS_SCRIPT_URL</code> and <code>APPS_SCRIPT_SECRET</code> (see README → Backend setup).
            The site is currently showing its built-in default images.
          </Notice>
        )}
        {(me.backendError || loadError) && <Notice>Couldn&apos;t reach Google Drive: {me.backendError || loadError}</Notice>}
        {me.info && (
          <div className="mb-8 flex flex-wrap gap-2 text-sm">
            <a className="chip" href={me.info.spreadsheetUrl} target="_blank" rel="noreferrer">▦ Open Google Sheet</a>
            <a className="chip" href={me.info.folderUrl} target="_blank" rel="noreferrer">▤ Website folder</a>
            {side !== "tech" && <a className="chip" href={me.info.talentFolderUrl} target="_blank" rel="noreferrer">▤ Talent applications</a>}
          </div>
        )}

        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl">{TABS.find((t) => t.id === tab)?.label}</h1>
          <p className="mt-2 max-w-2xl text-ink-2">{TABS.find((t) => t.id === tab)?.about}</p>
        </div>

        {tab === "schedule" && (
          <ScheduleTab
            me={me.session!.email}
            team={[...new Set([me.owner, me.backendOwner, ...(me.admins || [])].filter((e): e is string => Boolean(e)))]}
            disabled={!me.backendConfigured}
            notify={notify}
            side={side}
          />
        )}
        {tab === "enquiries" && <EnquiriesTab key={side} side={side} disabled={!me.backendConfigured} sheetUrl={me.info?.spreadsheetUrl} notify={notify} />}
        {tab === "insights" && <InsightsTab side={side} disabled={!me.backendConfigured} />}
        {tab === "images" && content && <ImagesTab side={side} content={content} reload={loadContent} notify={notify} />}
        {tab === "copy" && content && <CopyTab content={content} side={side} reload={loadContent} notify={notify} />}
        {tab === "copy" && !content && me.backendConfigured && !loadError && <p className="text-muted">Loading the site&apos;s wording…</p>}
        {tab === "press" && <PressTab disabled={!me.backendConfigured} notify={notify} />}
        {tab === "roster" && <RosterTab disabled={!me.backendConfigured} techStats={content?.techStats} notify={notify} />}
        {tab === "images" && !content && me.backendConfigured && !loadError && <p className="text-muted">Loading images…</p>}
        {tab === "animations" && (
          <AnimationsTab key={JSON.stringify(content?.settings ?? null)} settings={content?.settings} disabled={!content} reload={loadContent} notify={notify} />
        )}
        {tab === "access" && <AccessTab me={me} reload={reloadMe} notify={notify} />}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm text-paper shadow-lg">{toast}</div>
      )}
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="mb-6 border-l-2 border-pin bg-paper-2 p-4 text-sm text-ink-2">{children}</div>;
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

function ImagesTab({ content, reload, notify, side }: { content: SiteContent; reload: () => Promise<void>; notify: (m: string) => void; side: SideFilter }) {
  const slots = SLOTS.filter((s) => !s.hidden && (side === "all" || (s.side ?? "talent") === side));
  const pages = Array.from(new Set(slots.map((s) => s.page)));
  return (
    <div className="grid gap-14">
      <p className="max-w-2xl text-ink-2">
        Every image on the site lives here. Uploads go straight into the <em>Website Images</em> folder in Google Drive and appear on the
        site within a few seconds. Anything marked <span className="chip !px-2 !py-0.5 !text-xs">default</span> is a built-in placeholder.
      </p>
      {pages.map((page) => (
        <section key={page}>
          <h2 className="eyebrow mb-4 border-b border-line pb-3">{page}</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {slots.filter((s) => s.page === page).map((slot) => (
              <SlotEditor key={slot.id} slot={slot} images={content.images[slot.id] || []} reload={reload} notify={notify} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

type Item = { fileId: string; alt: string; src: string };

function SlotEditor({ slot, images, reload, notify }: { slot: SlotDef; images: SiteImage[]; reload: () => Promise<void>; notify: (m: string) => void }) {
  const uploaded: Item[] = images.filter((i) => i.source === "upload" && i.fileId).map((i) => ({ fileId: i.fileId!, alt: i.alt, src: i.src }));
  // additive slots (brand logos): uploads join the built-in / Drive images, which stay listed read-only
  const additive = Boolean(slot.additive);
  const base = images.filter((i) => i.source !== "upload");
  const usingDefaults = !additive && uploaded.length === 0;
  const fromFolder = (additive || usingDefaults) && images.some((i) => i.source === "folder");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const max = slot.kind === "single" ? 1 : (slot.max ?? 20);

  const save = async (items: Item[], msg: string) => {
    setBusy("Saving…");
    setError("");
    try {
      await postJson("/api/admin/images/slot", { slot: slot.id, items: items.map(({ fileId, alt }) => ({ fileId, alt })) });
      await reload();
      notify(msg);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy("");
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const room = slot.kind === "single" ? 1 : max - uploaded.length;
    const list = Array.from(files).slice(0, Math.max(room, 0));
    if (!list.length) {
      setError(`This slot holds at most ${max} images. Remove one first.`);
      return;
    }
    const added: Item[] = [];
    try {
      for (const [n, file] of list.entries()) {
        setBusy(`Uploading ${n + 1} of ${list.length}…`);
        const enc = await encodeFile(file, 2400, 0.86, { knockout: slot.knockout });
        const { fileId } = await postJson<{ fileId: string }>("/api/admin/images/upload", {
          slot: slot.id,
          filename: enc.filename,
          mimeType: enc.mimeType,
          data: enc.data,
        });
        added.push({ fileId, alt: slot.defaults[0]?.alt || slot.label, src: enc.previewUrl });
      }
      const next = slot.kind === "single" ? added.slice(0, 1) : [...uploaded, ...added];
      await save(next, `${slot.label}: ${added.length} image${added.length > 1 ? "s" : ""} added`);
    } catch (err) {
      setError((err as Error).message);
      setBusy("");
    } finally {
      if (input.current) input.current.value = "";
    }
  };

  const move = (i: number, d: number) => {
    const next = [...uploaded];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    save(next, "Order updated");
  };

  // with no uploads, show what the site is actually using: the Drive folder's files or the built-in defaults
  const shown: (Item & { type?: string })[] = usingDefaults ? images.map((d) => ({ ...d, fileId: "" })) : uploaded;

  return (
    <div className="border border-line bg-paper-2/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium">{slot.label}</h3>
          <p className="mt-1 text-sm text-muted">{slot.hint}</p>
        </div>
        {usingDefaults && shown.length > 0 && (
          <span className="chip shrink-0 !px-2 !py-0.5 !text-xs">{fromFolder ? "from Drive" : "default"}</span>
        )}
      </div>
      {slot.folder && (
        <p className="mt-2 text-xs text-ink-2">
          Drive folder: <strong>{slot.folder}</strong>
          {additive
            ? " (its files show alongside the logos added here)"
            : usingDefaults
              ? " (files added there appear automatically)"
              : " (uploads below take priority over it)"}
        </p>
      )}

      <div className={`mt-4 grid gap-3 ${slot.kind === "single" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3 sm:grid-cols-4"}`}>
        {shown.map((img, i) => (
          <figure key={`${img.src}-${i}`} className="group relative">
            <div className="aspect-[4/5] overflow-hidden bg-paper-2">
              {img.type === "video" ? (
                <video src={img.src} muted loop autoPlay playsInline className="h-full w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.src}
                  alt={img.alt}
                  className={`h-full w-full ${slot.accept === "svg" || slot.knockout ? "object-contain p-2" : "object-cover"} ${usingDefaults && !fromFolder ? "opacity-60" : ""}`}
                />
              )}
            </div>
            {!usingDefaults && (
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-muted">{slot.kind === "collection" ? `#${i + 1}` : ""}</span>
                <span className="flex gap-2">
                  {slot.kind === "collection" && (
                    <>
                      <button disabled={!!busy || i === 0} onClick={() => move(i, -1)} aria-label="Move earlier" className="disabled:opacity-30">←</button>
                      <button disabled={!!busy || i === uploaded.length - 1} onClick={() => move(i, 1)} aria-label="Move later" className="disabled:opacity-30">→</button>
                    </>
                  )}
                  <AltButton
                    alt={img.alt}
                    onSave={(alt) => save(uploaded.map((u, k) => (k === i ? { ...u, alt } : u)), "Description saved")}
                  />
                  <button
                    disabled={!!busy}
                    onClick={() => save(uploaded.filter((_, k) => k !== i), "Image removed")}
                    className="text-pin"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </span>
              </div>
            )}
          </figure>
        ))}
        {shown.length === 0 && (
          <p className="col-span-full text-sm text-muted">{additive ? "Nothing added yet." : "Empty — nothing is shown here yet."}</p>
        )}
      </div>

      {additive && base.length > 0 && (
        <div className="mt-5">
          <p className="text-xs text-ink-2">Also shown ({fromFolder ? "from Drive" : "built in"}):</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {base.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={`${img.src}-${i}`} src={img.src} alt={img.alt} className="h-10 w-20 bg-white object-contain p-1 opacity-70" />
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className="btn !py-3" disabled={!!busy} onClick={() => input.current?.click()}>
          {additive
            ? "Add logos"
            : slot.kind === "single"
            ? usingDefaults
              ? `Upload ${slot.accept === "svg" ? "SVG" : "image"}`
              : "Replace"
            : usingDefaults
              ? `Upload images (replaces ${fromFolder ? "the Drive folder" : "defaults"})`
              : "Add images"}
        </button>
        {!usingDefaults && uploaded.length > 0 && (
          <button className="text-sm text-muted underline underline-offset-4" disabled={!!busy} onClick={() => save([], "Uploads cleared")}>
            {additive
              ? "Remove all added"
              : slot.folder
                ? "Clear uploads (use the Drive folder)"
                : slot.defaults.length
                  ? "Revert to default"
                  : "Clear"}
          </button>
        )}
        {busy && <span className="text-sm text-muted">{busy}</span>}
      </div>
      {(slot.accept === "media" || slot.accept === "video") && (
        <p className="mt-3 text-xs text-muted">Videos are too large to upload here. Add them to the Drive folder above instead.</p>
      )}
      {error && <p className="mt-3 text-sm text-pin">{error}</p>}
      <input
        ref={input}
        type="file"
        accept={slot.accept === "svg" ? ".svg,image/svg+xml" : "image/*"}
        multiple={slot.kind === "collection"}
        hidden
        onChange={(e) => upload(e.target.files)}
      />
    </div>
  );
}

function AltButton({ alt, onSave }: { alt: string; onSave: (alt: string) => void }) {
  return (
    <button
      title="Edit description (used by screen readers and Google)"
      onClick={() => {
        const next = window.prompt("Describe this image (for accessibility & SEO):", alt);
        if (next !== null && next !== alt) onSave(next.slice(0, 200));
      }}
    >
      Aa
    </button>
  );
}

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------

const PREVIEW: Record<string, string> = {
  pinboard: "animate-[swing_2.4s_ease-in-out_infinite] origin-top",
  scatter: "animate-[drift_4s_ease-in-out_infinite]",
  orbit: "animate-[spin3d_5s_linear_infinite]",
  gravity: "animate-[drop_1.8s_cubic-bezier(.5,0,.75,0)_infinite]",
};

function AnimationsTab({
  settings,
  disabled,
  reload,
  notify,
}: {
  settings?: SiteSettings;
  disabled: boolean;
  reload: () => Promise<void>;
  notify: (m: string) => void;
}) {
  const [draft, setDraft] = useState<SiteSettings | null>(settings ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!draft) return <p className="text-muted">{disabled ? "Connect the backend to change animations." : "Loading…"}</p>;
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await postJson("/api/admin/settings", {
        values: { ...draft, heroAutoCycle: String(draft.heroAutoCycle) },
      });
      await reload();
      notify("Animations updated. Refresh the site to see them.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-12">
      <style>{`
        @keyframes swing { 0%,100% { transform: rotate(-6deg) } 50% { transform: rotate(6deg) } }
        @keyframes drift { 0%,100% { transform: translate(-6px,4px) rotate(-3deg) } 50% { transform: translate(6px,-4px) rotate(3deg) } }
        @keyframes spin3d { from { transform: perspective(300px) rotateY(0) } to { transform: perspective(300px) rotateY(360deg) } }
        @keyframes drop { 0% { transform: translateY(-40px) rotate(-20deg); opacity: 0 } 30% { opacity: 1 } 100% { transform: translateY(18px) rotate(8deg) } }
      `}</style>

      <section>
        <h2 className="eyebrow mb-2">Homepage hero</h2>
        <p className="mb-5 max-w-2xl text-sm text-ink-2">
          Choose the interactive mode visitors see. Visitors can play with it but can’t switch to a different mode.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HERO_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setDraft({ ...draft, heroMode: m.id })}
              className={`border p-5 text-left transition ${draft.heroMode === m.id ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}
            >
              <div className="mb-5 grid h-24 place-items-center overflow-hidden">
                <div className={`h-16 w-12 bg-white p-1 pb-3 shadow-md ${PREVIEW[m.id]}`}>
                  <div className="h-full w-full bg-[#c9bfae]" />
                </div>
              </div>
              <h3 className="font-medium">{m.label}</h3>
              <p className={`mt-1 text-sm ${draft.heroMode === m.id ? "text-paper/70" : "text-muted"}`}>{m.description}</p>
            </button>
          ))}
        </div>
        <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={draft.heroAutoCycle}
            onChange={(e) => setDraft({ ...draft, heroAutoCycle: e.target.checked })}
            className="h-4 w-4 accent-[var(--ink)]"
          />
          Rotate: show a random mode on each visit (overrides the choice above)
        </label>
      </section>

      <OptionGroup
        title="Page intro"
        hint="Plays once per visit when someone first lands on the site."
        options={INTRO_STYLES}
        value={draft.introStyle}
        onChange={(v) => setDraft({ ...draft, introStyle: v })}
      />
      <OptionGroup
        title="For brands / For talent section"
        hint="The two-way call to action near the bottom of the homepage and on the contact page. Uses the Contact card images."
        options={CTA_STYLES}
        value={draft.ctaStyle}
        onChange={(v) => setDraft({ ...draft, ctaStyle: v })}
      />
      <OptionGroup
        title="Footer wordmark"
        hint="How the logo at the bottom of every page reacts to the mouse."
        options={FOOTER_STYLES}
        value={draft.footerStyle}
        onChange={(v) => setDraft({ ...draft, footerStyle: v })}
      />

      <div className="sticky bottom-0 z-20 -mx-[var(--gutter)] flex items-center gap-4 border-t border-line bg-paper/90 px-[var(--gutter)] py-4 backdrop-blur">
        <button className="btn" disabled={!dirty || saving} onClick={save}>
          {saving ? "Saving…" : "Save animation settings"}
        </button>
        {dirty && <span className="text-sm text-muted">Unsaved changes</span>}
        {error && <span className="text-sm text-pin">{error}</span>}
      </div>
    </div>
  );
}

function OptionGroup<T extends string>({
  title,
  hint,
  options,
  value,
  onChange,
}: {
  title: string;
  hint: string;
  options: { id: T; label: string; description: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <section>
      <h2 className="eyebrow mb-2">{title}</h2>
      <p className="mb-4 text-sm text-ink-2">{hint}</p>
      <div className="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`border p-4 text-left transition ${value === o.id ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}
          >
            <h3 className="font-medium">{o.label}</h3>
            <p className={`mt-1 text-sm ${value === o.id ? "text-paper/70" : "text-muted"}`}>{o.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Access
// ---------------------------------------------------------------------------

function AccessTab({ me, reload, notify }: { me: Me; reload: () => Promise<void>; notify: (m: string) => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const change = async (method: "POST" | "DELETE", target: string) => {
    setBusy(true);
    setError("");
    try {
      await postJson("/api/admin/admins", { email: target }, method);
      await reload();
      notify(method === "POST" ? `${target} can now sign in` : `${target} removed`);
      setEmail("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const permanent = [me.owner, me.backendOwner].filter((e, i, all): e is string => Boolean(e) && all.indexOf(e) === i);
  const others = (me.admins || []).filter((a) => !permanent.includes(a));

  return (
    <div className="max-w-2xl">
      <p className="text-ink-2">
        Only the Google accounts listed here can sign in to this admin panel. The list is stored in the <em>Admins</em> tab of the Google Sheet.
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {permanent.map((p) => (
          <li key={p} className="flex items-center justify-between py-4">
            <span>{p}</span>
            <span className="eyebrow">{p === me.owner ? "Site owner" : "Drive owner"} · permanent</span>
          </li>
        ))}
        {others.map((a) => (
          <li key={a} className="flex items-center justify-between py-4">
            <span>{a}</span>
            {a === me.session?.email ? (
              <span className="eyebrow">You</span>
            ) : (
              <button disabled={busy} onClick={() => change("DELETE", a)} className="text-sm text-pin underline underline-offset-4">
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      <form
        className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (email) change("POST", email.trim().toLowerCase());
        }}
      >
        <div className="field flex-1">
          <label>Add a Google account</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" />
        </div>
        <button className="btn" disabled={busy || !me.backendConfigured}>Grant access</button>
      </form>
      {!me.backendConfigured && <p className="mt-3 text-sm text-muted">Connect the backend to manage additional admins.</p>}
      {error && <p className="mt-3 text-sm text-pin">{error}</p>}
    </div>
  );
}
