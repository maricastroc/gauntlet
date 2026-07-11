import type { Fixture } from "@/lib/types";
import { Flag } from "@/components/ui/Flag";
import { LiveBadge } from "@/components/ui/LiveBadge";

export function LiveCard({ fixture }: { fixture: Fixture }) {
  return (
    <div className="rounded-md border border-loss/30 bg-linear-to-b from-loss/5 to-surface-2 p-4">
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

        <div className="min-w-15.5 text-center">
          <div className="font-mono text-[22px] font-bold tracking-[0.04em] tabular-nums">
            {fixture.homeScore} – {fixture.awayScore}
          </div>
          {fixture.liveMinute != null && (
            <div className="mt-0.5 font-mono text-[10px] font-semibold tracking-widest text-loss">
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
