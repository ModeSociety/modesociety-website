import { revalidatePath, revalidateTag } from "next/cache";
import { errorResponse, HttpError, requireAdmin } from "@/lib/auth";
import { assertSameOrigin, clean, cleanIds } from "@/lib/api";
import { callBackend, mediaUrl, SITE_TAG } from "@/lib/backend";
import { slugify } from "@/lib/press";

const ID_RE = /^[\w-]{1,20}$/;

type Row = { id: string; slug: string; photos: string[] };

function refresh() {
  revalidateTag(SITE_TAG, { expire: 0 });
  revalidatePath("/featured-in", "layout");
  revalidatePath("/");
}

/** Every feature, including hidden ones, with photo URLs for the panel. */
export async function GET() {
  try {
    await requireAdmin();
    const data = await callBackend<{ items: Row[] }>("listPress");
    return Response.json({ ok: true, items: data.items.map((a) => ({ ...a, photos: a.photos.map((fileId) => ({ fileId, src: mediaUrl(fileId) })) })) });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

/** Creates or updates one feature. Its address (slug) comes from the title and is kept unique. */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const { item: raw } = await req.json();
    const id = ID_RE.test(String(raw?.id || "")) ? String(raw.id) : "";
    const title = clean(raw?.title, 200);
    const outlet = clean(raw?.outlet, 80);
    if (!title || !outlet) throw new HttpError(400, "Add the publication and a title");
    const href = clean(raw?.href, 500);
    if (href && !/^https:\/\//i.test(href)) throw new HttpError(400, "The article link must start with https://");

    const { items } = await callBackend<{ items: Row[] }>("listPress");
    const taken = new Set(items.filter((a) => a.id !== id).map((a) => a.slug));
    const base = slugify(clean(raw?.slug, 80) || `${outlet} ${title}`) || "feature";
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

    const item = {
      id,
      order: Number(raw?.order) || 0,
      slug,
      outlet,
      title,
      date: clean(raw?.date, 40),
      excerpt: clean(raw?.excerpt, 600),
      body: clean(raw?.body, 40000),
      href,
      photos: cleanIds((raw?.photos || []).map((p: { fileId?: string } | string) => (typeof p === "string" ? p : p?.fileId)), 12),
      visible: raw?.visible !== false,
    };
    const data = await callBackend<{ item: Row }>("savePressItem", { item, by: session.email });
    refresh();
    return Response.json({ ok: true, item: data.item });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

/** Saves the display order. */
export async function PUT(req: Request) {
  try {
    assertSameOrigin(req);
    await requireAdmin();
    const { ids } = await req.json();
    const list = (Array.isArray(ids) ? ids : []).filter((x): x is string => typeof x === "string" && ID_RE.test(x)).slice(0, 300);
    await callBackend("setPressOrder", { ids: list });
    refresh();
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

export async function DELETE(req: Request) {
  try {
    assertSameOrigin(req);
    await requireAdmin();
    const { id } = await req.json();
    if (typeof id !== "string" || !ID_RE.test(id)) throw new HttpError(400, "Unknown feature");
    await callBackend("deletePressItem", { id });
    refresh();
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
