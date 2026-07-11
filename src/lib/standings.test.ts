import { describe, expect, it } from "vitest";
import { computeStandings, type RawMatch } from "@/lib/standings";
import type { Team } from "@/lib/types";

const teams: Team[] = [
  { id: 1, name: "Brazil" },
  { id: 2, name: "Argentina" },
  { id: 3, name: "France" },
  { id: 4, name: "Spain" },
];

describe("computeStandings", () => {
  it("returns every team with zeroed rows when no matches were played", () => {
    const rows = computeStandings(teams, [], 2);
    expect(rows).toHaveLength(4);
    for (const row of rows) {
      expect(row.played).toBe(0);
      expect(row.points).toBe(0);
      expect(row.form).toEqual([]);
    }
  });

  it("awards three points for a win and none for a loss", () => {
    const matches: RawMatch[] = [{ homeId: 1, awayId: 2, homeScore: 2, awayScore: 0 }];
    const rows = computeStandings(teams, matches, 2);
    const brazil = rows.find((r) => r.team.id === 1)!;
    const argentina = rows.find((r) => r.team.id === 2)!;

    expect(brazil.points).toBe(3);
    expect(brazil.won).toBe(1);
    expect(brazil.form).toEqual(["W"]);
    expect(argentina.points).toBe(0);
    expect(argentina.lost).toBe(1);
    expect(argentina.form).toEqual(["L"]);
  });

  it("awards one point each for a draw", () => {
    const matches: RawMatch[] = [{ homeId: 1, awayId: 2, homeScore: 1, awayScore: 1 }];
    const rows = computeStandings(teams, matches, 2);
    expect(rows.find((r) => r.team.id === 1)!.points).toBe(1);
    expect(rows.find((r) => r.team.id === 2)!.points).toBe(1);
    expect(rows.find((r) => r.team.id === 1)!.form).toEqual(["D"]);
  });

  it("accumulates goals for, against and goal difference", () => {
    const matches: RawMatch[] = [
      { homeId: 1, awayId: 2, homeScore: 3, awayScore: 1 },
      { homeId: 3, awayId: 1, homeScore: 0, awayScore: 2 },
    ];
    const rows = computeStandings(teams, matches, 2);
    const brazil = rows.find((r) => r.team.id === 1)!;
    expect(brazil.goalsFor).toBe(5);
    expect(brazil.goalsAgainst).toBe(1);
    expect(brazil.goalDifference).toBe(4);
    expect(brazil.played).toBe(2);
  });

  it("ranks by points, then goal difference, then goals scored", () => {
    const matches: RawMatch[] = [
      { homeId: 1, awayId: 3, homeScore: 4, awayScore: 0 },
      { homeId: 2, awayId: 4, homeScore: 1, awayScore: 0 },
    ];
    const rows = computeStandings(teams, matches, 2);
    expect(rows[0].team.id).toBe(1);
    expect(rows[1].team.id).toBe(2);
  });

  it("breaks a full tie by original seed order", () => {
    const rows = computeStandings(teams, [], 2);
    expect(rows.map((r) => r.team.id)).toEqual([1, 2, 3, 4]);
  });

  it("marks the top `qualifyCount` rows as qualified", () => {
    const rows = computeStandings(teams, [], 2);
    expect(rows.filter((r) => r.qualified).map((r) => r.position)).toEqual([1, 2]);
    expect(rows[2].qualified).toBe(false);
  });

  it("assigns sequential positions starting at 1", () => {
    const rows = computeStandings(teams, [], 2);
    expect(rows.map((r) => r.position)).toEqual([1, 2, 3, 4]);
  });

  it("ignores matches referencing unknown teams", () => {
    const matches: RawMatch[] = [{ homeId: 99, awayId: 1, homeScore: 1, awayScore: 0 }];
    const rows = computeStandings(teams, matches, 2);
    expect(rows.every((r) => r.played === 0)).toBe(true);
  });

  it("breaks an all-scalars tie by the head-to-head result", () => {
    // Brazil and Argentina end level on points, goal difference, goals for and wins;
    // Argentina won the match between them, so it must rank above Brazil despite the
    // lower seed. This is the case the old comparator got wrong (it fell to seed).
    const matches: RawMatch[] = [
      { homeId: 2, awayId: 1, homeScore: 1, awayScore: 0 }, // Argentina beats Brazil
      { homeId: 1, awayId: 3, homeScore: 1, awayScore: 0 }, // Brazil beats France
      { homeId: 2, awayId: 4, homeScore: 0, awayScore: 1 }, // Spain beats Argentina
    ];
    const rows = computeStandings(teams, matches, 2);
    const argentina = rows.find((r) => r.team.id === 2)!;
    const brazil = rows.find((r) => r.team.id === 1)!;

    expect(argentina.points).toBe(brazil.points);
    expect(argentina.goalDifference).toBe(brazil.goalDifference);
    expect(argentina.goalsFor).toBe(brazil.goalsFor);
    expect(argentina.position).toBeLessThan(brazil.position);
    expect(argentina.qualified).toBe(true);
    expect(brazil.qualified).toBe(false);
  });

  it("falls through to seed order when the head-to-head is a cycle", () => {
    // Brazil > Argentina > France > Brazil: the three are level everywhere, including
    // the head-to-head mini-league, so the tie resolves by seed order.
    const matches: RawMatch[] = [
      { homeId: 1, awayId: 2, homeScore: 1, awayScore: 0 },
      { homeId: 2, awayId: 3, homeScore: 1, awayScore: 0 },
      { homeId: 3, awayId: 1, homeScore: 1, awayScore: 0 },
    ];
    const rows = computeStandings(teams, matches, 2);
    expect(rows.map((r) => r.team.id)).toEqual([1, 2, 3, 4]);
  });
});
