import { describe, expect, it } from "vitest";
import type { Bracket, BracketTie, ScenarioProjection, StandingRow, Team } from "@/lib/types";
import { describeCascade } from "./cascade";

const team = (id: number, name: string): Team => ({ id, name });

const row = (t: Team, position: number, qualified: boolean): StandingRow => ({
  position,
  team: t,
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
  form: [],
  qualified,
});

const tie = (
  id: number,
  round: number,
  slot: number,
  home: Team | null,
  away: Team | null,
): BracketTie => ({
  id,
  round,
  slot,
  status: "ready",
  home: { team: home, score: null },
  away: { team: away, score: null },
  winnerId: null,
  decidedByPenalties: false,
});

const project = (standings: StandingRow[], bracket: Bracket | null): ScenarioProjection => ({
  groups: [{ id: 1, name: "A", qualifyCount: 2, standings }],
  bracket,
});

const [bra, jpn, cro, ger, fra] = [
  team(1, "Brazil"),
  team(2, "Japan"),
  team(3, "Croatia"),
  team(10, "Germany"),
  team(6, "France"),
];

describe("describeCascade", () => {
  it("reports position moves within a group", () => {
    const base = project([row(bra, 1, true), row(jpn, 2, true), row(cro, 3, false)], null);
    const next = project([row(jpn, 1, true), row(bra, 2, true), row(cro, 3, false)], null);

    expect(describeCascade(base, next)).toEqual([
      { text: "Japan rises to 1st in Group A", tone: "up" },
      { text: "Brazil slips to 2nd in Group A", tone: "down" },
    ]);
  });

  it("reports qualification flips before plain moves", () => {
    const base = project([row(bra, 1, true), row(jpn, 2, true), row(cro, 3, false)], null);
    const next = project([row(bra, 1, true), row(cro, 2, true), row(jpn, 3, false)], null);

    expect(describeCascade(base, next)).toEqual([
      { text: "Croatia climbs into the top 2 of Group A", tone: "up" },
      { text: "Japan drops out of the top 2 of Group A", tone: "down" },
    ]);
  });

  it("reports a bracket participant swap", () => {
    const rows = [row(bra, 1, true)];
    const base: Bracket = {
      stageId: 0,
      champion: null,
      ties: [tie(10, 1, 1, ger, fra), tie(20, 2, 1, null, null)],
    };
    const next: Bracket = {
      stageId: 0,
      champion: null,
      ties: [tie(10, 1, 1, bra, fra), tie(20, 2, 1, null, null)],
    };

    expect(describeCascade(project(rows, base), project(rows, next))).toEqual([
      { text: "Brazil replaces Germany in the Semifinals", tone: "info" },
    ]);
  });

  it("announces a new champion", () => {
    const rows = [row(bra, 1, true)];
    const base: Bracket = { stageId: 0, champion: null, ties: [tie(20, 1, 1, bra, fra)] };
    const next: Bracket = { stageId: 0, champion: bra, ties: [tie(20, 1, 1, bra, fra)] };

    expect(describeCascade(project(rows, base), project(rows, next))).toEqual([
      { text: "New champion: Brazil", tone: "up" },
    ]);
  });

  it("returns nothing when reality is unchanged", () => {
    const rows = [row(bra, 1, true), row(jpn, 2, true)];
    expect(describeCascade(project(rows, null), project(rows, null))).toEqual([]);
  });
});
