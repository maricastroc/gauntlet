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

export interface Calibration {
  baseGoals: number;
  homeAdvantage: number;
}

export const LEAGUE_BASELINE: Calibration = { baseGoals: 1.35, homeAdvantage: 0.15 };

const MIN_MATCHES_TO_CALIBRATE = 4;

export function calibrate(
  matches: RawMatch[],
  fallback: Calibration = LEAGUE_BASELINE,
): Calibration {
  if (matches.length < MIN_MATCHES_TO_CALIBRATE) return fallback;
  let home = 0;
  let away = 0;
  for (const match of matches) {
    home += match.homeScore;
    away += match.awayScore;
  }
  const n = matches.length;
  return {
    baseGoals: clamp((home + away) / (2 * n), 0.5, 3),
    homeAdvantage: clamp((home - away) / n, 0, 0.6),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampLambda(value: number): number {
  return clamp(value, 0.2, 6);
}

export function sampleScore(
  rng: Rng,
  ratingHome: number,
  ratingAway: number,
  cal: Calibration = LEAGUE_BASELINE,
): [number, number] {
  const lambdaHome = clampLambda(cal.baseGoals + (ratingHome - ratingAway) + cal.homeAdvantage);
  const lambdaAway = clampLambda(cal.baseGoals + (ratingAway - ratingHome));
  return [poisson(rng, lambdaHome), poisson(rng, lambdaAway)];
}

const RATING_LOGISTIC_SCALE = 0.9;

export function winProbability(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.exp(-(ratingA - ratingB) / RATING_LOGISTIC_SCALE));
}
