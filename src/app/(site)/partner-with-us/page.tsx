import type { Metadata } from "next";
import PartnerForm from "@/components/forms/PartnerForm";
import { RiseLines } from "@/components/site/Reveal";

export const metadata: Metadata = { title: "Partner with us" };

export default async function PartnerWithUs({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  return (
    <section className="wrap pb-24 pt-32 md:pb-32 md:pt-44">
      <RiseLines as="h1" immediate delay={0.15} className="font-display text-[clamp(44px,8vw,128px)]" lines={["Partner with us"]} />
      <div className="mt-12 max-w-4xl md:mt-16">
        <PartnerForm typeHint={q.for === "tech" ? "Tech company" : ""} />
      </div>
    </section>
  );
}
