import type { Metadata } from "next";
import PageRender from "@/components/builder/PageRender";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = pageMetadata("brands");

export default async function ForBrands() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("brands")} />
      <PageRender page="brands" content={await getSiteContent()} />
    </>
  );
}
