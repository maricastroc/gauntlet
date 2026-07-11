import { api } from "@/lib/api/client";
import { roundTag, shortRound } from "@/lib/format";
import { titleOddsFrom } from "@/lib/forecast/bracket";
import { attachOutlookToGroups } from "./outlook";
import { buildRecap, pickFeaturedGroup, pickNextFixture } from "@/lib/overview";
import type {
  Bracket,
  BracketTie,
  FixtureDetail,
  Group,
  GroupDetail,
  OverviewData,
  OverviewStat,
  PhasePill,
  StageDetail,
  Team,
  TournamentDetail,
  TournamentMeta,
} from "@/lib/types";
import { TEAMS } from "./copa-atlas";
import { buildTiebreakNote } from "./shared";

type TeamMap = Map<number, Team>;

function teamMapFrom(detail: TournamentDetail): TeamMap {
  const map = new Map<number, Team>();
  for (const team of detail.teams) {
    map.set(team.id, TEAMS[team.id] ?? team);
  }
  return map;
}

function enrich(map: TeamMap, team: Team | null): Team | null {
  if (team === null) return null;
  return map.get(team.id) ?? team;
}

function groupStageOf(detail: TournamentDetail): StageDetail | undefined {
  return detail.stages.find((stage) => stage.type === "group");
}

function knockoutStageOf(detail: TournamentDetail): StageDetail | undefined {
  return detail.stages.find((stage) => stage.type === "knockout");
}

async function groupsFromDetail(detail: TournamentDetail, teams: TeamMap): Promise<Group[]> {
  const stage = groupStageOf(detail);
  if (!stage) return [];

  return Promise.all(
    stage.groups.map(async (group) => {
      const rows = (await api.standings(group.id)).map((row) => ({
        ...row,
        team: teams.get(row.team.id) ?? row.team,
      }));
      return {
        id: group.id,
        name: group.name,
        qualifyCount: group.qualifyCount,
        standings: rows,
        tiebreakNote: buildTiebreakNote(rows),
      } satisfies Group;
    }),
  );
}

export async function liveGroups(id: number): Promise<Group[]> {
  const detail = await api.getTournament(id);
  return groupsFromDetail(detail, teamMapFrom(detail));
}

export async function liveGroup(id: number, groupId: number): Promise<Group | null> {
  const groups = await liveGroups(id);
  return groups.find((group) => group.id === groupId) ?? groups[0] ?? null;
}

async function bracketFromDetail(detail: TournamentDetail, teams: TeamMap): Promise<Bracket> {
  const stage = knockoutStageOf(detail);
  if (!stage) return { stageId: 0, champion: null, ties: [] };

  const bracket = await api.bracket(stage.id);

  const fixtureByTie = new Map<number, FixtureDetail>();
  for (const fixture of stage.fixtures) {
    if (fixture.tieId !== null) fixtureByTie.set(fixture.tieId, fixture);
  }

  const ties: BracketTie[] = bracket.ties
    .map((tie) => {
      const fixture = fixtureByTie.get(tie.id);
      return {
        ...tie,
        home: {
          ...tie.home,
          team: enrich(teams, tie.home.team),
          score: fixture?.homeScore ?? null,
          penalties: fixture?.homePenalties ?? null,
        },
        away: {
          ...tie.away,
          team: enrich(teams, tie.away.team),
          score: fixture?.awayScore ?? null,
          penalties: fixture?.awayPenalties ?? null,
        },
        fixtureId: fixture?.id,
        version: fixture?.version,
      };
    })
    .sort((a, b) => a.round - b.round || a.id - b.id);

  const slotByRound = new Map<number, number>();
  for (const tie of ties) {
    const slot = (slotByRound.get(tie.round) ?? 0) + 1;
    slotByRound.set(tie.round, slot);
    tie.slot = slot;
  }

  const maxRound = Math.max(...ties.map((tie) => tie.round), 1);
  for (const tie of ties) {
    if (tie.round === 1) continue;
    if (!tie.home.team) {
      tie.home.placeholder ??= `Winner ${roundTag(tie.round - 1, maxRound, tie.slot * 2 - 1)}`;
    }
    if (!tie.away.team) {
      tie.away.placeholder ??= `Winner ${roundTag(tie.round - 1, maxRound, tie.slot * 2)}`;
    }
  }

  return { stageId: bracket.stageId, champion: enrich(teams, bracket.champion), ties };
}

export async function liveBracket(id: number): Promise<Bracket> {
  const detail = await api.getTournament(id);
  return bracketFromDetail(detail, teamMapFrom(detail));
}

function computeStats(groups: Group[]): OverviewStat[] {
  const rows = groups.flatMap((group) => group.standings);
  const matches = rows.reduce((sum, row) => sum + row.played, 0) / 2;
  const goals = rows.reduce((sum, row) => sum + row.goalsFor, 0);
  const qualified = rows.filter((row) => row.qualified).length;

  return [
    { value: matches ? String(Math.round(matches)) : "—", label: "Matches played" },
    { value: matches ? (goals / matches).toFixed(1) : "—", label: "Goals per match" },
    { value: String(qualified || rows.length), label: "Teams through" },
  ];
}

export async function liveOverview(id: number): Promise<OverviewData> {
  const detail = await api.getTournament(id);
  const teams = teamMapFrom(detail);
  const [groups, bracket] = await Promise.all([
    groupsFromDetail(detail, teams),
    bracketFromDetail(detail, teams),
  ]);

  const consoleGroups = consoleGroupsFromDetail(detail, teams);
  const withOutlook = attachOutlookToGroups(groups, consoleGroups, id);
  const featured = pickFeaturedGroup(withOutlook);

  return {
    featuredGroup: featured,
    liveFixture: null,
    nextFixture: pickNextFixture(consoleGroups, featured, bracket),
    stats: computeStats(groups),
    titleOdds: titleOddsFrom(bracket, groups),
    champion: bracket.champion,
    recap: buildRecap(
      bracket,
      groups,
      consoleGroups.flatMap((group) => group.fixtures),
    ),
  };
}

function consoleGroupsFromDetail(detail: TournamentDetail, teams: TeamMap): GroupDetail[] {
  const stage = groupStageOf(detail);
  if (!stage) return [];

  return stage.groups.map((group) => ({
    ...group,
    teams: group.teams.map((team) => teams.get(team.id) ?? team),
    fixtures: group.fixtures.map((fixture) => ({
      ...fixture,
      home: enrich(teams, fixture.home),
      away: enrich(teams, fixture.away),
    })),
  }));
}

export async function liveConsoleGroups(id: number): Promise<GroupDetail[]> {
  const detail = await api.getTournament(id);
  return consoleGroupsFromDetail(detail, teamMapFrom(detail));
}

export async function liveMeta(id: number): Promise<TournamentMeta> {
  const detail = await api.getTournament(id);
  const knockout = knockoutStageOf(detail);

  const phases: PhasePill[] = [
    { key: "groups", label: "Groups", state: knockout ? "done" : "now" },
  ];
  let phaseLabel = "Group stage";

  if (knockout && knockout.ties.length) {
    const maxRound = Math.max(...knockout.ties.map((tie) => tie.round), 1);
    for (let round = 1; round <= maxRound; round++) {
      phases.push({
        key: `r${round}`,
        label: shortRound(round, maxRound),
        state: round === 1 ? "now" : "todo",
      });
    }
    phaseLabel = "Knockout";
  }

  return {
    id: detail.id,
    name: detail.name,
    status: detail.status,
    phaseLabel,
    phases,
  };
}
