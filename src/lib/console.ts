import type { GroupDetail, QualificationOutlook, StandingRow } from "@/lib/types";
import type { RawMatch } from "@/lib/standings";
import { formatGoalDifference, ordinal } from "@/lib/format";

export interface Move {
  dir: "up" | "down" | "none";
  text: string;
}

export function groupRawMatches(
  group: GroupDetail,
  override?: { id: number; home: number; away: number },
): RawMatch[] {
  return group.fixtures.flatMap((fixture) => {
    if (!fixture.home || !fixture.away) return [];
    if (override && fixture.id === override.id) {
      return [
        {
          homeId: fixture.home.id,
          awayId: fixture.away.id,
          homeScore: override.home,
          awayScore: override.away,
        },
      ];
    }
    if (fixture.status === "finished" && fixture.homeScore != null && fixture.awayScore != null) {
      return [
        {
          homeId: fixture.home.id,
          awayId: fixture.away.id,
          homeScore: fixture.homeScore,
          awayScore: fixture.awayScore,
        },
      ];
    }
    return [];
  });
}

export function describeMove(base: StandingRow | undefined, next: StandingRow): Move {
  if (!base) return { dir: "none", text: "—" };
  if (next.position < base.position)
    return { dir: "up", text: `${ordinal(base.position)} → ${ordinal(next.position)}` };
  if (next.position > base.position)
    return { dir: "down", text: `${ordinal(base.position)} → ${ordinal(next.position)}` };
  if (next.goalDifference !== base.goalDifference)
    return {
      dir: next.goalDifference > base.goalDifference ? "up" : "down",
      text: `GD ${formatGoalDifference(base.goalDifference)}→${formatGoalDifference(next.goalDifference)}`,
    };
  if (next.points !== base.points)
    return {
      dir: next.points > base.points ? "up" : "down",
      text: `${base.points}→${next.points} pts`,
    };
  return { dir: "none", text: `held ${ordinal(next.position)}` };
}

/**
 * A not-yet-played match still decides qualification if at least one team's fate is
 * open. If both are already settled (clinched or eliminated), it is a dead rubber:
 * its result cannot change who advances.
 */
export function matchDecidesQualification(
  outlook: Map<number, QualificationOutlook> | null,
  homeId: number | undefined,
  awayId: number | undefined,
): boolean {
  if (!outlook || homeId === undefined || awayId === undefined) return false;
  return outlook.get(homeId) === "contending" || outlook.get(awayId) === "contending";
}
