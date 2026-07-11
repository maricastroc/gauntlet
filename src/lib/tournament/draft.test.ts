import { describe, expect, it } from "vitest";
import { distribute, groupOptions, isBracketValid } from "@/lib/tournament/draft";
import type { Team } from "@/lib/types";

const makeTeams = (n: number): Team[] =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `T${i + 1}` }));

describe("distribute", () => {
  it("spreads teams round-robin across groups", () => {
    const groups = distribute(makeTeams(8), 4);
    expect(groups).toEqual([
      [1, 5],
      [2, 6],
      [3, 7],
      [4, 8],
    ]);
  });

  it("creates the requested number of groups even when uneven", () => {
    const groups = distribute(makeTeams(5), 2);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toEqual([1, 3, 5]);
    expect(groups[1]).toEqual([2, 4]);
  });
});

describe("groupOptions", () => {
  it("only offers group counts that fit at least two teams each", () => {
    expect(groupOptions(4)).toEqual([2]);
    expect(groupOptions(8)).toEqual([2, 4]);
    expect(groupOptions(16)).toEqual([2, 4, 8]);
  });

  it("returns nothing when there are too few teams", () => {
    expect(groupOptions(3)).toEqual([]);
  });
});

describe("isBracketValid", () => {
  it("accepts configurations producing a power-of-two bracket", () => {
    expect(isBracketValid(4, 2)).toBe(true);
    expect(isBracketValid(8, 2)).toBe(true);
    expect(isBracketValid(4, 1)).toBe(true);
  });

  it("rejects totals that are not 4, 8 or 16", () => {
    expect(isBracketValid(3, 2)).toBe(false);
    expect(isBracketValid(5, 2)).toBe(false);
  });

  it("rejects two-per-group with an odd number of groups", () => {
    expect(isBracketValid(2, 2)).toBe(true);
    expect(isBracketValid(6, 2)).toBe(false);
  });
});
