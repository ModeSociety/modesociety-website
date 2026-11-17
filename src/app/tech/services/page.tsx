import type { Metadata } from "next";
import PageRender from "@/components/builder/PageRender";
import { getSiteContent } from "@/lib/backend";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("techServices");

/** ModeSociety Tech's services and prices (modesocietytech.com/services once the domains split). */
export default async function TechServices() {
  return <PageRender page="techServices" content={await getSiteContent()} />;
}
