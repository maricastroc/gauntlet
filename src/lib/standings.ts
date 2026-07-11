import type { ResultLetter, StandingRow, Team } from "@/lib/types";

export interface RawMatch {
  homeId: number;
  awayId: number;
  homeScore: number;
  awayScore: number;
}

export type Criterion = "points" | "goalDifference" | "goalsFor" | "wins" | "headToHead";

/**
 * World Cup order: overall points, goal difference, goals for, then head-to-head
 * among the still-tied teams, then wins. Teams level on everything keep seed order.
 * Mirrors the backend `TiebreakRules::fifa()` so both engines rank identically.
 */
export const FIFA_TIEBREAK: Criterion[] = [
  "points",
  "goalDifference",
  "goalsFor",
  "headToHead",
  "wins",
];

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
  seed: number;
}

export function computeStandings(
  teams: Team[],
  matches: RawMatch[],
  qualifyCount: number,
  criteria: Criterion[] = FIFA_TIEBREAK,
): StandingRow[] {
  const ordered = order(accumulate(teams, matches), matches, criteria);

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

/** Folds matches into one tally per team. Reused for the head-to-head mini-tables. */
function accumulate(teams: Team[], matches: RawMatch[]): Tally[] {
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

  return [...tallies.values()];
}

/**
 * Applies the tiebreak chain. A scalar criterion splits the teams into buckets of
 * equal value; each bucket recurses with the remaining criteria. Head-to-head is
 * special: it re-ranks the tied teams by a mini-table of only the games among them.
 */
function order(list: Tally[], matches: RawMatch[], criteria: Criterion[]): Tally[] {
  if (list.length <= 1 || criteria.length === 0) return list;

  const [criterion, ...rest] = criteria;

  if (criterion === "headToHead") {
    return resolveHeadToHead(list, matches, rest);
  }

  return bucketsByScalars(list, [criterion]).flatMap((bucket) =>
    bucket.length === 1 ? bucket : order(bucket, matches, rest),
  );
}

/**
 * Among the tied teams, build a mini-league from only the games between them and
 * reorder by its points/goal difference/goals for. Teams still level fall through
 * to the criteria that follow head-to-head.
 */
function resolveHeadToHead(tied: Tally[], matches: RawMatch[], rest: Criterion[]): Tally[] {
  const ids = new Set(tied.map((t) => t.team.id));
  const intra = matches.filter((m) => ids.has(m.homeId) && ids.has(m.awayId));
  const mini = accumulate(
    tied.map((t) => t.team),
    intra,
  );
  const original = new Map(tied.map((t) => [t.team.id, t]));

  return bucketsByScalars(mini, ["points", "goalDifference", "goalsFor"]).flatMap((bucket) => {
    const group = bucket.map((m) => original.get(m.team.id)!);
    return group.length === 1 ? group : order(group, matches, rest);
  });
}

/** Groups teams into ordered buckets, each holding the teams equal on all given scalars. */
function bucketsByScalars(list: Tally[], scalars: Criterion[]): Tally[][] {
  const sorted = [...list].sort((a, b) => {
    for (const scalar of scalars) {
      const delta = value(b, scalar) - value(a, scalar);
      if (delta !== 0) return delta;
    }
    return 0;
  });

  const buckets: Tally[][] = [];
  let current: Tally[] = [];
  let previousKey: string | null = null;

  for (const tally of sorted) {
    const key = scalars.map((s) => value(tally, s)).join("|");
    if (previousKey !== null && key !== previousKey) {
      buckets.push(current);
      current = [];
    }
    current.push(tally);
    previousKey = key;
  }
  if (current.length > 0) buckets.push(current);

  return buckets;
}

function value(t: Tally, criterion: Criterion): number {
  switch (criterion) {
    case "points":
      return t.points;
    case "goalDifference":
      return t.goalsFor - t.goalsAgainst;
    case "goalsFor":
      return t.goalsFor;
    case "wins":
      return t.won;
    case "headToHead":
      return 0;
  }
}
