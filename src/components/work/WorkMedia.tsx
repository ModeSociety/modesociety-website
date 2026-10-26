import type { SiteImage } from "@/lib/slots";
import LazyVideo from "./LazyVideo";
import { responsive } from "@/lib/img";

/** One piece of work: a photo, or a muted looping video, with film grain over it. */
export default function WorkMedia({
  item,
  className = "",
  eager = false,
  sizes = "(max-width: 767px) 50vw, 30vw",
}: {
  item: SiteImage;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`grain overflow-hidden bg-paper-2 ${className}`}>
      {item.type === "video" ? (
        <LazyVideo src={item.src} label={item.alt} className="h-full w-full object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img {...responsive(item.src, sizes)} alt={item.alt} loading={eager ? "eager" : "lazy"} className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />
      )}
    </div>
  );
}

/** "001", "002"… */
export const workNo = (i: number) => String(i + 1).padStart(3, "0");
