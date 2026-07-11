import { describe, expect, it } from "vitest";
import { titleOddsFrom } from "@/lib/forecast/bracket";
import type { Bracket, BracketTie, Group, Team, TieSide } from "@/lib/types";

const team = (id: number, name: string): Team => ({ id, name });
const side = (t: Team | null): TieSide => ({ team: t, score: null, penalties: null });

function bracketWith(overrides: Partial<BracketTie>[] = []): Bracket {
  const [a, b, c, d] = [team(1, "A"), team(2, "B"), team(3, "C"), team(4, "D")];
  const ties: BracketTie[] = [
    {
      id: 10,
      round: 1,
      slot: 1,
      status: "ready",
      home: side(a),
      away: side(b),
      winnerId: null,
      decidedByPenalties: false,
    },
    {
      id: 11,
      round: 1,
      slot: 2,
      status: "ready",
      home: side(c),
      away: side(d),
      winnerId: null,
      decidedByPenalties: false,
    },
    {
      id: 20,
      round: 2,
      slot: 1,
      status: "pending",
      home: side(null),
      away: side(null),
      winnerId: null,
      decidedByPenalties: false,
    },
  ];
  overrides.forEach((o) => {
    const target = ties.find((t) => t.id === o.id);
    if (target) Object.assign(target, o);
  });
  return { stageId: 1, champion: null, ties };
}

const groups: Group[] = [];

describe("titleOddsFrom", () => {
  it("returns nothing when no tie has both sides set", () => {
    const empty = bracketWith([
      { id: 10, home: side(null), away: side(null) },
      { id: 11, home: side(null), away: side(null) },
    ]);
    expect(titleOddsFrom(empty, groups)).toEqual([]);
  });

  it("is deterministic across runs of the same bracket", () => {
    const bracket = bracketWith();
    const a = titleOddsFrom(bracket, groups);
    const b = titleOddsFrom(bracket, groups);
    expect(a.map((o) => [o.team.id, o.prob])).toEqual(b.map((o) => [o.team.id, o.prob]));
  });

  it("gives every alive team a share that sums to about one", () => {
    const odds = titleOddsFrom(bracketWith(), groups);
    expect(odds).toHaveLength(4);
    const total = odds.reduce((sum, o) => sum + o.prob, 0);
    expect(total).toBeGreaterThan(0.99);
    expect(total).toBeLessThanOrEqual(1);
  });

  it("is sorted by descending probability", () => {
    const odds = titleOddsFrom(bracketWith(), groups);
    for (let i = 1; i < odds.length; i++) {
      expect(odds[i - 1].prob).toBeGreaterThanOrEqual(odds[i].prob);
    }
  });

  it("gives a team already in the final a higher share than a first-round team", () => {
    const bracket = bracketWith([
      { id: 10, winnerId: 1, status: "decided" },
      { id: 20, home: side(team(1, "A")) },
    ]);
    const odds = titleOddsFrom(bracket, groups);
    const a = odds.find((o) => o.team.id === 1)!;
    const c = odds.find((o) => o.team.id === 3)!;
    expect(a.prob).toBeGreaterThan(c.prob);
  });
});
