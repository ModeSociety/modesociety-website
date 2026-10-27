/** The two sides of Mode Society: the talent/modelling agency (/) and ModeSociety Tech (/tech). */
export type Side = "talent" | "tech";
export type SideFilter = Side | "all";

export const SIDES: { id: Side; label: string; short: string }[] = [
  { id: "talent", label: "Mode Society", short: "Talent" },
  { id: "tech", label: "ModeSociety Tech", short: "Tech" },
];

export const sideOfPath = (path: string): Side => (/^\/tech(\/|$)/.test(path) ? "tech" : "talent");
