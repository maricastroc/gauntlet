import { describe, expect, it } from "vitest";
import { forecastGroup, type GroupSim } from "@/lib/forecast/groups";
import type { RawMatch } from "@/lib/standings";
import type { Team } from "@/lib/types";

const teams: Team[] = [
  { id: 1, name: "A" },
  { id: 2, name: "B" },
  { id: 3, name: "C" },
  { id: 4, name: "D" },
];

describe("forecastGroup", () => {
  it("is deterministic for the same key", () => {
    const sim: GroupSim = {
      key: "g:1",
      teams,
      played: [],
      remaining: [
        [1, 2],
        [3, 4],
      ],
      qualifyCount: 2,
    };
    const a = forecastGroup(sim);
    const b = forecastGroup(sim);
    expect([...a.advanceProb.entries()]).toEqual([...b.advanceProb.entries()]);
  });

  it("assigns a probability in [0, 1] to every team", () => {
    const sim: GroupSim = {
      key: "g:2",
      teams,
      played: [],
      remaining: [
        [1, 3],
        [2, 4],
      ],
      qualifyCount: 2,
    };
    const { advanceProb } = forecastGroup(sim);
    expect(advanceProb.size).toBe(4);
    for (const p of advanceProb.values()) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });

  it("clinches a team that has already locked a top spot", () => {
    const played: RawMatch[] = [
      { homeId: 1, awayId: 2, homeScore: 5, awayScore: 0 },
      { homeId: 1, awayId: 3, homeScore: 5, awayScore: 0 },
      { homeId: 1, awayId: 4, homeScore: 5, awayScore: 0 },
      { homeId: 2, awayId: 3, homeScore: 0, awayScore: 0 },
      { homeId: 2, awayId: 4, homeScore: 0, awayScore: 0 },
      { homeId: 3, awayId: 4, homeScore: 0, awayScore: 0 },
    ];
    const sim: GroupSim = { key: "g:done", teams, played, remaining: [], qualifyCount: 1 };
    const { advanceProb, outlook } = forecastGroup(sim);
    expect(advanceProb.get(1)).toBe(1);
    expect(outlook.get(1)).toBe("clinched");
    expect(outlook.get(2)).toBe("eliminated");
  });

  it("keeps everyone contending before any game is played", () => {
    const sim: GroupSim = {
      key: "g:open",
      teams,
      played: [],
      remaining: [
        [1, 2],
        [3, 4],
        [1, 3],
        [2, 4],
        [1, 4],
        [2, 3],
      ],
      qualifyCount: 2,
    };
    const { outlook } = forecastGroup(sim);
    for (const state of outlook.values()) {
      expect(state).toBe("contending");
    }
  });
});
