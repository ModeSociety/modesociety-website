/** The site's main colour as the page has it now (it can be changed in the admin panel), for canvas and script animations. */
export function inkRgb(): [number, number, number] {
  const v = typeof document === "undefined" ? "" : getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
  const m = v.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [127, 9, 13];
}

export const inkCss = (alpha = 1) => `rgba(${inkRgb().join(",")},${alpha})`;

/** True while the main colour is still the original burgundy. */
export const inkIsOriginal = () => inkRgb().join(",") === "127,9,13";
