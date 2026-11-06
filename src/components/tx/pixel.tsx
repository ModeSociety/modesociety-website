import { Fragment } from "react";

/** "Not just *gaming.*" → the starred words in the design's pixel type (class `it`). */
export function pixel(text: string) {
  return text.split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
      <span key={i} className="it">
        {part.slice(1, -1)}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** A headline typed one line per line: each line in turn, with <br> between. */
export function lines(text: string) {
  const all = text.split("\n").filter((l) => l.trim());
  return all.map((l, i) => (
    <Fragment key={i}>
      {pixel(l)}
      {i < all.length - 1 && <br />}
    </Fragment>
  ));
}
