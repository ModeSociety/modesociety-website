import type { Metadata } from "next";
import PageRender from "@/components/builder/PageRender";
import { getSiteContent } from "@/lib/backend";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("techHouseRules");

/** ModeSociety Tech's House rules (modesocietytech.com/house-rules once the domains split). */
export default async function TechHouseRules() {
  return <PageRender page="techHouseRules" content={await getSiteContent()} />;
}
