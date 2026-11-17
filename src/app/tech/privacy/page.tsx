import type { Metadata } from "next";
import PrivacyPolicy from "@/components/legal/PrivacyPolicy";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("techPrivacy");

/** ModeSociety Tech's privacy policy (modesocietytech.com/privacy once the domains split). */
export default function TechPrivacyPage() {
  return <PrivacyPolicy side="tech" />;
}
