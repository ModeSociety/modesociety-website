import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import PageHead from "@/components/tech/PageHead";
import RosterGrid from "@/components/tech/RosterGrid";
import { SampleTag } from "@/components/tech/ui";
import { getSiteContent } from "@/lib/backend";
import { techMode } from "@/lib/techMode";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { compact, rosterFor, totalFollowers } from "@/lib/tech";

export const metadata: Metadata = pageMetadata("techTalent");

export default async function TechTalent() {
  // not public until ModeSociety Tech is launched (admins can preview it)
  if ((await techMode()).landing) redirect("/tech");
  const { roster } = await getSiteContent();
  const { members, sample } = rosterFor(roster);
  const total = members.reduce((s, m) => s + totalFollowers(m), 0);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd("techTalent")} />
      <PageHead eyebrow="Our talent" title="The roster." ghost="Talent." lead="Streamers, content creators, esports athletes and teams, with their channels and how many people follow them.">
        <div className="flex flex-wrap items-center gap-6 text-[14px] text-t2">
          <span>
            <span className="tech-display text-[28px] text-t">{members.length}</span> {members.length === 1 ? "creator" : "creators"}
          </span>
          {total > 0 && (
            <span>
              <span className="tech-display text-[28px] text-t">{compact(total)}</span> combined followers
            </span>
          )}
          {sample && (
            <span className="flex items-center gap-2">
              <SampleTag /> Sample cards for layout, not real creators.
            </span>
          )}
        </div>
      </PageHead>
      <section className="wrap pb-24 md:pb-32">
        <RosterGrid members={members} sample={sample} />
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-tline pt-8">
          <p className="text-[15px] text-t2">Want one of them on your campaign, or want to join them?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/tech/contact?as=brand" className="btn">
              Brand enquiry
            </Link>
            <Link href="/tech/contact?as=creator" className="btn ghost">
              Apply to sign
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
