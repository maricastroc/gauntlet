import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { computeStandings, type RawMatch } from "@/lib/standings";
import type { Team } from "@/lib/types";

interface Vector {
  name: string;
  teams: Team[];
  qualifyCount: number;
  matches: RawMatch[];
  expected: number[];
}

// Shared byte-for-byte with the API engine (tournament-game-api: tests/Vectors/standings.json).
// Both suites run these vectors; a drift in either engine breaks its build. Keep the copies identical.
const vectorsPath = path.join(process.cwd(), "test-vectors", "standings.json");
const suite = JSON.parse(readFileSync(vectorsPath, "utf8")) as { cases: Vector[] };

describe("standings conformance vectors (shared with the API engine)", () => {
  for (const vector of suite.cases) {
    it(vector.name, () => {
      const rows = computeStandings(vector.teams, vector.matches, vector.qualifyCount);
      expect(rows.map((row) => row.team.id)).toEqual(vector.expected);
    });
  }
});
