"use client";

import { createContext, useContext } from "react";
import type { SectionCopy } from "@/lib/copy";

type Words = SectionCopy<"tech.words">;

// no default: the Tech layout always provides the words (and the copy registry stays out of the browser bundle)
const TechWordsContext = createContext<Words | null>(null);

/** The Tech side's small words (Pages & text → ModeSociety Tech → Small words), for every component under it. */
export function TechWordsProvider({ words, children }: { words: Words; children: React.ReactNode }) {
  return <TechWordsContext.Provider value={words}>{children}</TechWordsContext.Provider>;
}

export function useTechWords(): Words {
  const words = useContext(TechWordsContext);
  if (!words) throw new Error("useTechWords outside the Tech layout");
  return words;
}
