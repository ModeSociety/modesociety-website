import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Share previews (Google, iMessage, WhatsApp, LinkedIn…): the site's masthead style,
 * with the page's line in italic underneath. /og?title=Let's%20work%20together
 */
const fonts = (async () => {
  const dir = join(process.cwd(), "src/assets/fonts");
  const [anton, serif, mono] = await Promise.all([
    readFile(join(dir, "Anton-Regular.ttf")),
    readFile(join(dir, "InstrumentSerif-Italic.ttf")),
    readFile(join(dir, "IBMPlexMono-Medium.ttf")),
  ]);
  return [
    { name: "Anton", data: anton, weight: 400 as const, style: "normal" as const },
    { name: "Instrument Serif", data: serif, weight: 400 as const, style: "italic" as const },
    { name: "Plex Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ];
})();

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("title") || "Talent & creator agency";
  const title = raw.replace(/\s+/g, " ").trim().slice(0, 48);
  const mono = { fontFamily: "Plex Mono", fontSize: 22, letterSpacing: 1, textTransform: "uppercase" as const };

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#7f090d", color: "#fff", padding: "56px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid rgba(255,255,255,0.35)", paddingTop: 16, ...mono }}>
          <span>(Est. 2022) Talent &amp; creator agency</span>
          <span>Melbourne → worldwide</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div style={{ fontFamily: "Anton", fontSize: 196, lineHeight: 0.9, letterSpacing: -1 }}>MODE SOCIETY</div>
          <div style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 76, lineHeight: 1.1, marginTop: 18 }}>{title}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 34, opacity: 0.75, ...mono, fontSize: 18 }}>
          <span>Influencer campaigns · UGC · Event guest lists · Funding</span>
          <span>modesociety.com.au</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: await fonts,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400" },
    },
  );
}
