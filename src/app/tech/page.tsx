import type { Metadata } from "next";
import PageRender from "@/components/builder/PageRender";
import { getSiteContent } from "@/lib/backend";
import { pageMetadata } from "@/lib/seo";
import { techMode } from "@/lib/techMode";

export const metadata: Metadata = pageMetadata("techHome");

/**
 * The Tech home page. Before launch it is the whole public site (`landing`): the hero, the
 * intro film, who we are, what we run, the 18+ policy, both enquiry forms and the FAQ, with
 * no links to the pages still being built. After launch it adds the logos and the roster.
 */
export default async function TechHome() {
  const { landing } = await techMode();
  return <PageRender page="techHome" content={await getSiteContent()} landing={landing} />;
}
