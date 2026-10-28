import Link from "next/link";
import FooterCta from "./FooterCta";
import Keyboard from "./Keyboard";
import SideSwitch from "@/components/site/SideSwitch";
import SocialLinks from "@/components/site/SocialLinks";
import { COMPANY } from "@/lib/content";
import { TECH_MENU } from "@/lib/tech";
import { MarkM } from "./Mark";

/** `landing`: before launch the footer leaves out the links to the pages that aren't public yet. */
export default function TechFooter({ landing = false }: { landing?: boolean }) {
  return (
    <footer className="relative overflow-hidden border-t border-tline pt-16 md:pt-24">
      <div className="t-beam left-[10%]" style={{ ["--r" as string]: "-14deg" }} aria-hidden />
      <div className="wrap relative">
        {!landing && <FooterCta />}

        <div className="grid gap-10 border-t border-tline pt-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="max-w-sm text-[15px] leading-relaxed text-t2">
              Streamers, content creators and esports athletes, worldwide, for brand campaigns and events across gaming products and technology.
            </p>
            <SocialLinks className="mt-6 text-t" />
          </div>
          <nav className="grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] md:col-span-4" aria-label="ModeSociety Tech">
            {(landing
              ? [
                  { href: "/tech#enquire", label: "Brand enquiry" },
                  { href: "/tech#apply", label: "Apply to sign" },
                ]
              : [{ href: "/tech", label: "Home" }, ...TECH_MENU]
            ).map((m) => (
              <Link key={m.href} href={m.href} className="text-t2 transition-colors hover:text-t">
                {m.label}
              </Link>
            ))}
          </nav>
          <div className="md:col-span-3 md:justify-self-end">
            <p className="tech-mono mb-3 text-[11px] uppercase text-t3">Mode Society</p>
            <SideSwitch current="tech" tone="tech" />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 text-t md:mt-20 md:flex-row md:items-end md:gap-[2.4vw]">
          <MarkM className="h-[clamp(52px,8.4vw,132px)] w-fit shrink-0" />
          <div className="min-w-0 flex-1">
            <Keyboard />
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-tline py-6 text-[12px] text-t3">
          <span>
            © {new Date().getFullYear()} {COMPANY}
          </span>
          <span>Melbourne, Australia · Working worldwide</span>
        </div>
      </div>
    </footer>
  );
}
