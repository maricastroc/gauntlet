/**
 * Helpers shared by the demo and live data sources.
 */

import { formatGoalDifference } from "@/lib/format";
import type { StandingRow, Team, TiebreakNote } from "@/lib/types";
import { TEAMS } from "./copa-atlas";

/** Group ids 1..4 map to A..D in the seeder; the standings endpoint omits the name. */
export const GROUP_IDS = [1, 2, 3, 4] as const;
const GROUP_NAMES: Record<number, string> = { 1: "A", 2: "B", 3: "C", 4: "D" };

export function groupName(id: number): string {
  return GROUP_NAMES[id] ?? String(id);
}

/**
 * Enrich an API team (`{ id, name }`, name in Portuguese) to an English name
 * with flag + code from the catalog. Falls back to what the API sent for any
 * team the catalog doesn't know.
 */
export function enrichTeam(team: Team): Team {
  const known = TEAMS[team.id];
  return known ? { ...known } : team;
}

export function enrichStanding(row: StandingRow): StandingRow {
  return { ...row, team: enrichTeam(row.team) };
}

/** Which criterion actually separates two teams level on points. */
function separator(a: StandingRow, b: StandingRow): string {
  if (a.goalDifference !== b.goalDifference) {
    return `goal difference — ${formatGoalDifference(a.goalDifference)} × ${formatGoalDifference(b.goalDifference)}`;
  }
  if (a.goalsFor !== b.goalsFor) {
    return `goals scored — ${a.goalsFor} × ${b.goalsFor}`;
  }
  return "the head-to-head record";
}

/** Explain the top-of-table tiebreak, when the top two are level on points. */
export function buildTiebreakNote(standings: StandingRow[]): TiebreakNote | undefined {
  const [first, second] = standings;
  if (!first || !second || first.points !== second.points) return undefined;

  return {
    teams: [first.team.name, second.team.name],
    points: first.points,
    detail:
      `${first.team.name} and ${second.team.name} both finished on ${first.points} pts. ` +
      `${first.team.name} stays ahead on ${separator(first, second)}.`,
  };
}
