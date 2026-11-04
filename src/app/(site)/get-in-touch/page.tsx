import type { Metadata } from "next";
import PageRender from "@/components/builder/PageRender";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = pageMetadata("contact");

export default async function GetInTouchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("contact")} />
      <PageRender page="contact" content={await getSiteContent()} query={query} />
    </>
  );
}
