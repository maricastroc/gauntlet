import { describe, expect, it } from "vitest";
import { computeStandings } from "@/lib/standings";
import { generateFuzzVectors } from "./standings.fuzz.gen";

const cases = generateFuzzVectors(400, 0xa11ce);

describe("standings engine invariants", () => {
  it("returns exactly the input teams, once each", () => {
    for (const { teams, matches, qualifyCount } of cases) {
      const rows = computeStandings(teams, matches, qualifyCount);
      expect(rows).toHaveLength(teams.length);
      expect(new Set(rows.map((r) => r.team.id))).toEqual(new Set(teams.map((t) => t.id)));
    }
  });

  it("keeps per-row accounting internally consistent", () => {
    for (const { teams, matches, qualifyCount } of cases) {
      for (const row of computeStandings(teams, matches, qualifyCount)) {
        expect(row.played).toBe(row.won + row.drawn + row.lost);
        expect(row.points).toBe(row.won * 3 + row.drawn);
        expect(row.goalDifference).toBe(row.goalsFor - row.goalsAgainst);
        expect(row.played).toBe(
          matches.filter((m) => m.homeId === row.team.id || m.awayId === row.team.id).length,
        );
      }
    }
  });

  it("conserves goals across the group (every goal is one for and one against)", () => {
    for (const { teams, matches, qualifyCount } of cases) {
      const rows = computeStandings(teams, matches, qualifyCount);
      const totalFor = rows.reduce((sum, r) => sum + r.goalsFor, 0);
      const totalAgainst = rows.reduce((sum, r) => sum + r.goalsAgainst, 0);
      const totalGoals = matches.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0);
      expect(totalFor).toBe(totalGoals);
      expect(totalAgainst).toBe(totalGoals);
    }
  });

  it("numbers positions 1..n and flags exactly the top qualifyCount as qualified", () => {
    for (const { teams, matches, qualifyCount } of cases) {
      const rows = computeStandings(teams, matches, qualifyCount);
      rows.forEach((row, i) => {
        expect(row.position).toBe(i + 1);
        expect(row.qualified).toBe(i < qualifyCount);
      });
    }
  });

  it("orders the table by the scalar tiebreak chain before head-to-head", () => {
    for (const { teams, matches, qualifyCount } of cases) {
      const rows = computeStandings(teams, matches, qualifyCount);
      for (let i = 1; i < rows.length; i++) {
        const above = rows[i - 1];
        const below = rows[i];
        expect(above.points).toBeGreaterThanOrEqual(below.points);
        if (above.points === below.points) {
          expect(above.goalDifference).toBeGreaterThanOrEqual(below.goalDifference);
          if (above.goalDifference === below.goalDifference) {
            expect(above.goalsFor).toBeGreaterThanOrEqual(below.goalsFor);
          }
        }
      }
    }
  });
});
