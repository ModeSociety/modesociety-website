import { callBackend } from "@/lib/backend";

/**
 * Serves website images straight from the Drive folder, so nothing in Drive has
 * to be shared publicly. A file ID's content never changes, so the CDN caches forever.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[\w-]{10,}$/.test(id)) return new Response("Not found", { status: 404 });
  try {
    const file = await callBackend<{ mimeType: string; data: string }>("getFile", { fileId: id });
    return new Response(Buffer.from(file.data, "base64"), {
      headers: {
        "Content-Type": file.mimeType,
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "public, s-maxage=60" } });
  }
}
