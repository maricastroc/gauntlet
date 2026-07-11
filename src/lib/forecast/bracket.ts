import type { Bracket, BracketTie, Group, Team, TitleOdd } from "@/lib/types";
import { childOf } from "@/lib/knockout";
import { hashString, mulberry32, type Rng } from "./rng";
import { ratingsFromStandings, winProbability } from "./model";

const RUNS = 20000;

const slotKey = (round: number, slot: number, side: "home" | "away") => `${round}:${slot}:${side}`;

function playOnce(
  ties: BracketTie[],
  rounds: number[],
  ratings: Map<number, number>,
  rng: Rng,
): number | null {
  const slots = new Map<string, Team | null>();
  for (const tie of ties) {
    slots.set(slotKey(tie.round, tie.slot, "home"), tie.home.team);
    slots.set(slotKey(tie.round, tie.slot, "away"), tie.away.team);
  }

  let champion: number | null = null;
  for (const round of rounds) {
    for (const tie of ties) {
      if (tie.round !== round) continue;
      const home = slots.get(slotKey(round, tie.slot, "home")) ?? null;
      const away = slots.get(slotKey(round, tie.slot, "away")) ?? null;
      if (!home || !away) continue;

      let winner: Team;
      if (tie.winnerId !== null) {
        winner = home.id === tie.winnerId ? home : away;
      } else {
        const prob = winProbability(ratings.get(home.id) ?? 0, ratings.get(away.id) ?? 0);
        winner = rng() < prob ? home : away;
      }

      const child = childOf(tie);
      const childKey = slotKey(child.round, child.slot, child.side);
      if (slots.has(childKey)) slots.set(childKey, winner);
      else champion = winner.id;
    }
  }
  return champion;
}

export function titleOddsFrom(bracket: Bracket, groups: Group[]): TitleOdd[] {
  const ties = bracket.ties;
  if (!ties.some((tie) => tie.home.team && tie.away.team)) return [];

  const teamsById = new Map<number, Team>();
  for (const tie of ties) {
    if (tie.home.team) teamsById.set(tie.home.team.id, tie.home.team);
    if (tie.away.team) teamsById.set(tie.away.team.id, tie.away.team);
  }

  const ratings = ratingsFromStandings(groups);
  const decided = ties.filter((tie) => tie.winnerId !== null).length;
  const rng = mulberry32(hashString(`title:${bracket.stageId}:${ties.length}:${decided}`));
  const rounds = [...new Set(ties.map((tie) => tie.round))].sort((a, b) => a - b);

  const wins = new Map<number, number>();
  for (let run = 0; run < RUNS; run++) {
    const champ = playOnce(ties, rounds, ratings, rng);
    if (champ !== null) wins.set(champ, (wins.get(champ) ?? 0) + 1);
  }

  return [...wins.entries()]
    .map(([id, count]) => ({ team: teamsById.get(id), prob: count / RUNS }))
    .filter((odd): odd is TitleOdd => odd.team !== undefined)
    .sort((a, b) => b.prob - a.prob);
}
