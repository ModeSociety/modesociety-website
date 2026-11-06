import type { Metadata } from "next";
import PageRender from "@/components/builder/PageRender";
import { getSiteContent } from "@/lib/backend";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("techHome");

/** ModeSociety Tech: one page, laid out in the admin panel (Pages), as designed until changed. */
export default async function TechHome() {
  return <PageRender page="techHome" content={await getSiteContent()} />;
}
