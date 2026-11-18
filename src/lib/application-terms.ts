/**
 * Asha's Application Terms & Privacy Collection Notice (version TERMS_VERSION), word for word from
 * Creator_Application_Form_and_Terms in each business folder of her pack. Shown in a pop-up on the
 * application's last step; the version accepted is saved with each application.
 */
import type { Side } from "./side";

export type Terms = {
  intro: string;
  sections: { heading: string; paras: string[] }[];
};

export const APPLICATION_TERMS: Record<Side, Terms> = {
  talent: {
    intro:
      'These terms apply when you submit a creator application to Mode Society Pty Ltd (ABN 32 702 451 349) ("Mode Society", "we", "us") through modesociety.com.au. By ticking the agreement boxes and submitting, you agree to them.',
    sections: [
      {
        heading: "Application only",
        paras: [
          "Submitting an application does not create a representation, agency or employment relationship. Representation only begins when you and Mode Society both sign a talent representation agreement.",
        ],
      },
      {
        heading: "No guarantee",
        paras: [
          "We review every application but do not guarantee that you will be accepted, contacted, represented, offered work or paid. We may decline any application without giving reasons.",
        ],
      },
      {
        heading: "Accurate information",
        paras: [
          "You confirm all information you provide, including follower counts and audience statistics, is true, accurate and your own. We may verify it. If information is false or misleading, we may reject your application or end any later agreement.",
        ],
      },
      {
        heading: "Age and location",
        paras: [
          "You must be 18 or older to apply, or have the consent of a parent or guardian, who must also sign any later agreement. We can only represent creators based in the countries and regions listed on this form. You must tell us your true country of residence, and tell us if you move.",
        ],
      },
      {
        heading: "Image and content consent",
        paras: [
          "You grant Mode Society a worldwide, perpetual, royalty-free, non-exclusive licence to use, store, copy, crop, edit and display: (a) the photos, media kit and other files you upload; and (b) content publicly available on the social media accounts you list. We may use them to assess your application, keep in our talent database, present you to brands and clients as prospective talent, and promote Mode Society on our website, social media and marketing materials.",
          "You confirm you own, or have permission to share, everything you upload. We only share your postal address with brands sending you product. If we do not offer you representation, you can ask us at admin@modesociety.com.au to stop using your images in public-facing Mode Society marketing, and we will do so within 14 days (we may keep internal records). If you later sign with us, your talent agreement governs our use of your content.",
        ],
      },
      {
        heading: "Confidentiality",
        paras: [
          "Any information we share with you during the application process, including commission rates, contract terms and brand details, is confidential. You must not disclose it publicly or to any third party.",
        ],
      },
      {
        heading: "Electronic communications",
        paras: [
          "You agree to receive emails and electronic documents from Mode Society about your application, including contracts sent through PandaDoc for electronic signature.",
        ],
      },
      {
        heading: "Privacy Collection Notice",
        paras: [
          "We collect your personal information (including your name, contact details, date of birth, country of residence, postal address, photos, social media details and audience statistics) to assess your application, contact you, manage our talent database, prepare and send contracts, and, if you are represented, pitch you to brands and run campaigns. We may disclose it to brands and clients, and to our service providers (such as website hosting, email, PandaDoc and cloud storage providers), some of which may store data outside Australia. If you don't provide the required information, we can't assess your application. Our Privacy Policy explains how to access or correct your information and how to make a complaint. Contact: admin@modesociety.com.au.",
        ],
      },
      {
        heading: "General",
        paras: [
          "These terms are governed by the laws of Victoria, Australia. Nothing in them excludes rights you have under the Australian Consumer Law that cannot be excluded.",
        ],
      },
    ],
  },
  tech: {
    intro:
      'These terms apply when you submit a creator application to Mode Society Pty Ltd (ABN 32 702 451 349) trading as Mode Society Tech ("Mode Society Tech", "we", "us") through modesocietytech.com. By ticking the agreement boxes and submitting, you agree to them.',
    sections: [
      {
        heading: "Application only",
        paras: [
          "Submitting an application does not create a representation, agency or employment relationship. Representation only begins when you and Mode Society Tech both sign a talent representation agreement.",
        ],
      },
      {
        heading: "No guarantee",
        paras: [
          "We review every application but do not guarantee that you will be accepted, contacted, represented, offered work or paid. We may decline any application without giving reasons.",
        ],
      },
      {
        heading: "Accurate information",
        paras: [
          "You confirm all information you provide, including follower counts and audience statistics, is true, accurate and your own. We may verify it. If information is false or misleading, we may reject your application or end any later agreement.",
        ],
      },
      {
        heading: "Age and location",
        paras: [
          "You must be 18 or older to apply: Mode Society Tech only represents creators who are 18 or over. We can only represent creators based in the countries and regions listed on this form. You must tell us your true country of residence, and tell us if you move.",
        ],
      },
      {
        heading: "Image and content consent",
        paras: [
          "You grant Mode Society Tech a worldwide, perpetual, royalty-free, non-exclusive licence to use, store, copy, crop, edit and display: (a) the photos, media kit and other files you upload; and (b) content publicly available on the social media accounts you list. We may use them to assess your application, keep in our talent database, present you to brands and clients as prospective talent, and promote Mode Society Tech on our website, social media and marketing materials.",
          "You confirm you own, or have permission to share, everything you upload. We only share your postal address with brands sending you product. If we do not offer you representation, you can ask us at admin@modesocietytech.com to stop using your images in public-facing Mode Society Tech marketing, and we will do so within 14 days (we may keep internal records). If you later sign with us, your talent agreement governs our use of your content.",
        ],
      },
      {
        heading: "Confidentiality",
        paras: [
          "Any information we share with you during the application process, including commission rates, contract terms and brand details, is confidential. You must not disclose it publicly or to any third party.",
        ],
      },
      {
        heading: "Electronic communications",
        paras: [
          "You agree to receive emails and electronic documents from Mode Society Tech about your application, including contracts sent through PandaDoc for electronic signature.",
        ],
      },
      {
        heading: "Privacy Collection Notice",
        paras: [
          "We collect your personal information (including your name, contact details, date of birth, country of residence, postal address, photos, social media details and audience statistics) to assess your application, contact you, manage our talent database, prepare and send contracts, and, if you are represented, pitch you to brands and run campaigns. We may disclose it to brands and clients, and to our service providers (such as website hosting, email, PandaDoc and cloud storage providers), some of which may store data outside Australia. If you don't provide the required information, we can't assess your application. Our Privacy Policy explains how to access or correct your information and how to make a complaint. Contact: admin@modesocietytech.com.",
        ],
      },
      {
        heading: "General",
        paras: [
          "These terms are governed by the laws of Victoria, Australia. Nothing in them excludes rights you have under the Australian Consumer Law that cannot be excluded.",
        ],
      },
    ],
  },
};
