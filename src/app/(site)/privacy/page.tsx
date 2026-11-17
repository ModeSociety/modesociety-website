import type { Metadata } from "next";
import PrivacyPolicy from "@/components/legal/PrivacyPolicy";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("privacy");

/** Mode Society's privacy policy (src/lib/privacy.ts). */
export default function PrivacyPage() {
  return <PrivacyPolicy side="talent" />;
}
