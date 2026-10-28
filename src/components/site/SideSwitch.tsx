import Link from "next/link";
import type { Side } from "@/lib/side";

/**
 * Mode Society ↔ ModeSociety Tech. A two-way pill shown in both sides' nav, menu and
 * footer; the current side is highlighted and the other links across.
 */
export default function SideSwitch({ current, tone = "light", className = "" }: { current: Side; tone?: "light" | "dark" | "tech"; className?: string }) {
  const sides: { id: Side; href: string; label: string; title: string }[] = [
    { id: "talent", href: "/", label: "Talent", title: "Mode Society: talent & creator agency" },
    { id: "tech", href: "/tech", label: "Tech", title: "ModeSociety Tech: gaming & tech creators" },
  ];
  const shell =
    tone === "tech"
      ? "bg-white shadow-[inset_0_0_0_1px_rgba(11,20,56,0.14)]"
      : tone === "dark"
        ? "bg-white/[0.06] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)]"
        : "bg-paper shadow-[inset_0_0_0_1px_rgba(127,9,13,0.25)]";
  const on = (id: Side) =>
    tone === "tech"
      ? "bg-[linear-gradient(180deg,#5a7bff,#2f4fe0)] text-white"
      : tone === "dark"
        ? id === current ? "bg-white text-ink" : ""
        : "bg-ink text-white";
  const off = tone === "tech" ? "text-[#48527a] hover:text-[#0b1438]" : tone === "dark" ? "text-white/75 hover:text-white" : "text-ink hover:bg-ink/5";
  return (
    <nav aria-label="Switch between Mode Society and ModeSociety Tech" className={`inline-flex rounded-full p-[3px] ${shell} ${className}`}>
      {sides.map((s) => (
        <Link
          key={s.id}
          href={s.href}
          title={s.title}
          aria-current={s.id === current ? "page" : undefined}
          className={`rounded-full px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] transition-colors duration-300 ${
            s.id === current ? on(s.id) : off
          }`}
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}
