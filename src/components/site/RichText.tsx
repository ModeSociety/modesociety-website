import { Fragment, type ReactNode } from "react";

/**
 * Plain text typed in the admin panel, shown as a formatted article. Kept deliberately small:
 *   blank line      → new paragraph
 *   ## Heading      → subheading
 *   > Quote         → pull quote
 *   - item          → bullet list
 *   **bold**, *italic*, [link text](https://…)
 */
export function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(((?:https?:\/\/|\/|mailto:)[^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = out.length;
    if (m[1]) out.push(<strong key={k}>{m[1]}</strong>);
    else if (m[2]) out.push(<em key={k}>{m[2]}</em>);
    else {
      const external = /^https?:/.test(m[4]);
      out.push(
        <a key={k} href={m[4]} className="underline underline-offset-4" {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {m[3]}
        </a>,
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const lines = (text: string) =>
  text.split("\n").map((l, i, all) => (
    <Fragment key={i}>
      {inline(l)}
      {i < all.length - 1 && <br />}
    </Fragment>
  ));

const BULLET = /^[-•*]\s+/;
const QUOTE = /^>\s?/;
const kindOf = (row: string) => (/^#{2,3}\s+/.test(row) ? "h" : QUOTE.test(row) ? "q" : BULLET.test(row) ? "li" : "p");

export default function RichText({ text, className = "" }: { text: string; className?: string }) {
  // runs of the same kind of line, so "Intro line:\n- one\n- two" is a paragraph then a list
  const runs: { kind: string; rows: string[] }[] = [];
  for (const block of text.replace(/\r\n?/g, "\n").trim().split(/\n\s*\n/)) {
    let prev: (typeof runs)[number] | null = null;
    for (const row of block.split("\n").map((r) => r.trim()).filter(Boolean)) {
      const kind = kindOf(row);
      if (prev && prev.kind === kind && kind !== "h") prev.rows.push(row);
      else runs.push((prev = { kind, rows: [row] }));
    }
  }
  return (
    <div className={`rich ${className}`}>
      {runs.map(({ kind, rows }, i) => {
        if (kind === "h") {
          const [, hashes, title] = rows[0].match(/^(#{2,3})\s+(.+)$/)!;
          return hashes === "##" ? <h2 key={i}>{inline(title)}</h2> : <h3 key={i}>{inline(title)}</h3>;
        }
        if (kind === "q") return <blockquote key={i}>{lines(rows.map((r) => r.replace(QUOTE, "")).join("\n"))}</blockquote>;
        if (kind === "li")
          return (
            <ul key={i}>
              {rows.map((r, j) => (
                <li key={j}>{inline(r.replace(BULLET, ""))}</li>
              ))}
            </ul>
          );
        return <p key={i}>{lines(rows.join("\n"))}</p>;
      })}
    </div>
  );
}
