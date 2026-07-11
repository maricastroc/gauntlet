import { describe, expect, it } from "vitest";
import {
  ratingsFromMatches,
  ratingsFromStandings,
  sampleScore,
  winProbability,
} from "@/lib/forecast/model";
import { mulberry32 } from "@/lib/forecast/rng";
import type { RawMatch } from "@/lib/standings";
import type { Group, StandingRow, Team } from "@/lib/types";

const teams: Team[] = [
  { id: 1, name: "A" },
  { id: 2, name: "B" },
];

describe("ratingsFromMatches", () => {
  it("rates unplayed teams at zero", () => {
    const ratings = ratingsFromMatches(teams, []);
    expect(ratings.get(1)).toBe(0);
    expect(ratings.get(2)).toBe(0);
  });

  it("rates the stronger team above the weaker one", () => {
    const matches: RawMatch[] = [{ homeId: 1, awayId: 2, homeScore: 3, awayScore: 0 }];
    const ratings = ratingsFromMatches(teams, matches);
    expect(ratings.get(1)!).toBeGreaterThan(0);
    expect(ratings.get(2)!).toBeLessThan(0);
    expect(ratings.get(1)!).toBeCloseTo(-ratings.get(2)!);
  });

  it("ignores matches with unknown teams", () => {
    const matches: RawMatch[] = [{ homeId: 9, awayId: 1, homeScore: 5, awayScore: 0 }];
    const ratings = ratingsFromMatches(teams, matches);
    expect(ratings.get(1)).toBe(0);
  });
});

describe("ratingsFromStandings", () => {
  it("maps every team in every group to a rating", () => {
    const row = (id: number, played: number, gd: number, points: number): StandingRow => ({
      position: 1,
      team: { id, name: `T${id}` },
      played,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: gd,
      points,
      form: [],
      qualified: false,
    });
    const groups: Group[] = [
      { id: 1, name: "A", qualifyCount: 2, standings: [row(1, 3, 6, 9), row(2, 0, 0, 0)] },
    ];
    const ratings = ratingsFromStandings(groups);
    expect(ratings.get(2)).toBe(0);
    expect(ratings.get(1)!).toBeGreaterThan(0);
  });
});

describe("sampleScore", () => {
  it("returns a pair of non-negative integer goals", () => {
    const rng = mulberry32(5);
    const [h, a] = sampleScore(rng, 0.5, -0.5);
    expect(Number.isInteger(h)).toBe(true);
    expect(Number.isInteger(a)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(a).toBeGreaterThanOrEqual(0);
  });

  it("gives the stronger side more goals on average", () => {
    const rng = mulberry32(42);
    let strong = 0;
    let weak = 0;
    for (let i = 0; i < 5000; i++) {
      const [h, a] = sampleScore(rng, 1, -1);
      strong += h;
      weak += a;
    }
    expect(strong).toBeGreaterThan(weak);
  });
});

describe("winProbability", () => {
  it("is 0.5 for evenly matched sides", () => {
    expect(winProbability(0, 0)).toBeCloseTo(0.5);
  });

  it("favours the higher rating and stays within (0, 1)", () => {
    const p = winProbability(1, -1);
    expect(p).toBeGreaterThan(0.5);
    expect(p).toBeLessThan(1);
    expect(winProbability(1, -1)).toBeCloseTo(1 - winProbability(-1, 1));
  });
});
