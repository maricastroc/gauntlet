import { roundTag } from "@/lib/format";
import type { BracketTie, Team } from "@/lib/types";

export interface TieResult {
  home: number;
  away: number;
  homePenalties?: number | null;
  awayPenalties?: number | null;
}

export type TieResults = Map<number, TieResult>;

export interface ResolvedBracket {
  ties: BracketTie[];
  champion: Team | null;
}

export function isDraw(result: TieResult): boolean {
  return result.home === result.away;
}

export function resolvedSide(result: TieResult): "home" | "away" | null {
  if (result.home > result.away) return "home";
  if (result.away > result.home) return "away";
  const hp = result.homePenalties ?? null;
  const ap = result.awayPenalties ?? null;
  if (hp == null || ap == null || hp === ap) return null;
  return hp > ap ? "home" : "away";
}

export function childOf(tie: Pick<BracketTie, "round" | "slot">): {
  round: number;
  slot: number;
  side: "home" | "away";
} {
  return {
    round: tie.round + 1,
    slot: Math.ceil(tie.slot / 2),
    side: tie.slot % 2 === 1 ? "home" : "away",
  };
}

function feederLabel(tie: BracketTie, side: "home" | "away", maxRound: number): string {
  const feederSlot = side === "home" ? tie.slot * 2 - 1 : tie.slot * 2;
  return `Winner ${roundTag(tie.round - 1, maxRound, feederSlot)}`;
}

const key = (round: number, slot: number) => `${round}:${slot}`;

// Rebuild the whole tree from the recorded results: round-one seeding stays put,
// every deeper slot is re-derived from the winners feeding into it. A single edit
// upstream cascades all the way to the trophy, so the bracket is never partial.
export function resolveBracket(base: BracketTie[], results: TieResults): ResolvedBracket {
  const maxRound = Math.max(...base.map((tie) => tie.round), 1);

  const ties = base.map((tie): BracketTie => {
    const seededHome = tie.round === 1;
    return {
      ...tie,
      home: seededHome
        ? { ...tie.home, score: null, penalties: null }
        : { team: null, placeholder: tie.home.placeholder, score: null, penalties: null },
      away: seededHome
        ? { ...tie.away, score: null, penalties: null }
        : { team: null, placeholder: tie.away.placeholder, score: null, penalties: null },
      winnerId: null,
      decidedByPenalties: false,
      status: "pending",
    };
  });

  const byKey = new Map(ties.map((tie) => [key(tie.round, tie.slot), tie]));

  for (const tie of ties) {
    if (tie.round === 1) continue;
    tie.home.placeholder ??= feederLabel(tie, "home", maxRound);
    tie.away.placeholder ??= feederLabel(tie, "away", maxRound);
  }

  let champion: Team | null = null;
  const rounds = [...new Set(ties.map((tie) => tie.round))].sort((a, b) => a - b);

  for (const round of rounds) {
    for (const tie of ties.filter((candidate) => candidate.round === round)) {
      const ready = Boolean(tie.home.team && tie.away.team);
      const result = ready ? results.get(tie.id) : undefined;

      if (!result) {
        tie.status = ready ? "ready" : "pending";
        continue;
      }

      tie.home.score = result.home;
      tie.away.score = result.away;

      const winnerSide = resolvedSide(result);
      if (!winnerSide) {
        tie.status = "ready";
        continue;
      }

      if (isDraw(result)) {
        tie.home.penalties = result.homePenalties ?? null;
        tie.away.penalties = result.awayPenalties ?? null;
        tie.decidedByPenalties = true;
      }

      const winner = (winnerSide === "home" ? tie.home.team : tie.away.team) as Team;
      tie.winnerId = winner.id;
      tie.status = "decided";

      const child = childOf(tie);
      const childTie = byKey.get(key(child.round, child.slot));
      if (childTie) childTie[child.side].team = winner;
      else champion = winner;
    }
  }

  return { ties, champion };
}
