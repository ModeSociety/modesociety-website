import type { StepIcon as Name } from "@/lib/content";

/* Simple line icons for the "How it works" steps (24px grid, drawn in the current colour). */
const PATHS: Record<Name, string> = {
  brief: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.8c2 .7 3 2.6 3 5.2",
  contract: "M6 3h9l4 4v14H6zM9 9h6M9 13h6M9 17.5c1-1.5 2-1.5 2.5 0s1.5 1.5 2.5-.5",
  camera: "M3 7h12v10H3zM15 10.5l6-3.5v10l-6-3.5",
  chart: "M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  package: "M4 7.5 12 3l8 4.5v9L12 21l-8-4.5zM4 7.5l8 4.5 8-4.5M12 12v9",
  refresh: "M20 5v5h-5M4 19v-5h5M18.5 10A7 7 0 0 0 6 7.5M5.5 14A7 7 0 0 0 18 16.5",
  room: "M4 11l8-7 8 7v9H4zM10 20v-6h4v6",
  list: "M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01",
  check: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.5l2.7 2.7L16.5 9.5",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  badge: "M12 3l2.4 1.8 3-.2.9 2.9 2.4 1.8-1 2.8 1 2.8-2.4 1.8-.9 2.9-3-.2L12 21l-2.4-1.8-3 .2-.9-2.9L3.3 14.7l1-2.8-1-2.8 2.4-1.8.9-2.9 3 .2zM9 12l2 2 4-4",
  file: "M7 3h7l5 5v13H7zM14 3v5h5M10 12h6M10 16h4",
  megaphone: "M4 10v4h3l7 4V6l-7 4zM17.5 9.5a3.5 3.5 0 0 1 0 5M7 14l1.5 5h2.5L10 15",
  coins: "M9 10a5 3 0 1 0 0-6 5 3 0 0 0 0 6zM4 7v4c0 1.7 2.2 3 5 3M4 11v4c0 1.7 2.2 3 5 3M14 13a5 3 0 1 0 10 0 5 3 0 0 0-10 0zM14 13v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4",
};

export default function StepIcon({ name, className = "h-4 w-4" }: { name: Name; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}
