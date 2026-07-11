import type { Team } from "@/lib/types";
import type { RawMatch } from "@/lib/standings";

export const KNOCKOUT_STAGE_ID = 2;

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
  17: { id: 17, name: "Belgium", code: "BEL", flag: "🇧🇪" },
  18: { id: 18, name: "United States", code: "USA", flag: "🇺🇸" },
  19: { id: 19, name: "Ecuador", code: "ECU", flag: "🇪🇨" },
  20: { id: 20, name: "Iran", code: "IRN", flag: "🇮🇷" },
  21: { id: 21, name: "Colombia", code: "COL", flag: "🇨🇴" },
  22: { id: 22, name: "Switzerland", code: "SUI", flag: "🇨🇭" },
  23: { id: 23, name: "Ghana", code: "GHA", flag: "🇬🇭" },
  24: { id: 24, name: "Saudi Arabia", code: "KSA", flag: "🇸🇦" },
  25: { id: 25, name: "Denmark", code: "DEN", flag: "🇩🇰" },
  26: { id: 26, name: "Serbia", code: "SRB", flag: "🇷🇸" },
  27: { id: 27, name: "Cameroon", code: "CMR", flag: "🇨🇲" },
  28: { id: 28, name: "Canada", code: "CAN", flag: "🇨🇦" },
  29: { id: 29, name: "Australia", code: "AUS", flag: "🇦🇺" },
  30: { id: 30, name: "Tunisia", code: "TUN", flag: "🇹🇳" },
  31: { id: 31, name: "Qatar", code: "QAT", flag: "🇶🇦" },
  32: { id: 32, name: "Egypt", code: "EGY", flag: "🇪🇬" },
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
  teamIds: number[];
  matches: RawMatch[];
}

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
  { id: 5, name: "E", qualifyCount: 2, teamIds: [17, 18, 19, 20] },
  { id: 6, name: "F", qualifyCount: 2, teamIds: [21, 22, 23, 24] },
  { id: 7, name: "G", qualifyCount: 2, teamIds: [25, 26, 27, 28] },
  { id: 8, name: "H", qualifyCount: 2, teamIds: [29, 30, 31, 32] },
].map((group) => ({ ...group, matches: roundRobin(group.teamIds) }));

export function groupSeed(id: number): GroupSeed {
  const found = GROUPS.find((group) => group.id === id);
  if (!found) throw new Error(`Unknown group id ${id}`);
  return found;
}

export interface TieSeed {
  id: number;
  round: number;
  slot: number;
  homeId: number | null;
  awayId: number | null;
  homeSeed?: string;
  awaySeed?: string;
  homeSourceLabel?: string;
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

interface KnockoutResult {
  homeScore: number;
  awayScore: number;
  homePenalties?: number;
  awayPenalties?: number;
}

const R16_RESULTS: Record<number, KnockoutResult> = {
  1: { homeScore: 3, awayScore: 1 },
  2: { homeScore: 1, awayScore: 1, homePenalties: 5, awayPenalties: 4 },
  3: { homeScore: 2, awayScore: 0 },
  4: { homeScore: 0, awayScore: 2 },
  5: { homeScore: 4, awayScore: 1 },
};

const ROUND_TAG: Record<number, string> = { 1: "R16", 2: "QF", 3: "SF", 4: "F" };

function qualifier(groupName: string, position: number): number {
  const group = GROUPS.find((g) => g.name === groupName);
  if (!group) throw new Error(`Unknown group ${groupName}`);
  return group.teamIds[position - 1];
}

function decideWinner(homeId: number, awayId: number, result: KnockoutResult): number {
  if (result.homeScore > result.awayScore) return homeId;
  if (result.awayScore > result.homeScore) return awayId;
  return (result.homePenalties ?? 0) > (result.awayPenalties ?? 0) ? homeId : awayId;
}

function buildTies(): TieSeed[] {
  const names = GROUPS.map((group) => group.name).sort();
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < names.length; i += 2) pairs.push([names[i], names[i + 1]]);

  const firstRound: Array<[string, number, string, number]> = [];
  for (const [x, y] of pairs) firstRound.push([x, 1, y, 2]);
  for (const [x, y] of pairs) firstRound.push([y, 1, x, 2]);

  const ties: TieSeed[] = [];
  let id = 1;

  firstRound.forEach(([homeGroup, homePos, awayGroup, awayPos], index) => {
    const slot = index + 1;
    const homeId = qualifier(homeGroup, homePos);
    const awayId = qualifier(awayGroup, awayPos);
    const result = R16_RESULTS[slot];
    ties.push({
      id: id++,
      round: 1,
      slot,
      homeId,
      awayId,
      homeSeed: `${homeGroup}${homePos}`,
      awaySeed: `${awayGroup}${awayPos}`,
      homeScore: result?.homeScore ?? null,
      awayScore: result?.awayScore ?? null,
      homePenalties: result?.homePenalties ?? null,
      awayPenalties: result?.awayPenalties ?? null,
      winnerId: result ? decideWinner(homeId, awayId, result) : null,
      status: result ? "decided" : "ready",
    });
  });

  let previousCount = firstRound.length;
  const maxRound = Math.log2(firstRound.length) + 1;
  for (let round = 2; round <= maxRound; round++) {
    const count = previousCount / 2;
    for (let slot = 1; slot <= count; slot++) {
      const homeFeeder = ties.find((t) => t.round === round - 1 && t.slot === 2 * slot - 1)!;
      const awayFeeder = ties.find((t) => t.round === round - 1 && t.slot === 2 * slot)!;
      const homeId = homeFeeder.status === "decided" ? homeFeeder.winnerId : null;
      const awayId = awayFeeder.status === "decided" ? awayFeeder.winnerId : null;
      const feederTag = ROUND_TAG[round - 1];
      ties.push({
        id: id++,
        round,
        slot,
        homeId,
        awayId,
        homeSourceLabel: homeId === null ? `Winner ${feederTag}${homeFeeder.slot}` : undefined,
        awaySourceLabel: awayId === null ? `Winner ${feederTag}${awayFeeder.slot}` : undefined,
        homeScore: null,
        awayScore: null,
        winnerId: null,
        status: homeId !== null && awayId !== null ? "ready" : "pending",
      });
    }
    previousCount = count;
  }

  return ties;
}

export const TIES: TieSeed[] = buildTies();

export const MAX_ROUND = Math.max(...TIES.map((tie) => tie.round));

export const TOURNAMENT = {
  id: 1,
  name: "Copa Atlas 2026",
  status: "active" as const,
};
