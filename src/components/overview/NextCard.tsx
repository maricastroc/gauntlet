import type { Fixture } from "@/lib/types";
import { Flag } from "@/components/ui/Flag";

/**
 * The next scheduled match, with the one line of context that makes it matter:
 * what's at stake when it kicks off.
 */
export function NextCard({ fixture }: { fixture: Fixture }) {
  return (
    <div className="rounded-[11px] border border-line bg-surface-2 p-4">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
          {fixture.groupName}
        </span>
        {fixture.kickoff && (
          <span className="font-mono text-[11px] tracking-[0.06em] text-ink-dim">
            {fixture.kickoff}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2.5 text-[15px] font-semibold">
          <Flag team={fixture.home} className="text-[20px]" />
          <span className="truncate">{fixture.home.name}</span>
        </div>
        <span className="font-mono text-[13px] text-ink-mute">×</span>
        <div className="flex flex-1 flex-row-reverse items-center gap-2.5 text-right text-[15px] font-semibold">
          <Flag team={fixture.away} className="text-[20px]" />
          <span className="truncate">{fixture.away.name}</span>
        </div>
      </div>

      {fixture.note && (
        <p className="mt-3.5 border-t border-dashed border-line-2 pt-3.5 text-[12.5px] leading-[1.45] text-ink-mute">
          {fixture.note}
        </p>
      )}
    </div>
  );
}
