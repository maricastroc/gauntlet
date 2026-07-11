import type { FinalRecap, TieSide } from "@/lib/types";
import { Flag } from "@/components/ui/Flag";

function FinalRow({ side, won }: { side: TieSide; won: boolean }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      {side.team && <Flag team={side.team} className="text-[18px]" />}
      <span className={`flex-1 truncate text-[15px] ${won ? "font-semibold text-ink" : "text-ink-dim"}`}>
        {side.team?.name ?? side.placeholder ?? "—"}
      </span>
      {won && <span aria-hidden="true">🏆</span>}
      <span className={`font-mono text-[15px] tabular-nums ${won ? "text-gold" : "text-ink-dim"}`}>
        {side.score ?? 0}
        {side.penalties != null && <span className="ml-1 text-[11px] text-ink-mute">({side.penalties})</span>}
      </span>
    </div>
  );
}

export function TheFinalCard({ final }: { final: FinalRecap }) {
  const { home, away, decidedByPenalties, roundLabel } = final;
  const homeWon = decidedByPenalties
    ? (home.penalties ?? 0) > (away.penalties ?? 0)
    : (home.score ?? 0) > (away.score ?? 0);

  return (
    <div className="rounded-md border border-line bg-surface-2 p-4">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
        The {roundLabel}
      </div>
      <FinalRow side={home} won={homeWon} />
      <FinalRow side={away} won={!homeWon} />
      {decidedByPenalties && (
        <p className="mt-2.5 border-t border-dashed border-line-2 pt-2.5 text-[12px] text-ink-mute">
          Settled on penalties.
        </p>
      )}
    </div>
  );
}
