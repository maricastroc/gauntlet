import type { Fixture } from "@/lib/types";
import { Flag } from "@/components/ui/Flag";
import { LiveBadge } from "@/components/ui/LiveBadge";

/**
 * The match on the pitch right now — the first thing that needs attention.
 * A soft loss-red wash sets it apart from the scheduled cards below.
 */
export function LiveCard({ fixture }: { fixture: Fixture }) {
  return (
    <div className="rounded-[11px] border border-loss/30 bg-gradient-to-b from-loss/[0.05] to-surface-2 p-4">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
          {fixture.groupName}
        </span>
        <LiveBadge />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2.5 text-[15px] font-semibold">
          <Flag team={fixture.home} className="text-[22px]" />
          <span className="truncate">{fixture.home.name}</span>
        </div>

        <div className="min-w-[62px] text-center">
          <div className="font-mono text-[22px] font-bold tracking-[0.04em] tabular-nums">
            {fixture.homeScore} – {fixture.awayScore}
          </div>
          {fixture.liveMinute != null && (
            <div className="mt-0.5 font-mono text-[10px] font-semibold tracking-[0.1em] text-loss">
              {fixture.liveMinute}&apos;
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-row-reverse items-center gap-2.5 text-right text-[15px] font-semibold">
          <Flag team={fixture.away} className="text-[22px]" />
          <span className="truncate">{fixture.away.name}</span>
        </div>
      </div>
    </div>
  );
}
