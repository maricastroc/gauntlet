import { describe, expect, it } from "vitest";
import { knockoutPhases } from "@/lib/tournament/phases";
import type { FixtureDetail, TieTopology } from "@/lib/types";

const tie = (id: number, round: number, slot: number): TieTopology => ({
  id,
  round,
  slot,
  homeSource: "",
  awaySource: "",
});

const fixture = (
  id: number,
  tieId: number,
  status: FixtureDetail["status"],
): FixtureDetail => ({
  id,
  tieId,
  home: null,
  away: null,
  homeScore: null,
  awayScore: null,
  homePenalties: null,
  awayPenalties: null,
  status,
  version: 0,
});

// A 4-team bracket: two semifinal ties (round 1) feeding one final tie (round 2).
const semisAndFinal: TieTopology[] = [tie(1, 1, 1), tie(2, 1, 2), tie(3, 2, 1)];
const states = (ties: TieTopology[], fixtures: FixtureDetail[]) =>
  knockoutPhases(ties, fixtures).map((phase) => phase.state);

describe("knockoutPhases", () => {
  it("returns nothing without ties", () => {
    expect(knockoutPhases([], [])).toEqual([]);
  });

  it("keeps the final locked while the semis are unplayed", () => {
    expect(states(semisAndFinal, [])).toEqual(["now", "todo"]);
  });

  it("keeps the final locked while only one semi is decided", () => {
    expect(states(semisAndFinal, [fixture(10, 1, "finished")])).toEqual(["now", "todo"]);
  });

  it("unlocks the final once both semis are decided", () => {
    const played = [fixture(10, 1, "finished"), fixture(11, 2, "finished")];
    expect(states(semisAndFinal, played)).toEqual(["done", "now"]);
  });

  it("does not count live or scheduled fixtures as decided", () => {
    const inFlight = [fixture(10, 1, "finished"), fixture(11, 2, "live")];
    expect(states(semisAndFinal, inFlight)).toEqual(["now", "todo"]);
  });

  it("marks every round done once the final is played", () => {
    const played = [
      fixture(10, 1, "finished"),
      fixture(11, 2, "finished"),
      fixture(12, 3, "finished"),
    ];
    expect(states(semisAndFinal, played)).toEqual(["done", "done"]);
  });

  it("labels rounds relative to the bracket size", () => {
    expect(knockoutPhases(semisAndFinal, []).map((p) => p.label)).toEqual(["Semis", "Final"]);
  });
});
