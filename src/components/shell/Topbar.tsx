import type { TournamentMeta } from "@/lib/types";
import { PhasePills } from "./PhasePills";

/**
 * The topbar carries identity, not navigation: tournament name in serif, the
 * current phase in a mono eyebrow, and the phase pills pushed to the right.
 */
export function Topbar({ meta }: { meta: TournamentMeta }) {
  return (
    <header className="flex items-center gap-4 border-b border-line bg-gradient-to-b from-amber/[0.03] to-transparent px-5 py-4 sm:px-6">
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
    </header>
  );
}
