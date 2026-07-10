/**
 * "Copa Atlas 2026" — the demo world, mirroring the API's TournamentDemoSeeder.
 *
 * Raw match results are the source of truth (the API's whole premise); group
 * tables are projected from them via `computeStandings`. Team IDs, flags and
 * codes match the seeder so this data can be swapped for the live endpoints
 * without the UI noticing.
 */

import type { Team } from "@/lib/types";
import type { RawMatch } from "@/lib/standings";

export const KNOCKOUT_STAGE_ID = 2;
export const MAX_ROUND = 3; // 1: Quartas · 2: Semis · 3: Final

/** All 16 teams, keyed by the seeder's creation order (ids 1..16). */
export const TEAMS: Record<number, Team> = {
  1: { id: 1, name: "Brazil", code: "BRA", flag: "🇧🇷" },
  2: { id: 2, name: "Japan", code: "JPN", flag: "🇯🇵" },
  3: { id: 3, name: "Croatia", code: "CRO", flag: "🇭🇷" },
  4: { id: 4, name: "Morocco", code: "MAR", flag: "🇲🇦" },
  5: { id: 5, name: "Argentina", code: "ARG", flag: "🇦🇷" },
  6: { id: 6, name: "France", code: "FRA", flag: "🇫🇷" },
  7: { id: 7, name: "Senegal", code: "SEN", flag: "🇸🇳" },
  8: { id: 8, name: "Poland", code: "POL", flag: "🇵🇱" },
  9: { id: 9, name: "Spain", code: "ESP", flag: "🇪🇸" },
  10: { id: 10, name: "Germany", code: "GER", flag: "🇩🇪" },
  11: { id: 11, name: "Uruguay", code: "URU", flag: "🇺🇾" },
  12: { id: 12, name: "South Korea", code: "KOR", flag: "🇰🇷" },
  13: { id: 13, name: "Portugal", code: "POR", flag: "🇵🇹" },
  14: { id: 14, name: "Netherlands", code: "NED", flag: "🇳🇱" },
  15: { id: 15, name: "Mexico", code: "MEX", flag: "🇲🇽" },
  16: { id: 16, name: "Italy", code: "ITA", flag: "🇮🇹" },
};

export function team(id: number): Team {
  const found = TEAMS[id];
  if (!found) throw new Error(`Unknown team id ${id}`);
  return found;
}

export interface GroupSeed {
  id: number;
  name: string;
  qualifyCount: number;
  /** Team ids in strength order (matches the seeder). */
  teamIds: number[];
  matches: RawMatch[];
}

/**
 * The seeder's single round-robin, identical shape per group: the top two end
 * level on points, separated by goal difference — the tiebreak story.
 * Indices refer to positions within each group's `teamIds`.
 */
const SCORELINES: Array<[number, number, number, number]> = [
  [0, 1, 1, 1],
  [0, 2, 2, 0],
  [0, 3, 3, 0],
  [1, 2, 2, 1],
  [1, 3, 2, 0],
  [2, 3, 1, 0],
];

function roundRobin(teamIds: number[]): RawMatch[] {
  return SCORELINES.map(([strong, weak, homeScore, awayScore]) => ({
    homeId: teamIds[strong],
    awayId: teamIds[weak],
    homeScore,
    awayScore,
  }));
}

export const GROUPS: GroupSeed[] = [
  { id: 1, name: "A", qualifyCount: 2, teamIds: [1, 2, 3, 4] },
  { id: 2, name: "B", qualifyCount: 2, teamIds: [5, 6, 7, 8] },
  { id: 3, name: "C", qualifyCount: 2, teamIds: [9, 10, 11, 12] },
  { id: 4, name: "D", qualifyCount: 2, teamIds: [13, 14, 15, 16] },
].map((group) => ({ ...group, matches: roundRobin(group.teamIds) }));

export function groupSeed(id: number): GroupSeed {
  const found = GROUPS.find((group) => group.id === id);
  if (!found) throw new Error(`Unknown group id ${id}`);
  return found;
}

/* ------------------------------------------------------------------ */
/* Knockout — the in-progress bracket, faithful to the seeder          */
/* ------------------------------------------------------------------ */

export interface TieSeed {
  id: number;
  round: number;
  slot: number;
  homeId: number | null;
  awayId: number | null;
  homeSourceLabel?: string; // when a side is TBD but sourced
  awaySourceLabel?: string;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties?: number | null;
  awayPenalties?: number | null;
  winnerId: number | null;
  status: "pending" | "ready" | "decided" | "live";
  kickoff?: string;
  liveMinute?: number;
}

/**
 * Quarters from the seeder's cross-group seeding; QF3 dramatised as live so the
 * Overview has a match "em campo" and the bracket a pulsing tie — the mock's
 * energy, without contradicting the seeded pairings.
 */
export const TIES: TieSeed[] = [
  {
    id: 1,
    round: 1,
    slot: 1,
    homeId: 1,
    awayId: 6, // Brazil × France
    homeScore: 2,
    awayScore: 1,
    winnerId: 1,
    status: "decided",
  },
  {
    id: 2,
    round: 1,
    slot: 2,
    homeId: 9,
    awayId: 14, // Spain × Netherlands
    homeScore: 1,
    awayScore: 1,
    homePenalties: 4,
    awayPenalties: 2,
    winnerId: 9,
    status: "decided",
  },
  {
    id: 3,
    round: 1,
    slot: 3,
    homeId: 5,
    awayId: 2, // Argentina × Japan — live
    homeScore: 1,
    awayScore: 1,
    winnerId: null,
    status: "live",
    liveMinute: 78,
  },
  {
    id: 4,
    round: 1,
    slot: 4,
    homeId: 13,
    awayId: 10, // Portugal × Germany — scheduled
    homeScore: null,
    awayScore: null,
    winnerId: null,
    status: "ready",
    kickoff: "Sat 21:00",
  },
  {
    id: 5,
    round: 2,
    slot: 1,
    homeId: 1,
    awayId: 9, // Brazil × Spain (both from decided quarterfinals)
    homeScore: null,
    awayScore: null,
    winnerId: null,
    status: "ready",
    kickoff: "Tue 20:00",
  },
  {
    id: 6,
    round: 2,
    slot: 2,
    homeId: null,
    awayId: null,
    homeSourceLabel: "Winner QF3",
    awaySourceLabel: "Winner QF4",
    homeScore: null,
    awayScore: null,
    winnerId: null,
    status: "pending",
  },
  {
    id: 7,
    round: 3,
    slot: 1,
    homeId: null,
    awayId: null,
    homeSourceLabel: "Winner SF1",
    awaySourceLabel: "Winner SF2",
    homeScore: null,
    awayScore: null,
    winnerId: null,
    status: "pending",
  },
];

export const TOURNAMENT = {
  id: 1,
  name: "Copa Atlas 2026",
  status: "active" as const,
};
