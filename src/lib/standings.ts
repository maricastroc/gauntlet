/**
 * Pure standings projection — the frontend echo of the API's `GroupTable` engine.
 *
 * The product thesis: a table is *derived* from match results, never stored.
 * The Console screen leans on this — edit a score, recompute, preview the delta.
 *
 * Tiebreak order here mirrors the enum in the domain (Points, GoalDifference,
 * GoalsFor, HeadToHead, Wins), then a deterministic input order as the final
 * tiebreak (the API replaces a random draw with input order for reproducibility).
 * The recursive head-to-head mini-league is the API's authority; this client
 * copy applies the scalar chain, which is sufficient for the demo data.
 */

import type { ResultLetter, StandingRow, Team } from "@/lib/types";

export interface RawMatch {
  homeId: number;
  awayId: number;
  homeScore: number;
  awayScore: number;
}

interface Tally {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: ResultLetter[];
  /** Preserves input order for the final deterministic tiebreak. */
  seed: number;
}

export function computeStandings(
  teams: Team[],
  matches: RawMatch[],
  qualifyCount: number,
): StandingRow[] {
  const tallies = new Map<number, Tally>();
  teams.forEach((team, index) => {
    tallies.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      form: [],
      seed: index,
    });
  });

  for (const match of matches) {
    const home = tallies.get(match.homeId);
    const away = tallies.get(match.awayId);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won += 1;
      home.points += 3;
      home.form.push("W");
      away.lost += 1;
      away.form.push("L");
    } else if (match.homeScore < match.awayScore) {
      away.won += 1;
      away.points += 3;
      away.form.push("W");
      home.lost += 1;
      home.form.push("L");
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
      home.form.push("D");
      away.form.push("D");
    }
  }

  const ordered = [...tallies.values()].sort(compareTallies);

  return ordered.map((tally, index) => ({
    position: index + 1,
    team: tally.team,
    played: tally.played,
    won: tally.won,
    drawn: tally.drawn,
    lost: tally.lost,
    goalsFor: tally.goalsFor,
    goalsAgainst: tally.goalsAgainst,
    goalDifference: tally.goalsFor - tally.goalsAgainst,
    points: tally.points,
    form: tally.form,
    qualified: index < qualifyCount,
  }));
}

function compareTallies(a: Tally, b: Tally): number {
  const gd = (t: Tally) => t.goalsFor - t.goalsAgainst;
  return (
    b.points - a.points ||
    gd(b) - gd(a) ||
    b.goalsFor - a.goalsFor ||
    b.won - a.won ||
    a.seed - b.seed
  );
}
