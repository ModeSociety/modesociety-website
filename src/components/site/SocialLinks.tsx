import { INSTAGRAM_URL, LINKEDIN_URL, TIKTOK_URL } from "@/lib/content";
import { InstagramIcon, LinkedInIcon, TikTokIcon } from "./Icons";

const SOCIALS = [
  { href: INSTAGRAM_URL, label: "Instagram", Icon: InstagramIcon },
  { href: TIKTOK_URL, label: "TikTok", Icon: TikTokIcon },
  { href: LINKEDIN_URL, label: "LinkedIn", Icon: LinkedInIcon },
];

/** Round Instagram / TikTok / LinkedIn buttons in the current text colour. */
export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {SOCIALS.map(({ href, label, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Mode Society on ${label}`} className="social-icon">
          <Icon />
        </a>
      ))}
    </div>
  );
}
