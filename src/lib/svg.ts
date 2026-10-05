/**
 * Makes an uploaded logo SVG safe to inline and recolourable:
 * strips scripts/handlers/external refs, turns every paint colour into currentColor,
 * and drops fixed width/height so CSS can size it (viewBox is kept/derived).
 */
export function sanitizeLogoSvg(raw: string): string {
  if (!raw || !/<svg[\s>]/i.test(raw)) return "";
  let s = raw
    .replace(/<\?xml[^>]*>/gi, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|foreignObject|iframe|object|embed)[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|foreignObject|iframe|object|embed)[^>]*\/>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(?:xlink:)?href\s*=\s*("|')(?!#)[^"']*\1/gi, "");

  const color = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|\b(?:black|white|red|maroon)\b/gi;
  s = s
    .replace(/\s(fill|stroke)\s*=\s*("|')(?!none)([^"']*)\2/gi, (_m, attr) => ` ${attr}="currentColor"`)
    .replace(/(fill|stroke)\s*:\s*(?!none)[^;"'}]+/gi, (_m, prop) => `${prop}:currentColor`)
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (m) => m.replace(color, "currentColor"));

  // Root: drop fixed size, make sure there's a viewBox, default fill to currentColor.
  s = s.replace(/<svg\b([^>]*)>/i, (_m, attrs: string) => {
    const w = attrs.match(/\swidth\s*=\s*["']?([\d.]+)/i)?.[1];
    const h = attrs.match(/\sheight\s*=\s*["']?([\d.]+)/i)?.[1];
    let a = attrs.replace(/\s(width|height)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    if (!/viewBox/i.test(a) && w && h) a += ` viewBox="0 0 ${w} ${h}"`;
    if (!/\sfill=/i.test(a)) a += ` fill="currentColor"`;
    return `<svg${a} preserveAspectRatio="xMidYMid meet" focusable="false" aria-hidden="true">`;
  });
  return s.trim();
}
