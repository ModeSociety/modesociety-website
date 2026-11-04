import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageRender from "@/components/builder/PageRender";
import JsonLd from "@/components/site/JsonLd";
import { getSiteContent } from "@/lib/backend";
import { techMode } from "@/lib/techMode";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("techCreators");

export default async function TechCreators() {
  // not public until ModeSociety Tech is launched (admins can preview it)
  if ((await techMode()).landing) redirect("/tech");
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("techCreators")} />
      <PageRender page="techCreators" content={await getSiteContent()} />
    </>
  );
}
