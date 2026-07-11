import type { RawMatch } from "@/lib/standings";
import type { Group, StandingRow, Team } from "@/lib/types";
import { poisson, type Rng } from "./rng";

export function ratingsFromMatches(teams: Team[], matches: RawMatch[]): Map<number, number> {
  const gd = new Map<number, number>();
  const games = new Map<number, number>();
  for (const team of teams) {
    gd.set(team.id, 0);
    games.set(team.id, 0);
  }

  for (const match of matches) {
    if (!gd.has(match.homeId) || !gd.has(match.awayId)) continue;
    gd.set(match.homeId, gd.get(match.homeId)! + (match.homeScore - match.awayScore));
    gd.set(match.awayId, gd.get(match.awayId)! + (match.awayScore - match.homeScore));
    games.set(match.homeId, games.get(match.homeId)! + 1);
    games.set(match.awayId, games.get(match.awayId)! + 1);
  }

  const ratings = new Map<number, number>();
  for (const team of teams) {
    const played = games.get(team.id)!;
    ratings.set(team.id, played === 0 ? 0 : (gd.get(team.id)! / (played + 1)) * 0.5);
  }
  return ratings;
}

function ratingFromStanding(row: StandingRow): number {
  if (row.played === 0) return 0;
  return (row.goalDifference / row.played) * 0.5 + (row.points / row.played - 1) * 0.35;
}

export function ratingsFromStandings(groups: Group[]): Map<number, number> {
  const ratings = new Map<number, number>();
  for (const group of groups) {
    for (const row of group.standings) ratings.set(row.team.id, ratingFromStanding(row));
  }
  return ratings;
}

const BASE_GOALS = 1.35;
const HOME_ADVANTAGE = 0.15;

function clampLambda(value: number): number {
  return Math.max(0.2, Math.min(6, value));
}

export function sampleScore(rng: Rng, ratingHome: number, ratingAway: number): [number, number] {
  const lambdaHome = clampLambda(BASE_GOALS + (ratingHome - ratingAway) + HOME_ADVANTAGE);
  const lambdaAway = clampLambda(BASE_GOALS + (ratingAway - ratingHome));
  return [poisson(rng, lambdaHome), poisson(rng, lambdaAway)];
}

export function winProbability(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.exp(-(ratingA - ratingB) / 0.9));
}
