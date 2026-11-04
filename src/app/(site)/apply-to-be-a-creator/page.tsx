import type { Metadata } from "next";
import PageRender from "@/components/builder/PageRender";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = pageMetadata("talent");

export default async function ForTalent() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("talent")} />
      <PageRender page="talent" content={await getSiteContent()} />
    </>
  );
}
