"use client";

import { useEffect, useState } from "react";

/**
 * Shown to an admin browsing the site in preview (after using the page builder): drafts are showing,
 * not what visitors see. Hidden inside the builder's own preview frame.
 */
export default function PreviewBar() {
  const [top, setTop] = useState(false);
  const [path, setPath] = useState("/");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- only known in the browser
    setTop(window.top === window.self);
    setPath(location.pathname);
  }, []);
  if (!top) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[150] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-[#141010] px-4 py-2.5 text-center text-[13px] text-white">
      <span>
        <strong>Preview.</strong> You&apos;re seeing unpublished changes from the admin panel. Visitors don&apos;t see them until they&apos;re published.
      </span>
      {/* a full page load, so nothing from the preview is kept in the browser's page cache */}
      <a href={`/api/admin/preview?off&to=${encodeURIComponent(path)}`} className="underline underline-offset-4">
        Exit preview
      </a>
    </div>
  );
}
