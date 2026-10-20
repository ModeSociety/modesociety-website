import Link from "next/link";
import { COMPANY, MENU } from "@/lib/content";
import type { FooterStyle } from "@/lib/slots";
import { SectionHead } from "./Editorial";
import Halftone from "./Halftone";
import SocialLinks from "./SocialLinks";
import Wordmark from "./Wordmark";

export default function Footer({ style }: { style: FooterStyle }) {
  return (
    <footer className="relative overflow-hidden text-white">
      {/* dots growing out of the page into the solid burgundy footer */}
      <div className="h-[clamp(150px,20vw,300px)]">
        <Halftone />
      </div>
      <div className="bg-ink">
        <div className="wrap pt-14 md:pt-20">
          <SectionHead tone="dark" index="✶" label="Let's connect" meta="Melbourne → worldwide" />
        </div>
        <div className="wrap grid gap-14 pb-10 pt-10 md:grid-cols-12 md:pt-14">
          <div className="md:col-span-7">
            <h2 className="font-display text-[clamp(60px,7.4vw,136px)]">
              Tell us your vision.
              <br />
              <span className="font-serif text-[0.62em] italic">We&apos;ll bring it to life.</span>
            </h2>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/work-with-us" className="btn light">
                For brands <span className="arrow">→</span>
              </Link>
              <Link
                href="/apply-to-be-a-creator"
                className="btn ghost !border-white/60 !text-white hover:!text-ink [&::before]:!bg-white"
              >
                For talent <span className="arrow">→</span>
              </Link>
            </div>
          </div>
          <div className="grid content-end gap-8 text-sm md:col-span-4 md:col-start-9">
            <div>
              <span className="eyebrow !text-white/70">Enquiries</span>
              <p className="mt-2 text-lg leading-snug text-white/90">
                Tell us a little about you and we&apos;ll get back to you.
              </p>
              <Link href="/get-in-touch" className="btn light mt-4">
                Make an enquiry <span className="arrow">→</span>
              </Link>
            </div>
            <SocialLinks />
            <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] uppercase tracking-[0.04em] text-white/75">
              {MENU.filter((m) => !m.href.includes("for=tech")).map((m) => (
                <Link key={m.href} href={m.href} className="link-underline">
                  {m.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="wrap pb-6">
          <Wordmark style={style} />
        </div>
        <div className="wrap">
          <div className="flex flex-wrap justify-between gap-2 border-t border-white/20 py-6 font-mono text-[11px] uppercase tracking-[0.04em] text-white/70">
            <span>
              © {new Date().getFullYear()} {COMPANY}
            </span>
            <span>
              Influencer campaigns · UGC · Event guest lists · Funding
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
