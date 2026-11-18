/**
 * The welcome email a creator gets when their contract is completed (SP-123): Asha's templates
 * (Mode_Society_Welcome_Email_Templates, Mode_Society_Tech_Welcome_Email_Templates), word for word,
 * for the business and the contract type. The Creator Growth Guide goes with it as an attachment.
 */
import type { ContractType } from "./contract";
import type { Side } from "./side";

type Biz = { name: string; email: string; site: string; brands: string };
const BIZ: Record<Side, Biz> = {
  talent: { name: "Mode Society", email: "modesociety.com.au", site: "modesociety.com.au", brands: "fashion, beauty and lifestyle brands" },
  tech: { name: "Mode Society Tech", email: "modesocietytech.com", site: "modesocietytech.com", brands: "gaming and tech brands" },
};

/** [heading, text] pairs: the "Here's what happens next" list. */
function steps(b: Biz, type: ContractType): [string, string][] {
  if (type === "Exclusive") {
    return [
      ["Your dedicated email.", `We're setting up your own ${b.name} email, [name]@${b.email}. We'll send it through within the next few days. Once you have it, please add it to the bio and contact button of every social account you run within 3 days.`],
      ["Your onboarding call.", "We'll reach out to book a call to get to know you, your goals and the brands you'd love to work with."],
      ["Your strategy support.", "As an exclusive creator, you get ongoing strategy support from our team at no cost. Any time you have a question about your content or growth, just reach out."],
      ["Brand enquiries.", "From today, please send every brand enquiry you receive (including DMs) to us, so we can negotiate and manage it for you."],
      ["Your Creator Growth Guide.", "Attached is our guide to growing your socials. It's a great place to start before our first call."],
    ];
  }
  return [
    ["Add our email to your bio.", `Within 3 days, please add pr@${b.email} as the contact email in the bio and contact button of every social account you run. This is how brands reach us about you, so it's really important.`],
    [`Your own ${b.name} email.`, `As we grow together, we may set you up with your own [name]@${b.email} address. We'll be in touch if and when that's needed.`],
    ["Brand opportunities.", "When a brand opportunity comes through us that suits you, we'll send you the details to review. Nothing is ever accepted without your approval."],
    ["Your Creator Growth Guide.", "Attached is our guide to growing your socials, packed with practical tips you can use straight away."],
    ["Want extra support?", `If you'd like a tailored strategy call or ongoing growth support, you can book one any time from our Services page on ${b.site}.`],
  ];
}

export function welcomeEmail(side: Side, type: ContractType, firstName: string) {
  const b = BIZ[side];
  const first = firstName.trim() || "there";
  const exclusive = type === "Exclusive";
  const opening = exclusive
    ? `Welcome to ${b.name}! We're so excited to officially have you on our exclusive roster, and we can't wait to start building your next chapter with you.`
    : `Welcome to ${b.name}! We're thrilled to have you on board and can't wait to connect you with ${b.brands} that suit your content.`;
  const closing = [
    `Your signed agreement is saved in your PandaDoc account for your records. If you have any questions${exclusive ? " at all" : ""}, just reply to this email.`,
    exclusive ? "We're really proud to have you with us. Here's to the work ahead!" : "Welcome to the society!",
  ];
  const sign = ["Warm regards,", `The ${b.name} Team`, `pr@${b.email}  |  ${b.site}`];
  const list = steps(b, type);
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return {
    subject: `Welcome to ${b.name}, ${first} 🖤`,
    text: [`Hi ${first},`, opening, "Here's what happens next:", ...list.map(([h, t]) => `${h} ${t}`), ...closing, sign.join("\n")].join("\n\n"),
    html:
      `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:600px">` +
      `<p>Hi ${esc(first)},</p><p>${esc(opening)}</p><p>Here's what happens next:</p><ul>` +
      list.map(([h, t]) => `<li style="margin-bottom:8px"><b>${esc(h)}</b> ${esc(t)}</li>`).join("") +
      `</ul>${closing.map((c) => `<p>${esc(c)}</p>`).join("")}<p>${sign.map(esc).join("<br>")}</p></div>`,
    fromName: b.name,
  };
}
