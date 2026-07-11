import type { OverviewStat } from "@/lib/types";

export function StatTiles({ stats }: { stats: OverviewStat[] }) {
  return (
    <div className="flex gap-2.5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex-1 rounded-sm border border-line bg-surface px-3.5 py-3"
        >
          <div className="font-mono text-[22px] font-bold tabular-nums text-ink">{stat.value}</div>
          <div className="mt-1 text-[11px] leading-tight text-ink-mute">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
