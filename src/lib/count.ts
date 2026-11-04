/** A note with a count in it, as typed in the admin panel: "{n} question{s}" → "1 question" / "4 questions". */
export const countText = (template: string, n: number) => template.replace(/\{n\}/g, String(n)).replace(/\{s\}/g, n === 1 ? "" : "s");
