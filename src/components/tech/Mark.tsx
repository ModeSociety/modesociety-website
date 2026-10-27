import { useId } from "react";
import { M_PATH, M_WINDOW, WORDMARK_M_TRANSFORM, WORDMARK_PATHS } from "./mark-paths";

/** Asha's blue fade (top to bottom), as in the approved mocks. */
function Fade({ id }: { id: string }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="-503" x2="0" y2="0">
      <stop offset="0" stopColor="#4B6FF5" />
      <stop offset="0.5755" stopColor="#6A95FB" />
      <stop offset="0.7235" stopColor="#739FFC" stopOpacity="0.9" />
      <stop offset="0.876" stopColor="#80ABFD" stopOpacity="0.28" />
      <stop offset="1" stopColor="#89B2FD" stopOpacity="0" />
    </linearGradient>
  );
}

/** The pill m on its own (solid, or Asha's fade). */
export function MarkM({ className = "", fade = true, title }: { className?: string; fade?: boolean; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="-2 -505 553 507" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {fade && (
        <defs>
          <Fade id={`f${id}`} />
        </defs>
      )}
      <path d={M_PATH} fill={fade ? `url(#f${id})` : "#3E5EF1"} fillRule="evenodd" />
    </svg>
  );
}

/** MODESOCIETY TECH, with the m in front (letters take the current text colour). */
export function Wordmark({ className = "", title = "ModeSociety Tech" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 -152.5 8628.63 1060.31" className={className} role="img" aria-label={title}>
      <path fill="#3E5EF1" transform={WORDMARK_M_TRANSFORM} d={M_PATH} fillRule="evenodd" />
      {WORDMARK_PATHS.map((d) => (
        <path key={d.slice(0, 24)} fill="currentColor" d={d} />
      ))}
    </svg>
  );
}

export { M_PATH, M_WINDOW };
