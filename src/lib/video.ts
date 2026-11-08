/** A YouTube or Vimeo link → its embed address (and YouTube's thumbnail), or null for anything else. */
export function embedFor(url: string): { src: string; poster?: string } | null {
  const u = url.trim();
  const yt = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`, poster: `https://i.ytimg.com/vi/${yt[1]}/maxresdefault.jpg` };
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1&dnt=1&title=0&byline=0` };
  return null;
}

/**
 * A Google Drive file link (…/file/d/<id>/view, or ?id=<id>) → Drive's own player, for an iframe.
 * (Drive's download address can't be played in a <video> on another site: Google marks it same-site
 * only, and browsers block it.) The file must be shared "anyone with the link". Null for anything else.
 */
export function drivePlayer(url: string): string | null {
  const id = url.trim().match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([\w-]{20,})/)?.[1];
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}
