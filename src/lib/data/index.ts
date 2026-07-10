/**
 * Data-access layer — the single seam the screens read from.
 *
 * Today it composes the Copa Atlas demo seed into UI-domain objects. To go
 * live, swap these functions for the `api` client (lib/api/client.ts); the
 * return shapes are identical, so no screen changes.
 */

import { computeStandings } from "@/lib/standings";
import { formatGoalDifference } from "@/lib/format";
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

function assembleGroup(seed: GroupSeed): Group {
  const teams = seed.teamIds.map(team);
  const standings = computeStandings(teams, seed.matches, seed.qualifyCount);

  const [first, second] = standings;
  const tiebreakNote =
    first && second && first.points === second.points
      ? {
          teams: [first.team.name, second.team.name],
          points: first.points,
          detail:
            `${first.team.name} and ${second.team.name} both finished on ${first.points} pts. ` +
            `${first.team.name} stays ahead on goal difference — ` +
            `${formatGoalDifference(first.goalDifference)} × ${formatGoalDifference(second.goalDifference)}.`,
        }
      : undefined;

  return {
    id: seed.id,
    name: seed.name,
    qualifyCount: seed.qualifyCount,
    standings,
    tiebreakNote,
  };
}

export function getGroups(): Group[] {
  return GROUPS.map(assembleGroup);
}

export function getGroup(id: number): Group {
  return assembleGroup(groupSeed(id));
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

export function getBracket(): Bracket {
  return {
    stageId: KNOCKOUT_STAGE_ID,
    champion: null, // final not played
    ties: TIES.map(toBracketTie),
  };
}

/* ------------------------------- overview ------------------------------- */

function liveFixture(): Fixture | null {
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

function nextFixture(): Fixture | null {
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

/* -------------------------------- console ------------------------------- */

export interface ConsoleScenario {
  groupId: number;
  groupName: string;
  qualifyCount: number;
  teams: import("@/lib/types").Team[];
  matches: import("@/lib/standings").RawMatch[];
  /** Index into `matches` of the fixture the console edits. */
  editableIndex: number;
  home: import("@/lib/types").Team;
  away: import("@/lib/types").Team;
  /** Optimistic-lock version echoed by the API on submit. */
  version: number;
}

/**
 * The console edits one already-lodged group result and previews the
 * consequence. We pick Brasil × Croácia in Group A — the pair that, when
 * nudged, reorders the tiebreak at the top of the table.
 */
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
    version: 3,
  };
}

export function getOverview(): OverviewData {
  const groups = getGroups();
  return {
    featuredGroup: getGroup(1),
    liveFixture: liveFixture(),
    nextFixture: nextFixture(),
    stats: [
      { value: "26", label: "Matches played" },
      { value: "2.2", label: "Goals per match" },
      { value: String(groups.length * 2), label: "Teams in the finals" },
    ],
  };
}
