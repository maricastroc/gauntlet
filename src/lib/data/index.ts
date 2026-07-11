import { computeStandings } from "@/lib/standings";
import { titleOddsFrom } from "@/lib/forecast/bracket";
import { attachOutlookToGroups } from "./outlook";
import { buildRecap, pickFeaturedGroup, pickNextFixture } from "@/lib/overview";
import type {
  Bracket,
  BracketTie,
  Fixture,
  FixtureDetail,
  Group,
  OverviewData,
  PhasePill,
  TieSide,
  TournamentMeta,
} from "@/lib/types";
import { shortRound } from "@/lib/format";
import {
  GROUPS,
  KNOCKOUT_STAGE_ID,
  MAX_ROUND,
  TIES,
  TOURNAMENT,
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
  const phases: PhasePill[] = [{ key: "groups", label: "Groups", state: "done" }];
  for (let round = 1; round <= MAX_ROUND; round++) {
    phases.push({
      key: `r${round}`,
      label: shortRound(round, MAX_ROUND),
      state: round === 1 ? "now" : "todo",
    });
  }

  return {
    id: TOURNAMENT.id,
    name: TOURNAMENT.name,
    status: TOURNAMENT.status,
    phaseLabel: "Knockout",
    phases,
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

function demoOverview(): OverviewData {
  const bracket = demoBracket();
  const groups = attachOutlookToGroups(demoGroups(), [], DEMO_TOURNAMENT_ID);
  const featured = pickFeaturedGroup(groups);
  return {
    featuredGroup: featured,
    liveFixture: demoLiveFixture(),
    nextFixture: pickNextFixture([], featured, bracket),
    stats: [
      { value: "26", label: "Matches played" },
      { value: "2.2", label: "Goals per match" },
      { value: String(groups.length * 2), label: "Teams through" },
    ],
    titleOdds: titleOddsFrom(bracket, groups),
    champion: bracket.champion,
    recap: buildRecap(bracket, groups, []),
  };
}

const EMPTY_OVERVIEW: OverviewData = {
  featuredGroup: null,
  liveFixture: null,
  nextFixture: null,
  stats: [],
  titleOdds: [],
  champion: null,
  recap: null,
};

export function getOverview(id: number): Promise<OverviewData> {
  return withFallback(
    () => liveOverview(id),
    onlyDemo(id, demoOverview, EMPTY_OVERVIEW),
    `overview ${id}`,
  );
}

function demoConsoleGroups(): GroupDetail[] {
  return GROUPS.map((group) => ({
    id: group.id,
    name: group.name,
    qualifyCount: group.qualifyCount,
    teams: group.teamIds.map(team),
    fixtures: group.matches.map(
      (match, index): FixtureDetail => ({
        id: group.id * 100 + index,
        tieId: null,
        home: team(match.homeId),
        away: team(match.awayId),
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        homePenalties: null,
        awayPenalties: null,
        status: "finished",
        version: 0,
      }),
    ),
  }));
}

export function getConsoleGroups(id: number): Promise<GroupDetail[]> {
  return withFallback(
    () => liveConsoleGroups(id),
    onlyDemo(id, demoConsoleGroups, []),
    `console groups ${id}`,
  );
}

export async function getStandingsView(id: number): Promise<Group[]> {
  const [groups, consoleGroups] = await Promise.all([getGroups(id), getConsoleGroups(id)]);
  return attachOutlookToGroups(groups, consoleGroups, id);
}
