import { shortRound } from "@/lib/format";
import type { FixtureDetail, PhasePill, TieTopology } from "@/lib/types";

/**
 * Knockout phase pills, with each round's lock state derived from actual results:
 * a round is "done" once all its ties are finished, the first unfinished round is
 * "now", and everything after it stays "todo" (locked).
 */
export function knockoutPhases(ties: TieTopology[], fixtures: FixtureDetail[]): PhasePill[] {
  if (!ties.length) return [];

  const maxRound = Math.max(...ties.map((tie) => tie.round), 1);
  const roundByTie = new Map(ties.map((tie) => [tie.id, tie.round]));

  const total = new Map<number, number>();
  const decided = new Map<number, number>();
  for (const tie of ties) {
    total.set(tie.round, (total.get(tie.round) ?? 0) + 1);
  }
  for (const fixture of fixtures) {
    if (fixture.tieId === null || fixture.status !== "finished") continue;
    const round = roundByTie.get(fixture.tieId);
    if (round === undefined) continue;
    decided.set(round, (decided.get(round) ?? 0) + 1);
  }

  const phases: PhasePill[] = [];
  let currentReached = false;
  for (let round = 1; round <= maxRound; round++) {
    const complete = (decided.get(round) ?? 0) === (total.get(round) ?? 0);
    let state: PhasePill["state"];
    if (complete) {
      state = "done";
    } else if (!currentReached) {
      state = "now";
      currentReached = true;
    } else {
      state = "todo";
    }
    phases.push({ key: `r${round}`, label: shortRound(round, maxRound), state });
  }
  return phases;
}
