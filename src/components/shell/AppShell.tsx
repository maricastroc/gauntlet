import type { ReactNode } from "react";
import type { TournamentMeta } from "@/lib/types";
import { AppTooltip } from "@/components/ui/AppTooltip";
import { Rail } from "./Rail";
import { Topbar } from "./Topbar";

export function AppShell({ meta, children }: { meta: TournamentMeta; children: ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-310 px-0 py-0 md:h-dvh md:px-8 md:py-10">
      <div className="grid overflow-clip border-line bg-surface md:h-full md:grid-cols-[62px_1fr] md:rounded-[16px] md:border md:shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_40px_80px_-40px_rgba(0,0,0,0.7),0_2px_6px_rgba(0,0,0,0.4)]">
        <Rail />
        <div className="flex min-w-0 flex-col md:min-h-0">
          <Topbar meta={meta} />
          <main className="min-w-0 flex-1 md:min-h-0 md:overflow-y-auto">{children}</main>
        </div>
      </div>
      <AppTooltip />
    </div>
  );
}
