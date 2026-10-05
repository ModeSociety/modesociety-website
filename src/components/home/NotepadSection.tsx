"use client";

import { useEffect, useRef, useState } from "react";
import Notepad from "./Notepad";

/** "Not your average talent agency." on its own: the pad pages itself once it scrolls into view. */
export default function NotepadSection() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="flex justify-center overflow-hidden py-20 md:py-28">
      <div style={{ ["--pad-w" as string]: "min(86vw, 560px)" }}>
        <Notepad autoFlip={inView} />
      </div>
    </section>
  );
}
