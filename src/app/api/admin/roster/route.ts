import { revalidatePath, revalidateTag } from "next/cache";
import { errorResponse, HttpError, requireAdmin } from "@/lib/auth";
import { assertSameOrigin, clean, cleanList } from "@/lib/api";
import { callBackend, mediaUrl, SITE_TAG } from "@/lib/backend";
import { PLATFORMS, ROSTER_TYPES, type RosterMember } from "@/lib/tech";

const ID_RE = /^[\w-]{1,20}$/;

function refresh() {
  revalidateTag(SITE_TAG, { expire: 0 });
  revalidatePath("/tech", "layout");
}

/** The whole roster, including hidden members, with a photo URL for the panel. */
export async function GET() {
  try {
    await requireAdmin();
    const data = await callBackend<{ items: RosterMember[] }>("listRoster");
    return Response.json({ ok: true, items: data.items.map((m) => ({ ...m, photoUrl: m.photo ? mediaUrl(m.photo) : "" })) });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

/** Creates or updates one member. */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const { item: raw } = await req.json();
    const platforms: RosterMember["platforms"] = {};
    for (const p of PLATFORMS) {
      const v = raw?.platforms?.[p.id];
      const url = clean(v?.url, 300);
      const followers = clean(v?.followers, 30);
      if (url && !/^https:\/\//i.test(url)) throw new HttpError(400, `${p.label} link must start with https://`);
      if (url || followers) platforms[p.id] = { url, followers };
    }
    const item = {
      id: ID_RE.test(String(raw?.id || "")) ? String(raw.id) : "",
      order: Number(raw?.order) || 0,
      name: clean(raw?.name, 80),
      handle: clean(raw?.handle, 80).replace(/^@/, ""),
      type: cleanList([raw?.type], ROSTER_TYPES)[0] || "Creator",
      niche: clean(raw?.niche, 120),
      region: clean(raw?.region, 80),
      quote: clean(raw?.quote, 400),
      featured: raw?.featured === true,
      visible: raw?.visible !== false,
      photo: /^[\w-]{10,}$/.test(String(raw?.photo || "")) ? String(raw.photo) : "",
      platforms,
    };
    if (!item.name) throw new HttpError(400, "Give them a name");
    const data = await callBackend<{ item: RosterMember }>("saveRosterMember", { item, by: session.email });
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
    await callBackend("setRosterOrder", { ids: list });
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
    if (typeof id !== "string" || !ID_RE.test(id)) throw new HttpError(400, "Unknown roster member");
    await callBackend("deleteRosterMember", { id });
    refresh();
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
