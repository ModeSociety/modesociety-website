import { Fragment, type ReactNode } from "react";

/**
 * A heading typed in the admin panel: words wrapped in *stars* get the accent style
 * (the italic serif on the talent site), e.g. "Think of us as your *external* PR team."
 */
export function accent(text: string, className = "font-serif italic"): ReactNode[] {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    /^\*[^*]+\*$/.test(part) ? (
      <span key={i} className={className}>
        {part.slice(1, -1)}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Each line of the text is a line of the heading. */
export function headingLines(text: string, className?: string): ReactNode[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l, i) => <Fragment key={i}>{accent(l, className)}</Fragment>);
}

/** A heading's lines with <br /> between them, for headings that aren't animated line by line. */
export default function Accent({ text, className }: { text: string; className?: string }) {
  const out = headingLines(text, className);
  return (
    <>
      {out.map((l, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {l}
        </Fragment>
      ))}
    </>
  );
}
