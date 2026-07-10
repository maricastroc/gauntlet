import type { ReactNode } from "react";

/**
 * Re-mounts on every navigation, so each screen enters with a gentle rise —
 * the "animated page changes" from the brief, at 500ms and reduced-motion safe.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}
