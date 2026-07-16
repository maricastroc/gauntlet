// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ScenarioResult, Team, WhatIfFixture } from "@/lib/types";
import { useScenarioEditor } from "./useScenarioEditor";

const team = (id: number, name: string): Team => ({ id, name });

const fixture = (id: number, over: Partial<WhatIfFixture> = {}): WhatIfFixture => ({
  id,
  phase: "knockout",
  phaseLabel: "Semi-finals",
  label: "SF1",
  home: team(1, "A"),
  away: team(2, "B"),
  homeScore: null,
  awayScore: null,
  status: "scheduled",
  isKnockout: true,
  ...over,
});

const GROUP_FIXTURE = fixture(10, { phase: "group", phaseLabel: "Group A", isKnockout: false });
const KO_FIXTURE = fixture(20);

describe("useScenarioEditor", () => {
  it("selects the first fixture and seeds scores from it", () => {
    const fixtures = [
      fixture(10, { homeScore: 2, awayScore: 1, isKnockout: false, phase: "group" }),
    ];
    const { result } = renderHook(() => useScenarioEditor(fixtures, new Map()));
    expect(result.current.selected.id).toBe(10);
    expect(result.current.home).toBe(2);
    expect(result.current.away).toBe(1);
  });

  it("only enters a shootout for a tied knockout tie", () => {
    const { result } = renderHook(() => useScenarioEditor([KO_FIXTURE], new Map()));
    expect(result.current.shootout).toBe(true);

    act(() => result.current.setAway(2));
    expect(result.current.shootout).toBe(false);

    act(() => result.current.setHome(2));
    expect(result.current.shootout).toBe(true);
  });

  it("never treats a level group match as a shootout", () => {
    const { result } = renderHook(() => useScenarioEditor([GROUP_FIXTURE], new Map()));
    act(() => {
      result.current.setHome(1);
      result.current.setAway(1);
    });
    expect(result.current.shootout).toBe(false);
  });

  it("carries penalties into the result only while the shootout is live", () => {
    const { result } = renderHook(() => useScenarioEditor([KO_FIXTURE], new Map()));

    act(() => {
      result.current.setHome(2);
      result.current.setAway(0);
    });
    expect(result.current.toResult()).toEqual<ScenarioResult>({
      fixtureId: 20,
      homeScore: 2,
      awayScore: 0,
      homePenalties: null,
      awayPenalties: null,
    });

    act(() => {
      result.current.setAway(2);
      result.current.setHomePens(5);
      result.current.setAwayPens(3);
    });
    expect(result.current.toResult()).toEqual<ScenarioResult>({
      fixtureId: 20,
      homeScore: 2,
      awayScore: 2,
      homePenalties: 5,
      awayPenalties: 3,
    });
  });

  it("rehydrates the editor from an existing pin when reselecting", () => {
    const fixtures = [KO_FIXTURE, fixture(21, { label: "SF2" })];
    const pins = new Map<number, ScenarioResult>([
      [21, { fixtureId: 21, homeScore: 3, awayScore: 3, homePenalties: 5, awayPenalties: 4 }],
    ]);
    const { result } = renderHook(() => useScenarioEditor(fixtures, pins));

    act(() => result.current.reselect(21));

    expect(result.current.selected.id).toBe(21);
    expect(result.current.home).toBe(3);
    expect(result.current.away).toBe(3);
    expect(result.current.shootout).toBe(true);
    expect(result.current.homePens).toBe(5);
    expect(result.current.awayPens).toBe(4);
  });
});
