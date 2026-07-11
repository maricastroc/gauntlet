import { describe, expect, it } from "vitest";
import { demoProjectScenario, demoWhatIfSetup } from "./demo-scenario";

const groupA = (p: ReturnType<typeof demoProjectScenario>) =>
  p.groups.find((group) => group.name === "A")!;
const tie = (p: ReturnType<typeof demoProjectScenario>, id: number) =>
  p.bracket!.ties.find((t) => t.id === id)!;

const BRAZIL_JAPAN = 100;

describe("demoProjectScenario", () => {
  it("reproduces reality with no pins: Brazil tops group A, seeds feed the bracket", () => {
    const p = demoProjectScenario([]);
    const a = groupA(p);

    expect(a.standings.map((row) => row.team.name)).toEqual([
      "Brazil",
      "Japan",
      "Croatia",
      "Morocco",
    ]);
    expect(tie(p, 1).home.team?.name).toBe("Brazil");
    expect(tie(p, 1).away.team?.name).toBe("France");
  });

  it("cascades a hypothetical group result into the bracket seeds", () => {
    const p = demoProjectScenario([{ fixtureId: BRAZIL_JAPAN, homeScore: 0, awayScore: 3 }]);
    const a = groupA(p);

    expect(a.standings[0].team.name).toBe("Japan");
    expect(a.standings[1].team.name).toBe("Brazil");

    expect(tie(p, 1).home.team?.name).toBe("Japan");
    expect(tie(p, 5).away.team?.name).toBe("Brazil");
  });

  it("advances the winner of a pinned knockout result up the bracket", () => {
    const p = demoProjectScenario([{ fixtureId: 6, homeScore: 2, awayScore: 0 }]);

    expect(tie(p, 6).winnerId).toBe(13);
    expect(tie(p, 11).away.team?.name).toBe("Portugal");
  });

  it("leaves the recorded demo results in place when unrelated", () => {
    const p = demoProjectScenario([]);

    expect(tie(p, 1).winnerId).toBe(1);
    expect(tie(p, 9).home.team?.name).toBe("Brazil");
  });
});

describe("demoWhatIfSetup", () => {
  it("lists every group match plus the knockout ties with both sides known", () => {
    const setup = demoWhatIfSetup();
    const groups = setup.fixtures.filter((f) => f.phase === "group");
    const knockout = setup.fixtures.filter((f) => f.phase === "knockout");

    expect(groups).toHaveLength(48);
    expect(knockout).toHaveLength(10);
    expect(setup.baseline.groups).toHaveLength(8);
    expect(setup.baseline.bracket).not.toBeNull();
  });
});
