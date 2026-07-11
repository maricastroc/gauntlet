import type { TournamentMeta } from "@/lib/types";
import { DemoReset } from "./DemoReset";
import { PhasePills } from "./PhasePills";
import { UserMenu } from "./UserMenu";

export function Topbar({ meta }: { meta: TournamentMeta }) {
  return (
    <header className="flex items-center gap-4 border-b border-line bg-linear-to-b from-amber/3 to-transparent px-5 py-3 sm:px-6">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2.5 font-serif text-lg font-semibold tracking-[-0.01em]">
          <span className="text-[15px] saturate-[0.9]" aria-hidden="true">
            🏆
          </span>
          <span className="truncate">{meta.name}</span>
        </div>
        <div className="eyebrow tracking-[0.12em]">{meta.phaseLabel}</div>
      </div>

      <div className="flex-1" />

      <PhasePills phases={meta.phases} />
      <DemoReset />
      <div className="ml-1 h-6 w-px bg-line sm:ml-2" />
      <UserMenu />
    </header>
  );
}
