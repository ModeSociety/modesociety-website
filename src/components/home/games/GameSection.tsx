"use client";

import { useEffect, useState } from "react";
import type { GameMode, SiteImage } from "@/lib/slots";
import Darkroom from "./Darkroom";
import Memory from "./Memory";
import Puzzle from "./Puzzle";
import Shell from "./Shell";
import Shortlist from "./Shortlist";

type Playable = Exclude<GameMode, "rotate" | "off">;
const ROTATION: Playable[] = ["memory", "shortlist", "shell", "puzzle", "darkroom"];
const KEY = "ms-game-cycle";

/**
 * Renders the homepage game chosen in the admin panel. "rotate" shows the next game
 * in the rotation on each visit (remembered per browser).
 */
export default function GameSection({ mode, faces, pool }: { mode: GameMode; faces: SiteImage[]; pool: SiteImage[] }) {
  const [game, setGame] = useState<Playable>(mode === "rotate" || mode === "off" ? "memory" : mode);

  useEffect(() => {
    if (mode !== "rotate") return;
    try {
      const next = (Number(localStorage.getItem(KEY) ?? -1) + 1) % ROTATION.length;
      localStorage.setItem(KEY, String(next));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- visit counter lives in localStorage
      setGame(ROTATION[next]);
    } catch {
      /* ignore */
    }
  }, [mode]);

  if (mode === "off" || faces.length < 2) return null;
  switch (game) {
    case "shortlist":
      return <Shortlist faces={pool} />;
    case "shell":
      return <Shell faces={pool} />;
    case "puzzle":
      return <Puzzle faces={pool} />;
    case "darkroom":
      return <Darkroom faces={faces} />;
    default:
      return <Memory faces={faces} />;
  }
}
