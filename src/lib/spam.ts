/**
 * The forms' spam trap (SP-112): a hidden field people never see (`website_url`, filled in only by
 * bots) and the time since the form was opened (`elapsed`, in ms). A caught form is thanked and
 * dropped, so a bot can't tell it was caught; real people see no change.
 */
export function isSpam(body: { website_url?: unknown; elapsed?: unknown }, minMs: number): boolean {
  return Boolean(body.website_url) || !(Number(body.elapsed) >= minMs);
}
