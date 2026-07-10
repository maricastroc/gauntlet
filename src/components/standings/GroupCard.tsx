import type { Group } from "@/lib/types";
import { StandingsTable } from "./StandingsTable";
import { TiebreakNote } from "./TiebreakNote";

/** One group, framed: label, its table, and the tiebreak note when relevant. */
export function GroupCard({ group }: { group: Group }) {
  return (
    <section className="rounded-[11px] border border-line bg-surface-2/60 p-5">
      <header className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2.5">
          <span className="eyebrow">Group</span>
          <span className="rounded-[5px] border border-amber-line px-1.5 py-px font-mono text-[11px] uppercase tracking-[0.08em] text-amber-ink">
            {group.name}
          </span>
        </p>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-mute">
          top {group.qualifyCount} advance
        </span>
      </header>

      <StandingsTable group={group} />

      {group.tiebreakNote && <TiebreakNote note={group.tiebreakNote} />}
    </section>
  );
}
