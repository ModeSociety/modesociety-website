import type { Metadata } from "next";
import PageRender from "@/components/builder/PageRender";
import { getSiteContent } from "@/lib/backend";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const base = pageMetadata("home");
  const { images } = await getSiteContent();
  const share = images["meta.share"]?.[0];
  if (!share) return base;
  const img = { url: share.src, alt: share.alt || "Mode Society" };
  return { ...base, openGraph: { ...base.openGraph, images: [img] }, twitter: { ...base.twitter, images: [img.url] } };
}

/** The home page: its blocks are laid out in the admin panel (Pages), as designed until changed. */
export default async function Home() {
  return <PageRender page="home" content={await getSiteContent()} />;
}
