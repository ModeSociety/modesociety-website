import type { Metadata } from "next";
import PageRender from "@/components/builder/PageRender";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = pageMetadata("work");

export default async function OurWork() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("work")} />
      <PageRender page="work" content={await getSiteContent()} />
    </>
  );
}
