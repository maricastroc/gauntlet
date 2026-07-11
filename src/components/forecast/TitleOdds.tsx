import type { TitleOdd } from "@/lib/types";
import { formatProbability, titleBarWidth } from "@/lib/format";
import { Flag } from "@/components/ui/Flag";

export function TitleOdds({ odds }: { odds: TitleOdd[] }) {
  if (odds.length <= 1) return null;

  const top = odds.slice(0, 8);

  return (
    <section className="px-5 pt-4 sm:px-6">
      <div className="rounded-[11px] border border-line bg-surface-2/60 p-4">
        <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-amber">
            ◆ Title race
          </span>
          <span className="text-[11.5px] text-ink-mute">
            chance to lift the trophy, simulated from the remaining bracket
          </span>
        </div>

        <ul className="flex flex-col gap-2">
          {top.map((odd) => (
            <li key={odd.team.id} className="flex items-center gap-3">
              <Flag team={odd.team} className="w-5 text-[16px]" />
              <span className="w-24 shrink-0 truncate text-[13.5px] text-ink sm:w-32">
                {odd.team.name}
              </span>
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber/60 to-amber"
                  style={{ width: titleBarWidth(odd.prob) }}
                />
              </span>
              <span className="w-11 shrink-0 text-right font-mono text-[13px] tabular-nums text-amber-ink">
                {formatProbability(odd.prob)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
