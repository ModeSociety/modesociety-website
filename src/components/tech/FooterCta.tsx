"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SectionCopy } from "@/lib/copy";

/** "Two ways in." closing call, on every Tech page except Contact (which is the form itself). */
export default function FooterCta({ copy }: { copy: SectionCopy<"tech.cta"> }) {
  if (usePathname() === "/tech/contact" || copy.hidden) return null;
  return (
    <div className="mb-20 flex flex-col items-center text-center md:mb-28">
      <h2 className="tech-wide text-[clamp(40px,7.6vw,120px)] text-t">{copy.heading}</h2>
      {copy.body && <p className="mt-5 max-w-md text-[17px] text-t2">{copy.body}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/tech/contact?as=brand" className="btn">
          {copy.brandsButton || "Brand enquiry"} <span className="arrow">→</span>
        </Link>
        <Link href="/tech/contact?as=creator" className="btn ghost">
          {copy.creatorsButton || "Apply to sign"} <span className="arrow">→</span>
        </Link>
      </div>
    </div>
  );
}
