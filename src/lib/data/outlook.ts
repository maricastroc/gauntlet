import { forecastGroup } from "@/lib/forecast/groups";
import type { RawMatch } from "@/lib/standings";
import type { FixtureDetail, Group, GroupDetail } from "@/lib/types";

function toRawMatch(fixture: FixtureDetail): RawMatch | null {
  if (!fixture.home || !fixture.away || fixture.homeScore == null || fixture.awayScore == null) {
    return null;
  }
  return {
    homeId: fixture.home.id,
    awayId: fixture.away.id,
    homeScore: fixture.homeScore,
    awayScore: fixture.awayScore,
  };
}

export function attachOutlook(
  group: Group,
  detail: GroupDetail | undefined,
  tournamentId: number,
): Group {
  const remaining = (detail?.fixtures ?? [])
    .filter((fixture) => fixture.status !== "finished" && fixture.home && fixture.away)
    .map((fixture): [number, number] => [fixture.home!.id, fixture.away!.id]);

  if (remaining.length === 0) {
    return {
      ...group,
      standings: group.standings.map((row, index) => ({
        ...row,
        advanceProb: index < group.qualifyCount ? 1 : 0,
        outlook: index < group.qualifyCount ? ("clinched" as const) : ("eliminated" as const),
      })),
    };
  }

  const played = (detail?.fixtures ?? [])
    .map(toRawMatch)
    .filter((match): match is RawMatch => match !== null);

  const forecast = forecastGroup({
    key: `${tournamentId}:${group.id}:${played.length}`,
    teams: detail?.teams ?? group.standings.map((row) => row.team),
    played,
    remaining,
    qualifyCount: group.qualifyCount,
  });

  return {
    ...group,
    standings: group.standings.map((row) => ({
      ...row,
      advanceProb: forecast.advanceProb.get(row.team.id) ?? 0,
      outlook: forecast.outlook.get(row.team.id) ?? "contending",
    })),
  };
}

export function attachOutlookToGroups(
  groups: Group[],
  consoleGroups: GroupDetail[],
  tournamentId: number,
): Group[] {
  const detailById = new Map(consoleGroups.map((group) => [group.id, group]));
  return groups.map((group) => attachOutlook(group, detailById.get(group.id), tournamentId));
}
