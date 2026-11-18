"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { encodeFile, postJson } from "@/lib/upload";
import BuilderTab from "./BuilderTab";
import CopyTab from "./CopyTab";
import ApplicationsTab from "./ApplicationsTab";
import EmailsTab from "./EmailsTab";
import LeadsTab, { prefetchLeads } from "./LeadsTab";
import SignedTab from "./SignedTab";
import PressTab from "./PressTab";
import RosterTab from "./RosterTab";
import ThemeTab from "./ThemeTab";
import type { Side } from "@/lib/side";
import InsightsTab from "./InsightsTab";
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
  /** sides: what this admin may open (both, or Mode Society or Tech only) */
  session: { email: string; name: string; picture: string; sides: Side[] } | null;
  owner?: string;
  /** admins limited to one business: { email: "talent" | "tech" } */
  adminSides?: Record<string, string>;
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

  // the panel opens on Leads: start loading them now, not after the sign-in check
  useEffect(() => prefetchLeads(), []);

  const loadMe = useCallback(async () => {
    // (no cache option: a "no-cache" request header makes Next skip its kept copies; the route sends no-store)
    const r = await fetch("/api/admin/me");
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

type Tab = "leads" | "signed" | "insights" | "pages" | "copy" | "press" | "images" | "theme" | "roster" | "animations" | "applications" | "emails" | "access";
type Group = "Day to day" | "Website" | "Team";

/** Which tabs each side uses (the roster is Tech only, Featured in and the animations are the talent site's),
 * in order of importance: what the team uses most comes first. */
const TABS: { id: Tab; label: string; group: Group; sides: Side[]; about: string }[] = [
  { id: "leads", label: "Leads", group: "Day to day", sides: ["talent", "tech"], about: "Every form sent from the website, newest first. Each one is also emailed to the team." },
  { id: "signed", label: "Signed Talent", group: "Day to day", sides: ["talent", "tech"], about: "The creators who signed with this business, their contracts and renewal dates. A creator joins when they sign their contract (or their lead is marked Signed); add anyone who signed outside the website with + Add signed talent." },
  { id: "insights", label: "Insights", group: "Day to day", sides: ["talent", "tech"], about: "Who's visiting the site, where from, and how many leads it brings in." },
  { id: "copy", label: "Pages & text", group: "Website", sides: ["talent", "tech"], about: "Change, delete or hide the wording of any section, page by page." },
  { id: "applications", label: "Applications", group: "Website", sides: ["talent", "tech"], about: "Which countries creators can apply from, and the regions blocked within them." },
  { id: "images", label: "Images & video", group: "Website", sides: ["talent", "tech"], about: "Every photo, logo and video on the site, and the Drive folder each one reads from." },
  { id: "pages", label: "Pages", group: "Website", sides: ["talent", "tech"], about: "Lay out each page block by block: add, move, hide and restyle any block (colours, fonts, background, animation), check it in the preview, then publish." },
  { id: "press", label: "Featured in", group: "Website", sides: ["talent"], about: "Press features: a photo, a teaser for the home page and the full article on its own page." },
  { id: "roster", label: "Roster", group: "Website", sides: ["tech"], about: "The creators on ModeSociety Tech, with their channels and follower counts." },
  { id: "theme", label: "Colours & fonts", group: "Website", sides: ["talent", "tech"], about: "The brand colours and the fonts, for each side. Nothing changes until you save, and each one can go back to the original." },
  { id: "animations", label: "Animations", group: "Website", sides: ["talent"], about: "How the home page hero, the intro and the footer logo move." },
  { id: "emails", label: "Emails", group: "Team", sides: ["talent", "tech"], about: "Where this side's form emails go, and the address applicants reply to." },
  { id: "access", label: "Access", group: "Team", sides: ["talent", "tech"], about: "The Google accounts that can sign in to this panel." },
];
const SIDE_KEY = "ms-admin-side";
const MENU_KEY = "ms-admin-menu";
const LINKS_KEY = "ms-admin-links";
/** at this width and up the menu sits beside the page; below it, it covers the page */
const WIDE = "(min-width: 1024px)";

/** The open business's logo and name, so it is clear at a glance which one is being edited. */
function SideLogo({ side }: { side: Side }) {
  return side === "tech" ? (
    <span className="flex shrink-0 items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/tech/logom-gradient.png" alt="" className="h-7 w-auto" />
      <span className="hidden whitespace-nowrap text-[13px] font-extrabold uppercase tracking-[0.02em] sm:inline">
        ModeSociety <span className="text-[#3e5ef0]">Tech</span>
      </span>
    </span>
  ) : (
    <span className="flex shrink-0 items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo.svg" alt="" className="h-6 w-auto" />
      <span className="hidden font-display text-sm sm:inline">MODE SOCIETY</span>
    </span>
  );
}

/** The ☰ button: three bars that turn into × while the menu is open. */
function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      aria-controls="admin-menu"
      aria-label={open ? "Close menu" : "Open menu"}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line hover:border-ink"
    >
      <span className="relative block h-3 w-4" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`absolute left-0 h-[1.5px] w-4 bg-current transition-transform duration-300 ${
              i === 0 ? (open ? "top-[5px] rotate-45" : "top-0") : i === 1 ? `top-[5px] ${open ? "scale-x-0" : ""}` : open ? "top-[5px] -rotate-45" : "top-[10px]"
            }`}
          />
        ))}
      </span>
    </button>
  );
}

