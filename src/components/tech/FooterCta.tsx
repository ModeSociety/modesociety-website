"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** "Two ways in." closing call, on every Tech page except Contact (which is the form itself). */
export default function FooterCta() {
  if (usePathname() === "/tech/contact") return null;
  return (
    <div className="mb-20 flex flex-col items-center text-center md:mb-28">
      <h2 className="tech-wide text-[clamp(40px,7.6vw,120px)] text-white">Two ways in.</h2>
      <p className="mt-5 max-w-md text-[17px] text-[#aab2c0]">Brands, tell us what you&apos;re launching. Creators, apply to sign.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/tech/contact?as=brand" className="btn">
          Brand enquiry <span className="arrow">→</span>
        </Link>
        <Link href="/tech/contact?as=creator" className="btn ghost">
          Apply to sign <span className="arrow">→</span>
        </Link>
      </div>
    </div>
  );
}
