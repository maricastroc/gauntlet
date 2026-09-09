import type { ScenarioProjection, StandingRow } from "@/lib/types";
import { describeMove } from "@/lib/console";
import { Flag } from "@/components/ui/Flag";

interface ProjectedStandingsProps {
  projection: ScenarioProjection;
  baseline: ScenarioProjection;
}

export function ProjectedStandings({ projection, baseline }: ProjectedStandingsProps) {
  const baselineByGroup = new Map(
    baseline.groups.map((group) => [
      group.id,
      new Map(group.standings.map((row) => [row.team.id, row])),
    ]),
  );

  const affected = new Set<number>();
  for (const group of projection.groups) {
    const base = baselineByGroup.get(group.id);
    if (!base) continue;
    const changed = group.standings.some((row) => {
      const before = base.get(row.team.id);
      return (
        before !== undefined &&
        (before.position !== row.position ||
          before.points !== row.points ||
          before.goalDifference !== row.goalDifference)
      );
    });
    if (changed) affected.add(group.id);
  }
  const hasChanges = affected.size > 0;

  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(255px,1fr))]">
      {projection.groups.map((group) => {
        const base = baselineByGroup.get(group.id) ?? new Map<number, StandingRow>();
        const isAffected = affected.has(group.id);
        return (
          <section
            key={group.id}
            className={[
              "rounded-[11px] border p-4 transition-[opacity,border-color] duration-200",
              hasChanges && isAffected
                ? "border-amber-line bg-amber-soft/[0.05]"
                : hasChanges
                  ? "border-line bg-surface-2/40 opacity-45"
                  : "border-line bg-surface-2/60",
            ].join(" ")}
          >
            <header className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2.5">
                {isAffected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-label="changed" />
                )}
                <span className="eyebrow">Group</span>
                <span className="rounded-[5px] border border-amber-line px-1.5 py-px font-mono text-[11px] uppercase tracking-[0.08em] text-amber-ink">
                  {group.name}
                </span>
              </p>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-mute">
                top {group.qualifyCount} advance
              </span>
            </header>

            <div className="overflow-hidden rounded-md border border-line bg-surface">
              {group.standings.map((row) => {
                const move = describeMove(base.get(row.team.id), row);
                const cut = row.position <= group.qualifyCount;
                return (
                  <div
                    key={row.team.id}
                    data-testid="projected-row"
                    data-team={row.team.name}
                    data-position={row.position}
                    className={[
                      "grid grid-cols-[22px_1fr_auto_auto] items-center gap-3 border-t border-line px-3.5 py-2.5 tabular-nums first:border-t-0",
                      move.dir === "up" && "bg-win/5",
                      move.dir === "down" && "bg-loss/5",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span
                      className={[
                        "font-mono text-[12.5px]",
                        cut ? "text-amber-ink" : "text-ink-mute",
                      ].join(" ")}
                    >
                      {row.position}
                    </span>
                    <span className="flex items-center gap-2 text-[13.5px] font-semibold">
                      <Flag team={row.team} className="text-[15px]" />
                      <span className="truncate">{row.team.name}</span>
                    </span>
                    <span
                      className={[
                        "flex items-center gap-1 font-mono text-[11px]",
                        move.dir === "up"
                          ? "text-win"
                          : move.dir === "down"
                            ? "text-loss"
                            : "text-ink-mute",
                      ].join(" ")}
                    >
                      {move.dir === "up" && "▲"}
                      {move.dir === "down" && "▼"}
                      {move.text}
                    </span>
                    <span className="font-mono text-[13px] font-bold text-ink">{row.points}</span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
