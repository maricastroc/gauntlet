import { Fragment } from "react";
import type { Group, StandingRow } from "@/lib/types";
import { formatGoalDifference } from "@/lib/format";
import { Flag } from "@/components/ui/Flag";
import { FormChips } from "./FormChips";

const NUM_COLS: Array<{ key: keyof StandingRow; label: string; hideOnMobile?: boolean }> = [
  { key: "played", label: "P", hideOnMobile: true },
  { key: "won", label: "W", hideOnMobile: true },
  { key: "drawn", label: "D", hideOnMobile: true },
  { key: "lost", label: "L", hideOnMobile: true },
  { key: "goalsFor", label: "GF", hideOnMobile: true },
  { key: "goalsAgainst", label: "GA", hideOnMobile: true },
];

function GoalDifference({ value }: { value: number }) {
  const cls = value > 0 ? "text-win" : value < 0 ? "text-loss" : "text-ink-dim";
  return <span className={cls}>{formatGoalDifference(value)}</span>;
}

function Row({ row, qualified }: { row: StandingRow; qualified: boolean }) {
  return (
    <tr className="group transition-colors duration-150 hover:bg-white/[0.015]">
      <td className="relative w-9 py-3 text-left font-mono text-[13px]">
        {qualified && (
          <span className="absolute -left-1 bottom-1.5 top-1.5 w-[3px] rounded-full bg-amber sm:-left-0.5" />
        )}
        <span className={qualified ? "font-bold text-amber-ink" : "text-ink-mute"}>
          {row.position}
        </span>
      </td>

      <td className="whitespace-nowrap py-3 pl-1 text-left">
        <span className="flex items-center gap-2.5">
          <Flag team={row.team} className="text-[17px]" />
          <span className="text-[15px] font-medium text-ink">{row.team.name}</span>
        </span>
      </td>

      {NUM_COLS.map((col) => (
        <td
          key={col.key}
          className={`py-3 text-right font-mono text-[14px] text-ink-dim ${
            col.hideOnMobile ? "hidden sm:table-cell" : ""
          }`}
        >
          {row[col.key] as number}
        </td>
      ))}

      <td className="py-3 text-right font-mono text-[14px]">
        <GoalDifference value={row.goalDifference} />
      </td>

      <td className="py-3 pl-4 text-right font-mono text-[15px] font-bold text-ink">
        {row.points}
      </td>

      <td className="hidden py-3 pl-4 text-right md:table-cell">
        <span className="inline-flex justify-end">
          <FormChips form={row.form} />
        </span>
      </td>
    </tr>
  );
}

/**
 * A group table that reads like broadcast graphics, not a spreadsheet: mono
 * figures, hairline rows, an amber rail marking the qualification zone, and a
 * dashed line drawn exactly at the cut.
 */
export function StandingsTable({ group }: { group: Group }) {
  const totalCols = 3 + NUM_COLS.length + 3; // pos, club, ...nums, gd, pts, form

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse tabular-nums">
        <thead>
          <tr className="[&_th]:pb-3 [&_th]:font-mono [&_th]:text-[10.5px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-ink-mute">
            <th className="w-9 text-left">#</th>
            <th className="pl-1 text-left">Club</th>
            {NUM_COLS.map((col) => (
              <th
                key={col.key}
                className={`text-right ${col.hideOnMobile ? "hidden sm:table-cell" : ""}`}
              >
                {col.label}
              </th>
            ))}
            <th className="text-right">GD</th>
            <th className="pl-4 text-right">Pts</th>
            <th className="hidden pl-4 text-right md:table-cell">Form</th>
          </tr>
        </thead>
        <tbody className="[&_td]:border-t [&_td]:border-line [&_tr:first-child_td]:border-t-0">
          {group.standings.map((row, index) => {
            const qualified = index < group.qualifyCount;
            const isCutRow = index + 1 === group.qualifyCount;
            const hasMore = index + 1 < group.standings.length;
            return (
              <Fragment key={row.team.id}>
                <Row row={row} qualified={qualified} />
                {isCutRow && hasMore && (
                  <tr aria-hidden="true">
                    <td colSpan={totalCols} className="border-t-0 !py-2">
                      <span className="flex items-center gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
                          Qualification line
                        </span>
                        <span className="h-px flex-1 bg-[repeating-linear-gradient(90deg,var(--color-amber-line)_0_6px,transparent_6px_12px)]" />
                      </span>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
