import { errorResponse, HttpError, requireAdmin } from "@/lib/auth";
import { assertSameOrigin, clean, cleanList } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES, DATE_RE, TIME_RE, type Appointment } from "@/lib/schedule";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const q = new URL(req.url).searchParams;
    const from = q.get("from") || "";
    const to = q.get("to") || "";
    if ((from && !DATE_RE.test(from)) || (to && !DATE_RE.test(to))) throw new HttpError(400, "Invalid date range");
    const data = await callBackend<{ items: Appointment[] }>("listAppointments", { from, to });
    return Response.json({ ok: true, items: data.items });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const session = await requireAdmin();
    const { item: raw } = await req.json();
    const item = {
      id: clean(raw?.id, 20),
      title: clean(raw?.title, 140),
      type: cleanList([raw?.type], APPOINTMENT_TYPES)[0] || "Other",
      date: clean(raw?.date, 10),
      start: clean(raw?.start, 5),
      end: clean(raw?.end, 5),
      client: clean(raw?.client, 140),
      talent: clean(raw?.talent, 200),
      location: clean(raw?.location, 300),
      notes: clean(raw?.notes, 2000),
      status: cleanList([raw?.status], APPOINTMENT_STATUSES)[0] || "Scheduled",
      assignee: clean(raw?.assignee, 200).toLowerCase(),
      side: raw?.side === "tech" ? ("tech" as const) : ("talent" as const),
    };
    if (!item.title) throw new HttpError(400, "Give the appointment a title");
    if (!DATE_RE.test(item.date)) throw new HttpError(400, "Pick a date");
    if ((item.start && !TIME_RE.test(item.start)) || (item.end && !TIME_RE.test(item.end))) throw new HttpError(400, "Times must be HH:MM");
    if (item.start && item.end && item.end <= item.start) throw new HttpError(400, "The end time must be after the start time");
    const data = await callBackend<{ item: Appointment }>("saveAppointment", { item, by: session.email });
    return Response.json({ ok: true, item: data.item });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}

export async function DELETE(req: Request) {
  try {
    assertSameOrigin(req);
    await requireAdmin();
    const { id } = await req.json();
    if (typeof id !== "string" || !/^[\w-]{4,20}$/.test(id)) throw new HttpError(400, "Unknown appointment");
    await callBackend("deleteAppointment", { id });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
