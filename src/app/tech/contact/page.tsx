import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageRender from "@/components/builder/PageRender";
import JsonLd from "@/components/site/JsonLd";
import { getSiteContent } from "@/lib/backend";
import { techMode } from "@/lib/techMode";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("techContact");

export default async function TechContact({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  // before launch the forms are on the landing page
  if ((await techMode()).landing) redirect(query.as === "creator" ? "/tech#apply" : "/tech#enquire");
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("techContact")} />
      <PageRender page="techContact" content={await getSiteContent()} query={query} />
    </>
  );
}
