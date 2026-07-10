import type { Team } from "@/lib/types";

/**
 * A team's flag — emoji when we have one, otherwise a quiet monospace code
 * chip so the layout never collapses. Decorative; the team name carries the
 * accessible label.
 */
export function Flag({
  team,
  className = "",
}: {
  team: Pick<Team, "flag" | "code" | "name">;
  className?: string;
}) {
  if (team.flag) {
    return (
      <span className={`inline-block leading-none ${className}`} aria-hidden="true">
        {team.flag}
      </span>
    );
  }

  return (
    <span
      className={`inline-grid place-items-center rounded-[5px] border border-line bg-surface-3 px-1 font-mono text-[9px] font-semibold tracking-wide text-ink-mute ${className}`}
      aria-hidden="true"
    >
      {team.code ?? team.name.slice(0, 3).toUpperCase()}
    </span>
  );
}
