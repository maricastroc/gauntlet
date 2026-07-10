import { computeStandings, type RawMatch } from "@/lib/standings";
import { forecastGroup } from "@/lib/forecast/groups";
import { titleOddsFrom } from "@/lib/forecast/bracket";
import type {
  Bracket,
  BracketTie,
  Fixture,
  FixtureDetail,
  Group,
  OverviewData,
  TieSide,
  TournamentMeta,
} from "@/lib/types";
import {
  GROUPS,
  KNOCKOUT_STAGE_ID,
  TIES,
  TOURNAMENT,
  groupSeed,
  team,
  type GroupSeed,
  type TieSeed,
} from "./copa-atlas";
import type { GroupDetail } from "@/lib/types";
import { buildTiebreakNote } from "./shared";
import { liveBracket, liveConsoleGroups, liveGroups, liveMeta, liveOverview } from "./live";

const LIVE_ENABLED = process.env.NEXT_PUBLIC_USE_LIVE_API !== "false";
const DEMO_TOURNAMENT_ID = 1;

async function withFallback<T>(live: () => Promise<T>, demo: () => T, label: string): Promise<T> {
  if (!LIVE_ENABLED) return demo();
  try {
    return await live();
  } catch (error) {
    console.warn(
      `[data] live "${label}" failed, using fallback:`,
      error instanceof Error ? error.message : error,
    );
    return demo();
  }
}

function onlyDemo<T>(id: number, build: () => T, empty: T): () => T {
  return () => (id === DEMO_TOURNAMENT_ID ? build() : empty);
}

function demoMeta(): TournamentMeta {
  return {
    id: TOURNAMENT.id,
    name: TOURNAMENT.name,
    status: TOURNAMENT.status,
    phaseLabel: "Knockout · Quarterfinals",
    phases: [
      { key: "groups", label: "Groups", state: "done" },
      { key: "quarters", label: "Quarters", state: "now" },
      { key: "semis", label: "Semis", state: "todo" },
      { key: "final", label: "Final", state: "todo" },
    ],
  };
}

export function getTournamentMeta(id: number): Promise<TournamentMeta> {
  return withFallback(() => liveMeta(id), demoMeta, `meta ${id}`);
}

function demoGroup(seed: GroupSeed): Group {
  const teams = seed.teamIds.map(team);
  const standings = computeStandings(teams, seed.matches, seed.qualifyCount);
  return {
    id: seed.id,
    name: seed.name,
    qualifyCount: seed.qualifyCount,
    standings,
    tiebreakNote: buildTiebreakNote(standings),
  };
}

function demoGroups(): Group[] {
  return GROUPS.map(demoGroup);
}

export function getGroups(id: number): Promise<Group[]> {
  return withFallback(() => liveGroups(id), onlyDemo(id, demoGroups, []), `groups ${id}`);
}

function toSide(
  teamId: number | null,
  sourceLabel: string | undefined,
  score: number | null,
  penalties: number | null | undefined,
): TieSide {
  return {
    team: teamId === null ? null : team(teamId),
    placeholder: sourceLabel,
    score,
    penalties: penalties ?? null,
  };
}

function toBracketTie(seed: TieSeed): BracketTie {
  return {
    id: seed.id,
    round: seed.round,
    slot: seed.slot,
    status: seed.status,
    home: toSide(seed.homeId, seed.homeSourceLabel, seed.homeScore, seed.homePenalties),
    away: toSide(seed.awayId, seed.awaySourceLabel, seed.awayScore, seed.awayPenalties),
    winnerId: seed.winnerId,
    decidedByPenalties: seed.homePenalties != null && seed.awayPenalties != null,
    kickoff: seed.kickoff,
    liveMinute: seed.liveMinute,
  };
}

function demoBracket(): Bracket {
  return { stageId: KNOCKOUT_STAGE_ID, champion: null, ties: TIES.map(toBracketTie) };
}

const EMPTY_BRACKET: Bracket = { stageId: 0, champion: null, ties: [] };

export function getBracket(id: number): Promise<Bracket> {
  return withFallback(
    () => liveBracket(id),
    onlyDemo(id, demoBracket, EMPTY_BRACKET),
    `bracket ${id}`,
  );
}

function demoLiveFixture(): Fixture | null {
  const seed = TIES.find((tie) => tie.status === "live");
  if (!seed || seed.homeId == null || seed.awayId == null) return null;
  return {
    id: seed.id,
    home: team(seed.homeId),
    away: team(seed.awayId),
    homeScore: seed.homeScore,
    awayScore: seed.awayScore,
    status: "live",
    liveMinute: seed.liveMinute,
    groupName: "Quarterfinals · QF3",
    note: "a semifinal spot is on the line",
    version: 0,
  };
}

function demoNextFixture(): Fixture | null {
  const seed = TIES.find((tie) => tie.status === "ready" && tie.round === 1);
  if (!seed || seed.homeId == null || seed.awayId == null) return null;
  return {
    id: seed.id,
    home: team(seed.homeId),
    away: team(seed.awayId),
    homeScore: null,
    awayScore: null,
    status: "scheduled",
    kickoff: seed.kickoff,
    groupName: "Quarterfinals · QF4",
    note: "the winner meets the winner of Brazil × Spain",
    version: 0,
  };
}

function demoOverview(): OverviewData {
  const groups = demoGroups();
  return {
    featuredGroup: demoGroup(groupSeed(1)),
    liveFixture: demoLiveFixture(),
    nextFixture: demoNextFixture(),
    stats: [
      { value: "26", label: "Matches played" },
      { value: "2.2", label: "Goals per match" },
      { value: String(groups.length * 2), label: "Teams through" },
    ],
    titleOdds: titleOddsFrom(demoBracket(), groups),
  };
}

const EMPTY_OVERVIEW: OverviewData = {
  featuredGroup: null,
  liveFixture: null,
  nextFixture: null,
  stats: [],
  titleOdds: [],
};

export function getOverview(id: number): Promise<OverviewData> {
  return withFallback(
    () => liveOverview(id),
    onlyDemo(id, demoOverview, EMPTY_OVERVIEW),
    `overview ${id}`,
  );
}

export function getConsoleGroups(id: number): Promise<GroupDetail[]> {
  return withFallback(
    () => liveConsoleGroups(id),
    () => [],
    `console groups ${id}`,
  );
}

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

function attachOutlook(group: Group, detail: GroupDetail | undefined, tournamentId: number): Group {
  const remaining = (detail?.fixtures ?? [])
    .filter((fixture) => fixture.status !== "finished" && fixture.home && fixture.away)
    .map((fixture): [number, number] => [fixture.home!.id, fixture.away!.id]);

  // Settled group (or no fixture data): the table is final — clinch/eliminate by rank.
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

// Standings enriched with a qualification forecast per team (for the standings screen).
export async function getStandingsView(id: number): Promise<Group[]> {
  const [groups, consoleGroups] = await Promise.all([getGroups(id), getConsoleGroups(id)]);
  const detailById = new Map(consoleGroups.map((group) => [group.id, group]));
  return groups.map((group) => attachOutlook(group, detailById.get(group.id), id));
}
