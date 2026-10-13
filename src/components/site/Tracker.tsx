"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const VISITOR = "ms-visitor";
const SESSION = "ms-session";
/** guards against counting one navigation twice (effects can re-run, e.g. in development) */
let lastSent = { path: "", at: 0 };

function store(storage: Storage | undefined, key: string) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/**
 * Sends one anonymous page view per route change to /api/track (admin → Insights).
 * Random ids live in the browser's own storage: one per browser (visitor), one per tab session,
 * which also remembers the landing referrer and query so the whole session keeps its source.
 */
export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (navigator.doNotTrack === "1" || pathname.startsWith("/admin")) return;
    if (lastSent.path === pathname && Date.now() - lastSent.at < 1500) return;
    lastSent = { path: pathname, at: Date.now() };
    let visitor = store(globalThis.localStorage, VISITOR);
    const newVisitor = !visitor;
    let session: { id: string; referrer: string; query: string } | null = null;
    try {
      visitor ||= crypto.randomUUID();
      localStorage.setItem(VISITOR, visitor);
      session = JSON.parse(store(globalThis.sessionStorage, SESSION) || "null");
      if (!session) {
        session = { id: crypto.randomUUID(), referrer: document.referrer, query: location.search };
        sessionStorage.setItem(SESSION, JSON.stringify(session));
      }
    } catch {
      // storage blocked: still count the view, as its own one-page session
      visitor ||= crypto.randomUUID();
      session = { id: crypto.randomUUID(), referrer: document.referrer, query: location.search };
    }
    const body = JSON.stringify({ path: pathname, referrer: session.referrer, query: session.query, session: session.id, visitor, newVisitor });
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
