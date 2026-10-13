/** Team schedule (admin panel → Schedule). Stored in the "Schedule" tab of the Google Sheet. */

export const APPOINTMENT_TYPES = ["Call", "Meeting", "Shoot", "Event", "Deadline", "Other"] as const;
export const APPOINTMENT_STATUSES = ["Scheduled", "Done", "Cancelled"] as const;

export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type Appointment = {
  id: string;
  title: string;
  type: AppointmentType;
  /** yyyy-MM-dd */
  date: string;
  /** HH:mm, or "" for all day */
  start: string;
  end: string;
  client: string;
  talent: string;
  location: string;
  notes: string;
  status: AppointmentStatus;
  /** admin email, or "" for unassigned */
  assignee: string;
  createdBy?: string;
};

/**
 * One colour per type, in fixed order (validated categorical palette; "Other" is neutral).
 * Shown as a dot/bar beside the text — the text itself stays in ink.
 */
export const TYPE_COLORS: Record<AppointmentType, string> = {
  Call: "#A3242B",
  Meeting: "#A9822F",
  Shoot: "#3B6FD0",
  Event: "#7A9A2E",
  Deadline: "#8B5CC4",
  Other: "#8A8580",
};

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Local yyyy-MM-dd for a Date (not UTC, so "today" matches the viewer's calendar). */
export function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** "Add to Google Calendar" link for an appointment (times are taken as the viewer's local time). */
export function googleCalendarUrl(a: Appointment) {
  const d = a.date.replace(/-/g, "");
  let dates: string;
  if (a.start) {
    const end = a.end && a.end > a.start ? a.end : `${String(Math.min(23, Number(a.start.slice(0, 2)) + 1)).padStart(2, "0")}${a.start.slice(2)}`;
    dates = `${d}T${a.start.replace(":", "")}00/${d}T${end.replace(":", "")}00`;
  } else {
    const next = new Date(`${a.date}T00:00:00`);
    next.setDate(next.getDate() + 1);
    dates = `${d}/${ymd(next).replace(/-/g, "")}`;
  }
  const details = [a.client && `Client / brand: ${a.client}`, a.talent && `Talent: ${a.talent}`, a.notes].filter(Boolean).join("\n");
  const q = new URLSearchParams({ action: "TEMPLATE", text: a.title, dates, details, location: a.location });
  return `https://calendar.google.com/calendar/render?${q}`;
}
