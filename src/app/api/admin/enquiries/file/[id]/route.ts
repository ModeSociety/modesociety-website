import { unstable_cache } from "next/cache";
import sharp from "sharp";
import { errorResponse, requireAdmin } from "@/lib/auth";
import { callBackend } from "@/lib/backend";
import type { Side } from "@/lib/side";

type DriveFile = { mimeType: string; name: string; data: string };

const fetchFile = (id: string, side: Side) => callBackend<DriveFile>("getEnquiryFile", { fileId: id, side });

/**
 * A small WebP of a lead's photo (480 px on the long side), kept by the website: Apps Script takes
 * about 2 s per file, so each thumbnail is made once and then served at once to every admin.
 * The kept copy stays on the server; only signed-in admins can ask for it.
 */
const thumbnail = unstable_cache(
  async (id: string, side: Side) => {
    const file = await fetchFile(id, side);
    if (!file.mimeType.startsWith("image/")) return null; // a PDF or other file: no thumbnail
    const out = await sharp(Buffer.from(file.data, "base64"), { failOn: "none" })
      .rotate()
      .resize(480, 480, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 72 })
      .toBuffer();
    return out.toString("base64");
  },
  ["lead-thumb-v2"],
  { revalidate: false },
);

/**
 * A talent application's photo or screenshot, for signed-in admins only. The file stays private in
 * Drive; the backend only hands out files inside the Talent Applications folder. ?size=thumb gives
 * the small kept copy for lists; without it, the full file (opened in the viewer).
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ?side=tech for ModeSociety Tech's files; an admin only opens their own business's
    const side: Side = new URL(req.url).searchParams.get("side") === "tech" ? "tech" : "talent";
    await requireAdmin(side);
    const { id } = await params;
    if (!/^[\w-]{10,}$/.test(id)) return new Response("Not found", { status: 404 });
    // a Drive file's contents never change, so the browser may keep it (private: never shared caches)
    const keep = "private, max-age=31536000, immutable";
    if (new URL(req.url).searchParams.get("size") === "thumb") {
      const thumb = await thumbnail(id, side);
      if (thumb) return new Response(Buffer.from(thumb, "base64"), { headers: { "Content-Type": "image/webp", "Cache-Control": keep } });
    }
    const file = await fetchFile(id, side);
    // ?download=1 saves it (a Tech brand's brief); otherwise it opens in the browser
    const disposition = new URL(req.url).searchParams.get("download") === "1" ? "attachment" : "inline";
    return new Response(Buffer.from(file.data, "base64"), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(file.name || id)}"`,
        "Cache-Control": keep,
      },
    });
  } catch (err) {
    // a file outside this business's folders (or gone): not found, not a server error
    if (/not found/i.test((err as Error).message)) return new Response("Not found", { status: 404 });
    return errorResponse(err, { expose: true });
  }
}
