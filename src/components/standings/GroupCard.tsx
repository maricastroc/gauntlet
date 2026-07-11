import type { Group, Team } from "@/lib/types";
import type { RawMatch } from "@/lib/standings";
import { StandingsTable } from "./StandingsTable";
import { TiebreakNote } from "./TiebreakNote";
import { GroupReplay } from "./GroupReplay";

export function GroupCard({
  group,
  teams = [],
  matches = [],
}: {
  group: Group;
  teams?: Team[];
  matches?: RawMatch[];
}) {
  return (
    <section className="rounded-md border border-line bg-surface-2/60 p-5">
      <header className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2.5">
          <span className="eyebrow">Group</span>
          <span className="rounded-[5px] border border-amber-line px-1.5 py-px font-mono text-[11px] uppercase tracking-[0.08em] text-amber-ink">
            {group.name}
          </span>
        </p>
        <span className="font-mono text-[10.5px] uppercase tracking-widest text-ink-mute">
          top {group.qualifyCount} advance
        </span>
      </header>

      <StandingsTable group={group} />

      {group.tiebreakNote && <TiebreakNote note={group.tiebreakNote} />}

      <GroupReplay teams={teams} qualifyCount={group.qualifyCount} matches={matches} />
    </section>
  );
}
