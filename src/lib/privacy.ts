/**
 * The privacy policy of each business (SP-129): Mode Society at /privacy, ModeSociety Tech at
 * /tech/privacy (modesocietytech.com/privacy once split). One text, with each business's own name,
 * contact address and website, written to the Australian Privacy Principles. It describes what the
 * website and its backend actually do (forms, uploads, the Sheet and Drive, PandaDoc, visit counting);
 * keep it in step when they change. Asha checks the wording before it goes live.
 */
import type { Side } from "./side";

export const PRIVACY_UPDATED = "18 November 2026";

type Biz = { name: string; email: string; site: string; who: string };
const BIZ: Record<Side, Biz> = {
  talent: { name: "Mode Society", email: "admin@modesociety.com.au", site: "modesociety.com.au", who: "creators, models and influencers" },
  tech: { name: "ModeSociety Tech", email: "admin@modesocietytech.com", site: "modesocietytech.com", who: "streamers, content creators and esports athletes" },
};

export type PrivacySection = { heading: string; paras: string[]; list?: string[] };

export function privacyPolicy(side: Side): { title: string; intro: string; sections: PrivacySection[] } {
  const b = BIZ[side];
  return {
    title: "Privacy Policy",
    intro: `${b.name} is run by Mode Society Pty Ltd in Melbourne, Australia ("we", "us"). This policy explains how we handle personal information when you use ${b.site}, apply to be represented, book a service, enquire as a brand or sign a contract with us. We follow the Privacy Act 1988 (Cth) and the Australian Privacy Principles.`,
    sections: [
      {
        heading: "What we collect",
        paras: ["We only collect what we need for the purposes below. Depending on how you deal with us, this can include:"],
        list: [
          "Creator applications: your legal and creator names, email, mobile number, date of birth (and, if you're under 18, your parent or guardian's name and contact details), country and region, postal address, photos of you, your social media accounts with follower counts and audience statistics, your media kit, the work you're open to, past collaborations, any current agency, how you heard about us and the representation you choose.",
          "The record of your agreement to our application terms: the date and time, the version of the terms and the IP address your application was sent from.",
          side === "tech"
            ? "Brand enquiries: your name, role, company, work email, phone number, website, and the details of your campaign, including any brief or deck you upload."
            : "Brand enquiries: your name, your brand, email, website or Instagram, and the details of your project, budget and timeline.",
          "Service bookings: your name, email, whether you're a creator or a brand, your socials or website, your goals and the service you book.",
          "Signed creators: your contract, signature and the payment and tax details you give in it (such as your ABN, GST status and bank or PayPal details).",
          "Emails and messages you send us.",
          "Website visits: the page viewed, the site or campaign that sent you, your country (from our hosting provider), the type of device, and two random identifiers kept in your browser to count visitors and visits. We don't use cookies or third-party trackers for this, we don't record IP addresses for visits, and we don't count browsers that send Do Not Track.",
        ],
      },
      {
        heading: "How we collect it",
        paras: [
          "Mostly from you: through the forms on our website, by email, and through PandaDoc when you sign a contract. Your application is saved in your own browser as you fill it in, so you can come back to it; it's removed once you send it. We may also look at your public social media profiles to check the details you give us.",
        ],
      },
      {
        heading: "Why we use it",
        paras: ["We use your personal information to:"],
        list: [
          "assess your application, and contact you about it;",
          "respond to enquiries and bookings, and confirm and invoice services;",
          "prepare, send and manage contracts, including the renewal reminders our contracts promise;",
          `represent you if you sign with us: pitching you to brands, negotiating and running campaigns, invoicing and paying you, and managing our talent database of ${b.who};`,
          "send you creator tips and opportunities by email, only if you ask us to (every email lets you unsubscribe);",
          "keep our website secure, stop spam, and understand which pages are useful.",
        ],
      },
      {
        heading: "Photos and uploads",
        paras: [
          "Photos, media kits and briefs you upload are stored privately in our Google Drive. Only our team can see them; they aren't published on the website. Files uploaded to a form that is never sent are deleted automatically within two days.",
        ],
      },
      {
        heading: "Who we share it with",
        paras: [
          "If you sign with us, we share your profile, social media statistics and the content you create with the brands and clients we pitch you to and run campaigns with. We don't sell personal information.",
          "We also use service providers who handle information for us: Google (Workspace: email, Drive and Sheets, where forms and files are stored), Vercel (the website's hosting) and PandaDoc (contracts and electronic signatures). They may only use it to provide their services to us.",
        ],
      },
      {
        heading: "Storage outside Australia",
        paras: [
          "Google, Vercel and PandaDoc store and process data in data centres outside Australia, including in the United States. Before we use a provider we take reasonable steps to make sure it protects personal information in a way that is consistent with the Australian Privacy Principles.",
        ],
      },
      {
        heading: "How we keep it safe",
        paras: [
          "Our forms, files and contracts are kept in accounts that only our team can sign in to. Payment details stay in your signed contract in PandaDoc and aren't copied into our records or sent by email.",
          "We keep information only as long as we need it: applications and enquiries that don't go ahead may be deleted once they're closed, and the records of signed creators are kept for as long as the contract runs and then as long as the law requires (for example, tax records for five years). Website visit counts are kept for about 13 months.",
        ],
      },
      {
        heading: "Accessing and correcting your information",
        paras: [
          `You can ask for a copy of the personal information we hold about you, or ask us to correct it, by emailing ${b.email}. We'll respond within 30 days. We may need to confirm who you are first.`,
        ],
      },
      {
        heading: "Complaints",
        paras: [
          `If you think we've mishandled your personal information, email ${b.email} and we'll respond within 30 days. If you're not satisfied with our response, you can complain to the Office of the Australian Information Commissioner (OAIC) at www.oaic.gov.au or on 1300 363 992.`,
        ],
      },
      {
        heading: "Changes to this policy",
        paras: [`We'll update this page when how we handle personal information changes. Last updated ${PRIVACY_UPDATED}.`],
      },
      {
        heading: "Contact us",
        paras: [`${b.name}, Mode Society Pty Ltd, Melbourne VIC, Australia. Email: ${b.email}.`],
      },
    ],
  };
}
