import type { RoadStep, Team } from "@/lib/types";
import { Flag } from "@/components/ui/Flag";

export function ChampionRoad({ champion, road }: { champion: Team; road: RoadStep[] }) {
  if (road.length === 0) return null;

  return (
    <div>
      <div className="mb-3.5 flex items-center gap-2.5">
        <span className="eyebrow">Road to the title</span>
        <span className="rounded-[5px] border border-amber-line px-1.5 py-px font-mono text-[11px] uppercase tracking-[0.08em] text-amber-ink">
          {champion.name}
        </span>
      </div>
      <ol className="flex flex-col">
        {road.map((step, index) => (
          <li
            key={`${step.roundLabel}-${index}`}
            className="flex items-center gap-3 border-t border-line py-2.5 first:border-t-0"
          >
            <span className="w-24 shrink-0 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-mute">
              {step.roundLabel}
            </span>
            <span className="text-[13px] text-ink-dim">beat</span>
            <span className="flex min-w-0 flex-1 items-center gap-2 text-[15px] text-ink">
              <Flag team={step.opponent} className="text-[16px]" />
              <span className="truncate">{step.opponent.name}</span>
            </span>
            <span className="shrink-0 font-mono text-[14px] tabular-nums text-win">
              {step.score}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
