import { errorResponse, requireAdmin } from "@/lib/auth";
import { callBackend } from "@/lib/backend";

/**
 * A talent application's screenshot, for signed-in admins only. The file stays private
 * in Drive; the backend only hands out files inside the Talent Applications folder.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!/^[\w-]{10,}$/.test(id)) return new Response("Not found", { status: 404 });
    const file = await callBackend<{ mimeType: string; name: string; data: string }>("getEnquiryFile", { fileId: id });
    return new Response(Buffer.from(file.data, "base64"), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.name || id)}"`,
        // personal data: the browser may keep it briefly, shared caches never
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
