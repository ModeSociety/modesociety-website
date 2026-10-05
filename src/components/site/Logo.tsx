"use client";

import { createContext, useContext } from "react";

const LogoContext = createContext<string>("");

export function LogoProvider({ svg, children }: { svg: string; children: React.ReactNode }) {
  return <LogoContext.Provider value={svg}>{children}</LogoContext.Provider>;
}

export function useLogoSvg() {
  return useContext(LogoContext);
}

/**
 * The Mode Society logo in the current text colour. Uses the SVG from Drive
 * ("Home Page 1") when there is one, otherwise a typographic wordmark.
 */
export default function Logo({
  className = "",
  title = "Mode Society",
  compact = false,
}: {
  className?: string;
  title?: string;
  /** small spaces (cursor): the text fallback becomes the "MS" monogram */
  compact?: boolean;
}) {
  const svg = useLogoSvg();
  if (svg) {
    return (
      <span
        role="img"
        aria-label={title}
        className={`inline-flex [&>svg]:h-full [&>svg]:w-auto ${className}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }
  return (
    <span role="img" aria-label={title} className={`font-display inline-flex items-center whitespace-nowrap leading-none ${className}`}>
      {compact ? "MS" : "MODE SOCIETY"}
    </span>
  );
}
