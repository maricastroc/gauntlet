import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TitleOdd } from "@/lib/types";
import { formatProbability } from "@/lib/format";
import { Flag } from "@/components/ui/Flag";

export function TitleRaceTeaser({ odds }: { odds: TitleOdd[] }) {
  const top = odds.slice(0, 3);
  if (top.length === 0) return null;
  const max = top[0].prob || 1;

  return (
    <div className="rounded-[11px] border border-line bg-surface-2 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
          Title race
        </span>
        <Link
          href="/bracket"
          className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-amber-ink transition-colors hover:text-amber"
        >
          Full forecast
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <ul className="flex flex-col gap-2.5">
        {top.map((odd) => (
          <li key={odd.team.id} className="flex items-center gap-2.5">
            <Flag team={odd.team} className="w-5 text-[15px]" />
            <span className="w-20 shrink-0 truncate text-[13px] text-ink">{odd.team.name}</span>
            <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber/60 to-amber"
                style={{ width: `${Math.max(4, (odd.prob / max) * 100)}%` }}
              />
            </span>
            <span className="w-9 shrink-0 text-right font-mono text-[12px] tabular-nums text-amber-ink">
              {formatProbability(odd.prob)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