/**
 * Talent · Tech: the panel shows one business at a time, never both (the choice is remembered per
 * browser). An admin limited to one business only gets that one.
 */
function SidePicker({ side, allowed, onChange }: { side: Side; allowed: Side[]; onChange: (s: Side) => void }) {
  const opts = ([
    { id: "talent", label: "Talent" },
    { id: "tech", label: "Tech" },
  ] as { id: Side; label: string }[]).filter((o) => allowed.includes(o.id));
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
  const [tab, setTab] = useState<Tab>("leads");
  const allowed: Side[] = me.session?.sides?.length ? me.session.sides : ["talent", "tech"];
  const [chosen, setSideState] = useState<Side>("talent");
  // an admin limited to one business always sees that one
  const side: Side = allowed.includes(chosen) ? chosen : allowed[0];
  const full = allowed.length > 1;
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore this admin's last choice
      if (saved === "talent" || saved === "tech") setSideState(saved);
    } catch {
      /* storage blocked */
    }
  }, []);
  const setSide = (s: Side) => {
    setSideState(s);
    try {
      localStorage.setItem(SIDE_KEY, s);
    } catch {
      /* storage blocked */
    }
    if (!TABS.find((t) => t.id === tab)?.sides.includes(s)) setTab("leads");
  };
  // the ☰ menu: on a wide screen it can stay open beside the page (remembered); on a phone it covers it
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore this admin's last choice
      if (localStorage.getItem(MENU_KEY) === "open" && matchMedia(WIDE).matches) setMenuOpen(true);
    } catch {
      /* storage blocked */
    }
  }, []);
  const toggleMenu = (next = !menuOpen) => {
    setMenuOpen(next);
    try {
      if (matchMedia(WIDE).matches) localStorage.setItem(MENU_KEY, next ? "open" : "closed");
    } catch {
      /* storage blocked */
    }
  };
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !matchMedia(WIDE).matches && setMenuOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [menuOpen]);
  const [linksOpen, setLinksOpen] = useState(false);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore this admin's last choice
      setLinksOpen(localStorage.getItem(LINKS_KEY) === "open");
    } catch {
      /* storage blocked */
    }
  }, []);
  const toggleLinks = () => {
    setLinksOpen(!linksOpen);
    try {
      localStorage.setItem(LINKS_KEY, linksOpen ? "closed" : "open");
    } catch {
      /* storage blocked */
    }
  };
  const open = (t: Tab) => {
    setTab(t);
    if (!matchMedia(WIDE).matches) setMenuOpen(false);
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
    <div className={`min-h-screen bg-paper pb-24 text-ink transition-colors duration-300 ${side === "tech" ? "admin-tech" : ""}`}>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <MenuButton open={menuOpen} onClick={() => toggleMenu()} />
            <SideLogo side={side} />
            <span className="eyebrow hidden lg:inline">Admin</span>
            <SidePicker side={side} allowed={allowed} onChange={setSide} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => open("leads")}
              aria-current={tab === "leads" ? "page" : undefined}
              className={`btn !px-4 !py-2 ${tab === "leads" ? "" : "ghost"}`}
            >
              Leads
            </button>
            <a href="/" target="_blank" className="link-underline hidden md:inline">View site ↗</a>
            <span className="hidden text-muted xl:inline">{me.session!.email}</span>
            <button onClick={onLogout} className="btn ghost hidden !px-4 !py-2 sm:inline-flex">Sign out</button>
          </div>
        </div>
      </header>

      {/* the ☰ menu: slides in from the left */}
      {menuOpen && <div className="fixed inset-0 top-16 z-20 bg-ink/30 lg:hidden" onClick={() => toggleMenu(false)} aria-hidden />}
      <aside
        id="admin-menu"
        inert={!menuOpen}
        className={`fixed bottom-0 left-0 top-16 z-20 w-72 max-w-[85vw] overflow-y-auto border-r border-line bg-paper transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav aria-label="Admin sections" className="grid gap-6 px-4 py-6">
          {(["Day to day", "Website", "Team"] as Group[]).map((g) => (
            <div key={g}>
              <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted/70">{g}</p>
              {TABS.filter((t) => t.group === g && t.sides.includes(side) && (t.id !== "access" || full)).map((t) => (
                <button
                  key={t.id}
                  onClick={() => open(t.id)}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={`block w-full rounded-lg px-3 py-2.5 text-left text-[15px] transition-colors ${
                    tab === t.id ? "bg-ink font-medium text-paper" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          ))}
          {me.info && (
            <div>
              <button
                onClick={() => toggleLinks()}
                aria-expanded={linksOpen}
                aria-controls="admin-links"
                className="flex w-full items-center justify-between px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted/70 hover:text-ink"
              >
                Links
                <span aria-hidden className={`text-[12px] transition-transform ${linksOpen ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </button>
              <div id="admin-links" hidden={!linksOpen}>
                {[
                  ["▦ Open Google Sheet", me.info.spreadsheetUrl],
                  ["▤ Website folder", me.info.folderUrl],
                  ...(side === "talent" ? [["▤ Talent applications", me.info.talentFolderUrl]] : []),
                ].map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg px-3 py-2.5 text-[15px] text-ink-2 hover:bg-paper-2 hover:text-ink"
                  >
                    {label} <span className="text-muted">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="grid gap-2 border-t border-line px-3 pt-5 text-sm sm:hidden">
            <a href="/" target="_blank" className="link-underline w-fit">View site ↗</a>
            <span className="truncate text-muted">{me.session!.email}</span>
            <button onClick={onLogout} className="w-fit text-left underline underline-offset-4">Sign out</button>
          </div>
        </nav>
      </aside>

      <div className={`transition-[padding] duration-300 ease-out ${menuOpen ? "lg:pl-72" : ""}`}>
      <div className="wrap mt-8">
        {!me.backendConfigured && (
          <Notice>
            The Google Drive backend isn&apos;t connected yet. Set <code>APPS_SCRIPT_URL</code> and <code>APPS_SCRIPT_SECRET</code> (see README → Backend setup).
            The site is currently showing its built-in default images.
          </Notice>
        )}
        {(me.backendError || loadError) && <Notice>Couldn&apos;t reach Google Drive: {me.backendError || loadError}</Notice>}
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl">{TABS.find((t) => t.id === tab)?.label}</h1>
          <p className="mt-2 max-w-2xl text-ink-2">{TABS.find((t) => t.id === tab)?.about}</p>
        </div>


        {tab === "signed" && <SignedTab key={side} side={side} disabled={!me.backendConfigured} notify={notify} />}
        {tab === "leads" && <LeadsTab key={side} side={side} disabled={!me.backendConfigured} sheetUrl={me.info?.spreadsheetUrl} notify={notify} />}
        {tab === "insights" && <InsightsTab side={side} disabled={!me.backendConfigured} />}
        {tab === "images" && content && <ImagesTab side={side} content={content} reload={loadContent} notify={notify} />}
        {tab === "pages" && content && <BuilderTab content={content} side={side} reload={loadContent} notify={notify} openTab={setTab} />}
        {tab === "pages" && !content && me.backendConfigured && !loadError && <p className="text-muted">Loading the pages…</p>}
        {tab === "copy" && content && <CopyTab content={content} side={side} reload={loadContent} notify={notify} />}
        {tab === "copy" && !content && me.backendConfigured && !loadError && <p className="text-muted">Loading the site&apos;s wording…</p>}
        {tab === "theme" && content && (
          <ThemeTab key={JSON.stringify(content.settings.theme)} saved={content.settings.theme} side={side} reload={loadContent} notify={notify} />
        )}
        {tab === "press" && <PressTab disabled={!me.backendConfigured} notify={notify} />}
        {tab === "roster" && <RosterTab disabled={!me.backendConfigured} techStats={content?.techStats} notify={notify} />}
        {tab === "images" && !content && me.backendConfigured && !loadError && <p className="text-muted">Loading images…</p>}
        {tab === "animations" && (
          <AnimationsTab key={JSON.stringify(content?.settings ?? null)} settings={content?.settings} disabled={!content} reload={loadContent} notify={notify} />
        )}
        {tab === "applications" && content && (
          <ApplicationsTab key={side + JSON.stringify(content.eligibility[side])} side={side} saved={content.eligibility[side]} reload={loadContent} notify={notify} />
        )}
        {tab === "emails" && <EmailsTab side={side} disabled={!me.backendConfigured} notify={notify} />}
        {tab === "access" && full && <AccessTab me={me} reload={reloadMe} notify={notify} />}
      </div>
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

function ImagesTab({ content, reload, notify, side }: { content: SiteContent; reload: () => Promise<void>; notify: (m: string) => void; side: Side }) {
  const slots = SLOTS.filter((s) => !s.hidden && ((s.side ?? "talent") === side));
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
        values: {
          heroMode: draft.heroMode,
          heroAutoCycle: String(draft.heroAutoCycle),
          introStyle: draft.introStyle,
          ctaStyle: draft.ctaStyle,
          footerStyle: draft.footerStyle,
        },
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

const SIDE_CHOICES: { id: "" | Side; label: string }[] = [
  { id: "", label: "Both businesses" },
  { id: "talent", label: "Mode Society only" },
  { id: "tech", label: "ModeSociety Tech only" },
];

function AccessTab({ me, reload, notify }: { me: Me; reload: () => Promise<void>; notify: (m: string) => void }) {
  const [email, setEmail] = useState("");
  const [newSide, setNewSide] = useState<"" | Side>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const change = async (method: "POST" | "DELETE" | "PUT", target: string, side: "" | Side = "") => {
    setBusy(true);
    setError("");
    try {
      await postJson("/api/admin/admins", { email: target, side }, method);
      await reload();
      const which = SIDE_CHOICES.find((c) => c.id === side)!.label;
      notify(method === "POST" ? `${target} can now sign in (${which})` : method === "PUT" ? `${target}: ${which}` : `${target} removed`);
      setEmail("");
      setNewSide("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const permanent = [me.owner, me.backendOwner].filter((e, i, all): e is string => Boolean(e) && all.indexOf(e) === i);
  const others = (me.admins || []).filter((a) => !permanent.includes(a));
  const sideOf = (a: string) => (me.adminSides?.[a] === "talent" || me.adminSides?.[a] === "tech" ? (me.adminSides[a] as Side) : "");

  return (
    <div className="max-w-3xl">
      <p className="text-ink-2">
        Only the Google accounts listed here can sign in to this admin panel. Each one sees both businesses, or only Mode Society or only
        ModeSociety Tech. The list is stored in the <em>Admins</em> tab of the Google Sheet.
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {permanent.map((p) => (
          <li key={p} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span className="break-all">{p}</span>
            <span className="eyebrow">{p === me.owner ? "Site owner" : "Drive owner"} · both · permanent</span>
          </li>
        ))}
        {others.map((a) => (
          <li key={a} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span className="break-all">{a}</span>
            {a === me.session?.email ? (
              <span className="eyebrow">You · {SIDE_CHOICES.find((c) => c.id === sideOf(a))!.label.toLowerCase()}</span>
            ) : (
              <span className="flex items-center gap-4">
                <select
                  aria-label={`What ${a} can open`}
                  value={sideOf(a)}
                  disabled={busy}
                  onChange={(e) => change("PUT", a, e.target.value as "" | Side)}
                  className="border border-line bg-white px-3 py-2 text-sm"
                >
                  {SIDE_CHOICES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <button disabled={busy} onClick={() => change("DELETE", a)} className="text-sm text-pin underline underline-offset-4">
                  Remove
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>
      <form
        className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (email) change("POST", email.trim().toLowerCase(), newSide);
        }}
      >
        <div className="field flex-1">
          <label htmlFor="new-admin">Add a Google account</label>
          <input id="new-admin" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" />
        </div>
        <div className="field">
          <label htmlFor="new-admin-side">Can open</label>
          <select id="new-admin-side" className="input" value={newSide} onChange={(e) => setNewSide(e.target.value as "" | Side)}>
            {SIDE_CHOICES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn" disabled={busy || !me.backendConfigured}>Grant access</button>
      </form>
      {!me.backendConfigured && <p className="mt-3 text-sm text-muted">Connect the backend to manage additional admins.</p>}
      {error && <p className="mt-3 text-sm text-pin">{error}</p>}
    </div>
  );
}
