// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FixtureDetail, GroupDetail, Team } from "@/lib/types";

const { submitGroupResult, notifyApiError, authRef } = vi.hoisted(() => ({
  submitGroupResult: vi.fn(),
  notifyApiError: vi.fn(),
  authRef: { current: { status: "authed" as string, token: "tok-1" as string | null } },
}));

vi.mock("@/lib/auth/context", () => ({ useAuth: () => authRef.current }));
vi.mock("@/lib/api/client", () => ({ api: { submitGroupResult } }));
vi.mock("@/lib/toast", () => ({ notifyApiError }));

import { useGroupEditor } from "./useGroupEditor";

const team = (id: number, name: string): Team => ({ id, name });

const fixture = (
  id: number,
  home: Team,
  away: Team,
  over: Partial<FixtureDetail> = {},
): FixtureDetail => ({
  id,
  tieId: null,
  home,
  away,
  homeScore: null,
  awayScore: null,
  homePenalties: null,
  awayPenalties: null,
  status: "scheduled",
  version: 1,
  ...over,
});

const A = team(1, "A");
const B = team(2, "B");
const C = team(3, "C");

const GROUP: GroupDetail = {
  id: 1,
  name: "A",
  qualifyCount: 2,
  teams: [A, B, C],
  fixtures: [
    fixture(20, A, B, { status: "scheduled", version: 5 }),
    fixture(21, A, C, { homeScore: 1, awayScore: 0, status: "finished", version: 2 }),
    fixture(22, B, C, { homeScore: 1, awayScore: 0, status: "finished", version: 2 }),
  ],
};

const ids = (rows: { team: Team }[]) => rows.map((row) => row.team.id);

beforeEach(() => {
  submitGroupResult.mockReset();
  notifyApiError.mockReset();
  authRef.current = { status: "authed", token: "tok-1" };
});

describe("useGroupEditor", () => {
  it("previews the reordered table before anything is saved", () => {
    const { result } = renderHook(() => useGroupEditor(GROUP));

    expect(ids(result.current.base)).toEqual([1, 2, 3]);
    expect(ids(result.current.preview)).toEqual([1, 2, 3]);

    act(() => result.current.setScore(20, "away", 3));

    expect(ids(result.current.preview)).toEqual([2, 1, 3]);
    expect(ids(result.current.base)).toEqual([1, 2, 3]);
    expect(result.current.dirty).toBe(true);
  });

  it("saves the debounced edit with the row's optimistic-lock version, then reconciles", async () => {
    submitGroupResult.mockResolvedValueOnce([]);
    const { result } = renderHook(() => useGroupEditor(GROUP));

    act(() => result.current.setScore(20, "away", 3));

    await waitFor(() => expect(submitGroupResult).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(submitGroupResult).toHaveBeenCalledWith("tok-1", 20, {
      home_score: 0,
      away_score: 3,
      expected_version: 5,
    });

    await waitFor(() => expect(result.current.rows[20].status).toBe("saved"));
    expect(result.current.rows[20].version).toBe(6);
    expect(ids(result.current.base)).toEqual([2, 1, 3]);
    expect(result.current.dirty).toBe(false);
  });

  it("surfaces a rejected write as an error without clearing the edit", async () => {
    submitGroupResult.mockRejectedValueOnce(new Error("stale"));
    const { result } = renderHook(() => useGroupEditor(GROUP));

    act(() => result.current.setScore(20, "away", 3));

    await waitFor(() => expect(result.current.rows[20].status).toBe("error"));
    expect(notifyApiError).toHaveBeenCalledTimes(1);

    expect(result.current.rows[20].away).toBe(3);
    expect(ids(result.current.preview)).toEqual([2, 1, 3]);
  });

  it("still previews for an unauthenticated viewer but never writes", async () => {
    authRef.current = { status: "anon", token: null };
    const { result } = renderHook(() => useGroupEditor(GROUP));

    act(() => result.current.setScore(20, "away", 3));

    expect(ids(result.current.preview)).toEqual([2, 1, 3]);

    await new Promise((r) => setTimeout(r, 900));
    expect(submitGroupResult).not.toHaveBeenCalled();
  });
});
