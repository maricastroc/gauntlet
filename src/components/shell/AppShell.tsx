import type { ReactNode } from "react";
import type { TournamentMeta } from "@/lib/types";
import { Rail } from "./Rail";
import { Topbar } from "./Topbar";

/**
 * The framed console. Generous page margins let the app float as a single
 * crafted object — bordered, softly shadowed, with a whisper of inset light
 * along the top edge. Goes full-bleed on small screens.
 */
export function AppShell({
  meta,
  children,
}: {
  meta: TournamentMeta;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto min-h-full w-full max-w-[1240px] px-0 py-0 md:px-8 md:py-10">
      <div className="grid overflow-hidden border-line bg-surface md:grid-cols-[62px_1fr] md:rounded-[16px] md:border md:shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_40px_80px_-40px_rgba(0,0,0,0.7),0_2px_6px_rgba(0,0,0,0.4)]">
        <Rail />
        <div className="flex min-w-0 flex-col">
          <Topbar meta={meta} />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
