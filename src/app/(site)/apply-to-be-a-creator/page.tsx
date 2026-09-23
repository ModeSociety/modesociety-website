import type { Metadata } from "next";
import FormPage from "@/components/forms/FormPage";
import TalentForm from "@/components/forms/TalentForm";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = { title: "Apply as talent" };

export default async function Apply() {
  const { images } = await getSiteContent();
  return (
    <FormPage
      eyebrow="For talent"
      image={images["talent.hero"]?.[0]}
      title={["Thinking of", <span key="t" className="font-serif italic tracking-normal">signing?</span>]}
      intro={
        <>
          Mode Society represents models, influencers and UGC creators across beauty, wellness, fashion, gaming and tech,
          connecting talent with campaigns that suit their aesthetic, not just their follower count. Whether you&apos;re just
          starting out or already have a portfolio behind you, we want to hear from you.
        </>
      }
    >
      <TalentForm />
    </FormPage>
  );
}
