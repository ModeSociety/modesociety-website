/** Small shared pieces for the ModeSociety Tech pages. */

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`tech-mono text-[11px] uppercase text-[#8c95a5] ${className}`}>{children}</p>;
}

/** Condensed headline with an optional line of supporting copy, as in the mocks ("WHAT WE RUN."). */
export function SectionTitle({
  title,
  lead,
  eyebrow,
  className = "",
  size = "lg",
}: {
  title: React.ReactNode;
  lead?: React.ReactNode;
  eyebrow?: string;
  className?: string;
  size?: "lg" | "xl";
}) {
  return (
    <div className={className}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h2 className={`tech-display text-white ${size === "xl" ? "text-[clamp(56px,9vw,150px)]" : "text-[clamp(44px,6.4vw,104px)]"}`}>{title}</h2>
      {lead && <p className="mt-5 max-w-2xl text-[clamp(16px,1.3vw,19px)] leading-relaxed text-[#aab2c0]">{lead}</p>}
    </div>
  );
}

/** Marks placeholder content ("Sample cards for layout. Not real creators."). */
export function SampleTag({ children = "Sample" }: { children?: React.ReactNode }) {
  return (
    <span className="tech-mono inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase text-[#f5c35c] shadow-[inset_0_0_0_1px_rgba(245,195,92,0.6)] [border-style:dashed]">
      {children}
    </span>
  );
}

/** Two softly drifting light beams for the background of a section. */
export function Beams({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="t-beam left-[8%]" style={{ ["--r" as string]: "16deg" }} />
      <div className="t-beam right-[12%]" style={{ ["--r" as string]: "-10deg", animationDelay: "-6s" }} />
    </div>
  );
}
