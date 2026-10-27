import Link from "next/link";
import FooterCta from "./FooterCta";
import Keyboard from "./Keyboard";
import SideSwitch from "@/components/site/SideSwitch";
import SocialLinks from "@/components/site/SocialLinks";
import { COMPANY } from "@/lib/content";
import { TECH_MENU } from "@/lib/tech";
import { MarkM } from "./Mark";

export default function TechFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] pt-16 md:pt-24">
      <div className="t-beam left-[10%]" style={{ ["--r" as string]: "-14deg" }} aria-hidden />
      <div className="wrap relative">
        <FooterCta />

        <div className="grid gap-10 border-t border-white/[0.08] pt-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="max-w-sm text-[15px] leading-relaxed text-[#aab2c0]">
              Streamers, content creators and esports athletes, worldwide, for brand campaigns and events across gaming products and technology.
            </p>
            <SocialLinks className="mt-6 text-white" />
          </div>
          <nav className="grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] md:col-span-4" aria-label="ModeSociety Tech">
            <Link href="/tech" className="text-[#aab2c0] transition-colors hover:text-white">
              Home
            </Link>
            {TECH_MENU.map((m) => (
              <Link key={m.href} href={m.href} className="text-[#aab2c0] transition-colors hover:text-white">
                {m.label}
              </Link>
            ))}
          </nav>
          <div className="md:col-span-3 md:justify-self-end">
            <p className="tech-mono mb-3 text-[11px] uppercase text-[#8c95a5]">Mode Society</p>
            <SideSwitch current="tech" tone="tech" />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 text-white md:mt-20 md:flex-row md:items-end md:gap-[2.4vw]">
          <MarkM className="h-[clamp(52px,8.4vw,132px)] w-fit shrink-0" />
          <div className="min-w-0 flex-1">
            <Keyboard />
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-white/[0.08] py-6 text-[12px] text-[#8c95a5]">
          <span>
            © {new Date().getFullYear()} {COMPANY}
          </span>
          <span>Melbourne, Australia · Working worldwide</span>
        </div>
      </div>
    </footer>
  );
}
