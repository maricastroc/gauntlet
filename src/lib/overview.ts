import { roundName } from "@/lib/format";
import type {
  Bracket,
  BracketTie,
  Fixture,
  FixtureDetail,
  Group,
  GroupDetail,
  OverviewRecap,
  RoadStep,
  Superlative,
  TieSide,
} from "@/lib/types";

function unsettledScore(group: Group): number {
  return group.standings.reduce((sum, row) => {
    const prob = row.advanceProb ?? (row.qualified ? 1 : 0);
    return sum + prob * (1 - prob);
  }, 0);
}

function cutMargin(group: Group): number {
  const last = group.standings[group.qualifyCount - 1];
  const first = group.standings[group.qualifyCount];
  if (!last || !first) return Number.POSITIVE_INFINITY;
  return (last.points - first.points) * 1000 + (last.goalDifference - first.goalDifference);
}

export function pickFeaturedGroup(groups: Group[]): Group | null {
  if (groups.length === 0) return null;
  return groups
    .map((group) => ({ group, unsettled: unsettledScore(group), margin: cutMargin(group) }))
    .sort((a, b) => b.unsettled - a.unsettled || a.margin - b.margin)[0].group;
}

function nextGroupFixture(consoleGroups: GroupDetail[], featured: Group | null): Fixture | null {
  const ordered = featured
    ? [...consoleGroups].sort((a, b) => Number(b.id === featured.id) - Number(a.id === featured.id))
    : consoleGroups;

  for (const group of ordered) {
    const fixture = group.fixtures.find(
      (candidate) => candidate.status !== "finished" && candidate.home && candidate.away,
    );
    if (fixture?.home && fixture.away) {
      return {
        id: fixture.id,
        home: fixture.home,
        away: fixture.away,
        homeScore: null,
        awayScore: null,
        status: "scheduled",
        groupName: `Group ${group.name} · next up`,
        note: "the next result to move this group",
        version: fixture.version,
      };
    }
  }
  return null;
}

function nextReadyTie(bracket: Bracket): Fixture | null {
  const maxRound = Math.max(...bracket.ties.map((tie) => tie.round), 1);
  const tie = bracket.ties.find(
    (candidate) => candidate.status === "ready" && candidate.home.team && candidate.away.team,
  );
  if (!tie?.home.team || !tie.away.team) return null;

  return {
    id: tie.id,
    home: tie.home.team,
    away: tie.away.team,
    homeScore: null,
    awayScore: null,
    status: "scheduled",
    groupName: `${roundName(tie.round, maxRound)} · next up`,
    note: "both teams confirmed — awaiting kickoff",
    version: 0,
  };
}

export function pickNextFixture(
  consoleGroups: GroupDetail[],
  featured: Group | null,
  bracket: Bracket,
): Fixture | null {
  return nextGroupFixture(consoleGroups, featured) ?? nextReadyTie(bracket);
}

function scoreLine(mine: TieSide, theirs: TieSide, byPenalties: boolean): string {
  const base = `${mine.score ?? 0}–${theirs.score ?? 0}`;
  if (byPenalties && mine.penalties != null && theirs.penalties != null) {
    return `${base} (${mine.penalties}–${theirs.penalties} pens)`;
  }
  return base;
}

function championRoad(bracket: Bracket, maxRound: number): RoadStep[] {
  const championId = bracket.champion?.id;
  if (championId == null) return [];
  return bracket.ties
    .filter((tie) => tie.winnerId === championId)
    .sort((a, b) => a.round - b.round)
    .flatMap((tie) => {
      const mine = tie.home.team?.id === championId ? tie.home : tie.away;
      const theirs = tie.home.team?.id === championId ? tie.away : tie.home;
      if (!theirs.team) return [];
      return [
        {
          roundLabel: roundName(tie.round, maxRound),
          opponent: theirs.team,
          score: scoreLine(mine, theirs, tie.decidedByPenalties),
        },
      ];
    });
}

function finalTie(bracket: Bracket, maxRound: number): BracketTie | null {
  const championId = bracket.champion?.id;
  return (
    bracket.ties.find(
      (tie) =>
        tie.round === maxRound &&
        (tie.home.team?.id === championId || tie.away.team?.id === championId),
    ) ?? null
  );
}

interface Played {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
}

function collectPlayed(groupFixtures: FixtureDetail[], bracket: Bracket): Played[] {
  const fromGroups = groupFixtures.flatMap((fixture) =>
    fixture.home && fixture.away && fixture.homeScore != null && fixture.awayScore != null
      ? [
          {
            home: fixture.home.name,
            away: fixture.away.name,
            homeScore: fixture.homeScore,
            awayScore: fixture.awayScore,
          },
        ]
      : [],
  );
  const fromTies = bracket.ties.flatMap((tie) =>
    tie.home.team && tie.away.team && tie.home.score != null && tie.away.score != null
      ? [
          {
            home: tie.home.team.name,
            away: tie.away.team.name,
            homeScore: tie.home.score,
            awayScore: tie.away.score,
          },
        ]
      : [],
  );
  return [...fromGroups, ...fromTies];
}

function superlatives(groups: Group[], bracket: Bracket, groupFixtures: FixtureDetail[]): Superlative[] {
  const out: Superlative[] = [];
  const rows = groups.flatMap((group) => group.standings).filter((row) => row.played > 0);

  const topAttack = rows.reduce<(typeof rows)[number] | null>(
    (best, row) => (!best || row.goalsFor > best.goalsFor ? row : best),
    null,
  );
  if (topAttack) {
    out.push({
      label: "Best attack",
      team: topAttack.team,
      detail: `${topAttack.goalsFor} scored`,
    });
  }

  const meanestDefense = rows.reduce<(typeof rows)[number] | null>(
    (best, row) => (!best || row.goalsAgainst < best.goalsAgainst ? row : best),
    null,
  );
  if (meanestDefense) {
    out.push({
      label: "Meanest defense",
      team: meanestDefense.team,
      detail: `${meanestDefense.goalsAgainst} conceded`,
    });
  }

  const teamByName = new Map(rows.map((row) => [row.team.name, row.team] as const));
  const biggest = collectPlayed(groupFixtures, bracket).reduce<{ margin: number; text: string; winner: string } | null>(
    (best, match) => {
      const margin = Math.abs(match.homeScore - match.awayScore);
      if (margin === 0 || (best && margin <= best.margin)) return best;
      const homeWon = match.homeScore > match.awayScore;
      const winner = homeWon ? match.home : match.away;
      const loser = homeWon ? match.away : match.home;
      const hi = Math.max(match.homeScore, match.awayScore);
      const lo = Math.min(match.homeScore, match.awayScore);
      return { margin, winner, text: `${hi}–${lo} vs ${loser}` };
    },
    null,
  );
  const biggestTeam = biggest && teamByName.get(biggest.winner);
  if (biggest && biggestTeam) {
    out.push({ label: "Biggest win", team: biggestTeam, detail: biggest.text });
  }

  return out;
}

export function buildRecap(
  bracket: Bracket,
  groups: Group[],
  groupFixtures: FixtureDetail[],
): OverviewRecap | null {
  if (!bracket.champion) return null;
  const maxRound = Math.max(...bracket.ties.map((tie) => tie.round), 1);
  const decider = finalTie(bracket, maxRound);
  return {
    final: decider
      ? {
          roundLabel: roundName(maxRound, maxRound),
          home: decider.home,
          away: decider.away,
          decidedByPenalties: decider.decidedByPenalties,
        }
      : null,
    championRoad: championRoad(bracket, maxRound),
    superlatives: superlatives(groups, bracket, groupFixtures),
  };
}
