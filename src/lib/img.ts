/**
 * Responsive, compressed photos through Next's image optimiser (/_next/image): each photo is
 * served at the width it's shown and as AVIF/WebP, instead of the full-size JPEG.
 * Spread the result onto an <img>: <img {...responsive(src, "240px")} alt=… />
 */
const WIDTHS = [256, 384, 640, 828, 1080, 1200, 1920]; // all in Next's default image/device sizes

const optimisable = (src: string) =>
  !/\.svg($|\?)/i.test(src) && (src.startsWith("/assets/") || src.startsWith("/media/") || src.startsWith("https://lh3.googleusercontent.com/"));

const url = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

export function responsive(src: string, sizes: string, maxWidth = 1920) {
  if (!optimisable(src)) return { src };
  const widths = WIDTHS.filter((w) => w <= maxWidth);
  return { src: url(src, widths[widths.length - 1]), srcSet: widths.map((w) => `${url(src, w)} ${w}w`).join(", "), sizes };
}
