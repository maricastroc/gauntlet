/**
 * Data-access layer — the single seam the screens read from.
 *
 * Public reads (`getGroups`, `getGroup`, `getBracket`, `getOverview`) try the
 * live API first and fall back to the demo fixtures if it's unreachable, so the
 * app renders whether or not the API is running. Set `NEXT_PUBLIC_USE_LIVE_API=false`
 * to force demo. Tournament chrome and the console scenario stay demo-fed — the
 * API has no tournament-metadata or fixtures endpoint.
 */

import { computeStandings } from "@/lib/standings";
import type {
  Bracket,
  BracketTie,
  Fixture,
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
import { buildTiebreakNote } from "./shared";
import { liveBracket, liveGroup, liveGroups, liveOverview } from "./live";

const LIVE_ENABLED = process.env.NEXT_PUBLIC_USE_LIVE_API !== "false";

async function withFallback<T>(
  live: () => Promise<T>,
  demo: () => T,
  label: string,
): Promise<T> {
  if (!LIVE_ENABLED) return demo();
  try {
    return await live();
  } catch (error) {
    console.warn(
      `[data] live "${label}" failed, using demo fixtures:`,
      error instanceof Error ? error.message : error,
    );
    return demo();
  }
}

/* ------------------------------ tournament ------------------------------ */

export function getTournamentMeta(): TournamentMeta {
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

/* -------------------------------- groups -------------------------------- */

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

export function getGroups(): Promise<Group[]> {
  return withFallback(liveGroups, demoGroups, "groups");
}

export function getGroup(id: number): Promise<Group> {
  return withFallback(
    () => liveGroup(id),
    () => demoGroup(groupSeed(id)),
    `group ${id}`,
  );
}

/* ------------------------------- bracket -------------------------------- */

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
    decidedByPenalties:
      seed.homePenalties != null && seed.awayPenalties != null,
    kickoff: seed.kickoff,
    liveMinute: seed.liveMinute,
  };
}

function demoBracket(): Bracket {
  return {
    stageId: KNOCKOUT_STAGE_ID,
    champion: null,
    ties: TIES.map(toBracketTie),
  };
}

export function getBracket(): Promise<Bracket> {
  return withFallback(liveBracket, demoBracket, "bracket");
}

/* ------------------------------- overview ------------------------------- */

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
  };
}

export function getOverview(): Promise<OverviewData> {
  return withFallback(liveOverview, demoOverview, "overview");
}

/* -------------------------------- console ------------------------------- */

export interface ConsoleScenario {
  groupId: number;
  groupName: string;
  qualifyCount: number;
  teams: import("@/lib/types").Team[];
  matches: import("@/lib/standings").RawMatch[];
  editableIndex: number;
  home: import("@/lib/types").Team;
  away: import("@/lib/types").Team;
  /** The real fixture id for this match in the seeded API (Group A: Brazil × Croatia). */
  liveFixtureId: number;
  /** Optimistic-lock version to send first; 0 on a fresh seed. */
  version: number;
}

export function getConsoleScenario(): ConsoleScenario {
  const seed = groupSeed(1);
  const teams = seed.teamIds.map(team);
  const editableIndex = seed.matches.findIndex(
    (match) => match.homeId === 1 && match.awayId === 3,
  );
  const editable = seed.matches[editableIndex];

  return {
    groupId: seed.id,
    groupName: seed.name,
    qualifyCount: seed.qualifyCount,
    teams,
    matches: seed.matches,
    editableIndex,
    home: team(editable.homeId),
    away: team(editable.awayId),
    liveFixtureId: 2,
    version: 0,
  };
}
