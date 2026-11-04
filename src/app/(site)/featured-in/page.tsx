import type { Metadata } from "next";
import PageRender from "@/components/builder/PageRender";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSiteContent } from "@/lib/backend";

export async function generateMetadata(): Promise<Metadata> {
  const { images, press } = await getSiteContent();
  const empty = !(images["press.logos"]?.length ?? 0) && !press.length;
  // an empty "coming soon" page would count against the site in search, so it stays unindexed until press is added
  return pageMetadata("press", empty ? { robots: { index: false, follow: true } } : {});
}

export default async function FeaturedIn() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("press")} />
      <PageRender page="press" content={await getSiteContent()} />
    </>
  );
}
