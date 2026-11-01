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
  return trimViewBox(s.trim());
}

/** Every point a path's commands name (end points and curve handles), in absolute coordinates. */
function pathPoints(d: string): [number, number][] {
  const out: [number, number][] = [];
  const tokens = d.match(/[a-df-z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gi) ?? [];
  let i = 0;
  let cmd = "";
  let x = 0,
    y = 0,
    sx = 0,
    sy = 0;
  const num = () => parseFloat(tokens[i++]);
  const ARGS: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
  while (i < tokens.length) {
    if (/^[a-z]$/i.test(tokens[i])) cmd = tokens[i++];
    const lower = cmd.toLowerCase();
    const rel = cmd !== cmd.toUpperCase();
    if (lower === "z") {
      x = sx;
      y = sy;
      continue;
    }
    const n = ARGS[lower];
    if (!n || i + n > tokens.length) break;
    const v = Array.from({ length: n }, num);
    if (v.some(Number.isNaN)) break;
    const pt = (px: number, py: number): [number, number] => (rel ? [x + px, y + py] : [px, py]);
    if (lower === "h") x = rel ? x + v[0] : v[0];
    else if (lower === "v") y = rel ? y + v[0] : v[0];
    else if (lower === "a") [x, y] = pt(v[5], v[6]);
    else {
      for (let k = 0; k < n - 2; k += 2) out.push(pt(v[k], v[k + 1]));
      [x, y] = pt(v[n - 2], v[n - 1]);
    }
    out.push([x, y]);
    if (lower === "m") {
      [sx, sy] = [x, y];
      cmd = rel ? "l" : "L"; // more pairs after a move are lines
    }
  }
  return out;
}

/**
 * Logos exported on a big square canvas (Canva does this) come with empty space all round, which
 * shrinks them in the header. This tightens the viewBox to what's actually drawn. Logos with
 * transforms, text or embedded images are left as they are, as their bounds can't be read here.
 */
export function trimViewBox(svg: string): string {
  if (/\stransform\s*=|<(text|image|use|clipPath|mask)\b/i.test(svg)) return svg;
  const pts: [number, number][] = [];
  for (const m of svg.matchAll(/<path\b[^>]*\sd\s*=\s*("|')([^"']*)\1/gi)) pts.push(...pathPoints(m[2]));
  for (const m of svg.matchAll(/<(?:polygon|polyline)\b[^>]*\spoints\s*=\s*("|')([^"']*)\1/gi)) {
    const nums = m[2].trim().split(/[\s,]+/).map(Number);
    for (let k = 0; k + 1 < nums.length; k += 2) pts.push([nums[k], nums[k + 1]]);
  }
  for (const m of svg.matchAll(/<(rect|circle|ellipse)\b([^>]*)>/gi)) {
    const at = (n: string) => parseFloat(m[2].match(new RegExp(`\\s${n}\\s*=\\s*["']?(-?[\\d.]+)`, "i"))?.[1] ?? "0");
    if (m[1].toLowerCase() === "rect") pts.push([at("x"), at("y")], [at("x") + at("width"), at("y") + at("height")]);
    else {
      const rx = m[1].toLowerCase() === "circle" ? at("r") : at("rx");
      const ry = m[1].toLowerCase() === "circle" ? at("r") : at("ry");
      pts.push([at("cx") - rx, at("cy") - ry], [at("cx") + rx, at("cy") + ry]);
    }
  }
  const good = pts.filter(([px, py]) => Number.isFinite(px) && Number.isFinite(py));
  if (good.length < 2) return svg;
  const xs = good.map((q) => q[0]);
  const ys = good.map((q) => q[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const w = x1 - x0;
  const h = y1 - y0;
  if (!(w > 0 && h > 0)) return svg;
  const pad = Math.max(w, h) * 0.01;
  const box = [x0 - pad, y0 - pad, w + pad * 2, h + pad * 2].map((v) => Math.round(v * 100) / 100).join(" ");
  return svg.replace(/<svg\b([^>]*)>/i, (_m, attrs: string) => `<svg${attrs.replace(/\sviewBox\s*=\s*("[^"]*"|'[^']*')/i, "")} viewBox="${box}">`);
}
