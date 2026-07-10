import type { StandingRow } from "@/lib/types";
import { describeMove } from "@/lib/console";
import { Flag } from "@/components/ui/Flag";

interface ConsequenceTableProps {
  groupName: string;
  dirty: boolean;
  base: StandingRow[];
  preview: StandingRow[];
  previewKey: string;
}

export function ConsequenceTable({
  groupName,
  dirty,
  base,
  preview,
  previewKey,
}: ConsequenceTableProps) {
  const baseById = new Map(base.map((row) => [row.team.id, row]));

  return (
    <div className="min-w-0 px-5 pt-2 pb-6 sm:px-6">
      <p className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-amber">
        ◆ Consequence · Group {groupName}
      </p>
      <p className="mb-4 text-[12.5px] text-ink-mute">
        {dirty
          ? "Reordered on confirm. Preview before saving:"
          : "Live table from the results so far."}
      </p>

      <div
        key={previewKey}
        className="overflow-hidden rounded-md border border-line bg-surface motion-safe:animate-rise"
      >
        {preview.map((row) => {
          const move = describeMove(baseById.get(row.team.id), row);
          return (
            <div
              key={row.team.id}
              className={[
                "grid grid-cols-[26px_1fr_auto_auto] items-center gap-3 border-t border-line px-4 py-3 tabular-nums first:border-t-0",
                move.dir === "up" && "bg-win/5",
                move.dir === "down" && "bg-loss/5",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="font-mono text-[13px] text-ink-mute">{row.position}</span>
              <span className="flex items-center gap-2.5 text-[14px] font-semibold">
                <Flag team={row.team} className="text-[17px]" />
                <span className="truncate">{row.team.name}</span>
              </span>
              <span
                className={[
                  "flex items-center gap-1 font-mono text-[12px]",
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
              <span className="font-mono text-[14px] font-bold text-ink">{row.points}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
