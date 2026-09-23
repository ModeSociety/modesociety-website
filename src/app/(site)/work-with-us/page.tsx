import type { Metadata } from "next";
import BrandForm from "@/components/forms/BrandForm";
import FormPage from "@/components/forms/FormPage";
import { getSiteContent } from "@/lib/backend";

export const metadata: Metadata = { title: "Work with us" };

export default async function WorkWithUs() {
  const { images } = await getSiteContent();
  return (
    <FormPage
      eyebrow="For brands"
      image={images["brands.hero"]?.[0]}
      title={["Let's work", <span key="t" className="font-serif italic tracking-normal">together.</span>]}
      intro={
        <>
          If you&apos;re interested in working with us, complete the form with a few details about your brand. If it feels like
          the right fit, our team will get in touch to book a call.
        </>
      }
    >
      <BrandForm />
    </FormPage>
  );
}
