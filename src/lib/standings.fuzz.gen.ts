import { computeStandings, type RawMatch } from "@/lib/standings";
import type { Team } from "@/lib/types";
import { mulberry32 } from "@/lib/forecast/rng";

export interface FuzzVector {
  name: string;
  teams: Team[];
  qualifyCount: number;
  matches: RawMatch[];
  expected: number[];
}

export const FUZZ_SEED = 0x5eed_c0de;
export const FUZZ_COUNT = 200;
export const FUZZ_VERSION = 1;
export const FUZZ_NOTE =
  "GENERATED — do not edit by hand. Deterministic fuzz vectors for the group-standings engine, " +
  "shared byte-for-byte between the web app (src/lib/standings.ts) and the API " +
  "(App\\Domain\\Tournament\\Standings\\GroupTable). Regenerate with `npm run vectors`, then copy " +
  "this file to the API's tests/Vectors/. Every case assumes the FIFA tiebreak chain.";

const SCORE_WEIGHTS = [0, 0, 1, 1, 1, 2, 2, 3, 4];

function intBelow(rng: () => number, max: number): number {
  return Math.floor(rng() * max);
}

function generateOne(rng: () => number, index: number): FuzzVector {
  const size = 3 + intBelow(rng, 3);
  const base = 1 + intBelow(rng, 50);
  const teams: Team[] = [];
  for (let t = 0; t < size; t++) teams.push({ id: base + t, name: `T${base + t}` });

  const qualifyCount = 1 + intBelow(rng, size - 1);

  const matches: RawMatch[] = [];
  for (let a = 0; a < size; a++) {
    for (let b = a + 1; b < size; b++) {
      if (rng() < 0.25) continue;
      const homeScore = SCORE_WEIGHTS[intBelow(rng, SCORE_WEIGHTS.length)];
      const awayScore = SCORE_WEIGHTS[intBelow(rng, SCORE_WEIGHTS.length)];
      matches.push({ homeId: teams[a].id, awayId: teams[b].id, homeScore, awayScore });
    }
  }

  const expected = computeStandings(teams, matches, qualifyCount).map((row) => row.team.id);
  return {
    name: `fuzz #${index} (size ${size}, qualify ${qualifyCount}, played ${matches.length})`,
    teams,
    qualifyCount,
    matches,
    expected,
  };
}

export function generateFuzzVectors(count = FUZZ_COUNT, seed = FUZZ_SEED): FuzzVector[] {
  const rng = mulberry32(seed);
  const vectors: FuzzVector[] = [];
  for (let i = 0; i < count; i++) vectors.push(generateOne(rng, i));
  return vectors;
}

export interface FuzzSuite {
  version: number;
  seed: number;
  note: string;
  cases: FuzzVector[];
}

export function buildFuzzSuite(): FuzzSuite {
  return {
    version: FUZZ_VERSION,
    seed: FUZZ_SEED,
    note: FUZZ_NOTE,
    cases: generateFuzzVectors(),
  };
}
