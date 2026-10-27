"use client";

import { useMemo, useState } from "react";
import { ROSTER_TYPES, totalFollowers, type RosterMember } from "@/lib/tech";
import RosterCard from "./RosterCard";

/** The full roster with a type filter, search and sort. */
export default function RosterGrid({ members, sample }: { members: RosterMember[]; sample: boolean }) {
  const [type, setType] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"featured" | "followers" | "name">("featured");
  const types = ["All", ...ROSTER_TYPES.filter((t) => members.some((m) => m.type === t))];

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = members.filter(
      (m) => (type === "All" || m.type === type) && (!needle || [m.name, m.handle, m.niche, m.region].join(" ").toLowerCase().includes(needle)),
    );
    if (sort === "followers") out.sort((a, b) => totalFollowers(b) - totalFollowers(a));
    if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [members, type, q, sort]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          {types.map((t) => (
            <button key={t} type="button" className="chip !px-4 !py-2 !text-[13px]" aria-pressed={type === t} onClick={() => setType(t)}>
              {t}
              <span className="text-[11px] opacity-60">{t === "All" ? members.length : members.filter((m) => m.type === t).length}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search names, games, regions"
            aria-label="Search the roster"
            className="w-60 rounded-full bg-white/[0.04] px-4 py-2.5 text-[14px] text-white shadow-[inset_0_0_0_1px_rgba(233,236,241,0.14)] outline-none placeholder:text-[#6c7484] focus:shadow-[inset_0_0_0_1px_#89b2fd]"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            aria-label="Sort"
            className="rounded-full bg-white/[0.04] px-4 py-2.5 text-[14px] text-white shadow-[inset_0_0_0_1px_rgba(233,236,241,0.14)] outline-none [&>option]:bg-[#0e1118]"
          >
            <option value="featured">Our order</option>
            <option value="followers">Most followers</option>
            <option value="name">A–Z</option>
          </select>
        </div>
      </div>
      {list.length ? (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {list.map((m) => (
            <li key={m.id}>
              <RosterCard m={m} sample={sample} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="t-panel p-10 text-center text-[#aab2c0]">Nobody matches that yet.</p>
      )}
    </div>
  );
}
