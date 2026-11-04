import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageRender from "@/components/builder/PageRender";
import JsonLd from "@/components/site/JsonLd";
import { getSiteContent } from "@/lib/backend";
import { techMode } from "@/lib/techMode";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("techBrands");

export default async function TechBrands() {
  // not public until ModeSociety Tech is launched (admins can preview it)
  if ((await techMode()).landing) redirect("/tech");
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("techBrands")} />
      <PageRender page="techBrands" content={await getSiteContent()} />
    </>
  );
}
