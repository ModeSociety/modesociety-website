import { after } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";
import { clean } from "@/lib/api";
import { callBackend } from "@/lib/backend";
import { isTechHost } from "@/lib/domains";
import { classifySource } from "@/lib/insights";

const BOTS = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|facebookexternalhit|embedly/i;

/**
 * Records one anonymous page view. No cookies or personal data: the browser sends a random
 * visitor/session id it keeps in its own storage, and the landing referrer / query so the
 * session's source (organic search, social, …) can be classified here.
 */
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") || "";
  const isAdmin = (req.headers.get("cookie") || "").includes(`${ADMIN_COOKIE}=`);
  if (BOTS.test(ua) || isAdmin) return new Response(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const asked = clean(body.path, 200).split("?")[0] || "/";
  if (!asked.startsWith("/") || asked.startsWith("/admin") || asked.startsWith("/api")) return new Response(null, { status: 204 });

  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").split(":")[0];
  // Insights counts /tech… as ModeSociety Tech: on its own domain the Tech page is "/", so it is
  // recorded as /tech there (visits recorded before the move were /tech already)
  const path = isTechHost(host) && !asked.startsWith("/tech") ? `/tech${asked === "/" ? "" : asked}` : asked;
  const { source, host: referrer, campaign } = classifySource(clean(body.referrer, 500), clean(body.query, 500), host);
  const view = {
    path,
    source,
    referrer,
    campaign,
    session: clean(body.session, 40),
    visitor: clean(body.visitor, 40),
    newVisitor: body.newVisitor === true,
    device: /ipad|tablet/i.test(ua) ? "tablet" : /mobi|android|iphone/i.test(ua) ? "mobile" : "desktop",
    country: (req.headers.get("x-vercel-ip-country") || "").slice(0, 2),
  };
  if (!view.session || !view.visitor) return new Response(null, { status: 400 });

  // answer straight away; the Sheet write happens after the response
  after(() => callBackend("track", view).catch((err) => console.error("[mode-society] track failed:", err)));
  return new Response(null, { status: 204 });
}
