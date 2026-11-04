import type { Metadata } from "next";
import PageRender from "@/components/builder/PageRender";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = pageMetadata("services");

export default async function ServicesPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("services")} />
      <PageRender page="services" content={await getSiteContent()} />
    </>
  );
}
