import type { PageId } from "@/lib/builder";
import type { SiteContent } from "@/lib/slots";

/** What a designed section gets to draw itself with. */
export type Ctx = {
  c: SiteContent;
  page: PageId;
  /** the page's query string (?form=brands, ?for=tech, ?as=creator) */
  q: Record<string, string | string[] | undefined>;
  /** ModeSociety Tech is still just its landing page for this visitor */
  landing: boolean;
  /** whether the page has a block of this type showing */
  has: (type: string) => boolean;
};

export type Feature = {
  /** whether it has anything to show */
  shows?: (x: Ctx) => boolean;
  render: (x: Ctx) => React.ReactNode;
};
