import type { Metadata } from "next";
import PartnerForm from "@/components/forms/PartnerForm";
import { SectionHead } from "@/components/site/Editorial";
import { RiseLines } from "@/components/site/Reveal";

export const metadata: Metadata = { title: "Partner with us" };

export default async function PartnerWithUs({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  return (
    <section className="wrap pb-24 pt-28 md:pb-32 md:pt-36">
      <SectionHead index="Partners" label="B2B partnerships" meta="Referrals · affiliates · co-marketing" />
      <RiseLines
        as="h1"
        immediate
        delay={0.15}
        className="font-display mt-6 text-[clamp(84px,14vw,240px)] leading-[0.84] text-ink"
        lines={["Partner", <span key="w" className="font-serif italic">with us.</span>]}
      />
      <div className="mt-12 max-w-4xl md:mt-16">
        <PartnerForm typeHint={q.for === "tech" ? "Tech company" : ""} />
      </div>
    </section>
  );
}
