"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GroupDetail, StandingRow } from "@/lib/types";
import { computeStandings, type RawMatch } from "@/lib/standings";
import { api } from "@/lib/api/client";
import { notifyApiError } from "@/lib/toast";
import { useAuth } from "@/lib/auth/context";

export type RowStatus = "idle" | "dirty" | "saving" | "saved" | "error";

export interface RowState {
  home: number;
  away: number;
  version: number;
  status: RowStatus;
  savedHome: number;
  savedAway: number;
  finished: boolean;
}

const SAVE_DELAY = 700;

type RowMap = Record<number, RowState>;

function rawMatches(
  fixtures: GroupDetail["fixtures"],
  rows: RowMap,
  live: boolean,
): RawMatch[] {
  return fixtures.flatMap((fixture) => {
    if (!fixture.home || !fixture.away) return [];
    const row = rows[fixture.id];
    if (!row) return [];
    const changed = row.home !== row.savedHome || row.away !== row.savedAway;
    const include = live ? row.finished || changed : row.finished;
    if (!include) return [];
    return [
      {
        homeId: fixture.home.id,
        awayId: fixture.away.id,
        homeScore: live ? row.home : row.savedHome,
        awayScore: live ? row.away : row.savedAway,
      },
    ];
  });
}

export function useGroupEditor(group: GroupDetail) {
  const { status, token } = useAuth();
  const authed = status === "authed" && token !== null;

  const fixtures = useMemo(() => group.fixtures.filter((f) => f.home && f.away), [group]);

  const [rows, setRows] = useState<RowMap>(() => {
    const init: RowMap = {};
    for (const fixture of fixtures) {
      const home = fixture.homeScore ?? 0;
      const away = fixture.awayScore ?? 0;
      init[fixture.id] = {
        home,
        away,
        version: fixture.version,
        status: "idle",
        savedHome: home,
        savedAway: away,
        finished: fixture.status === "finished",
      };
    }
    return init;
  });

  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const mounted = useRef(true);
  useEffect(() => {
    const pending = timers.current;
    return () => {
      mounted.current = false;
      Object.values(pending).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const base = useMemo(
    () => computeStandings(group.teams, rawMatches(fixtures, rows, false), group.qualifyCount),
    [group, fixtures, rows],
  );
  const preview = useMemo(
    () => computeStandings(group.teams, rawMatches(fixtures, rows, true), group.qualifyCount),
    [group, fixtures, rows],
  );

  const dirty = Object.values(rows).some((r) => r.home !== r.savedHome || r.away !== r.savedAway);
  const previewKey = preview
    .map((row: StandingRow) => `${row.team.id}:${row.points}:${row.goalDifference}`)
    .join("|");

  async function save(id: number) {
    if (!authed || !token) return;
    const row = rowsRef.current[id];
    if (!row) return;
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], status: "saving" } }));
    try {
      await api.submitGroupResult(token, id, {
        home_score: row.home,
        away_score: row.away,
        expected_version: row.version,
      });
      if (!mounted.current) return;
      setRows((prev) => {
        const current = prev[id];
        return {
          ...prev,
          [id]: {
            ...current,
            version: current.version + 1,
            status: "saved",
            savedHome: current.home,
            savedAway: current.away,
            finished: true,
          },
        };
      });
    } catch (err) {
      notifyApiError(err);
      if (!mounted.current) return;
      setRows((prev) => ({ ...prev, [id]: { ...prev[id], status: "error" } }));
    }
  }

  function setScore(id: number, side: "home" | "away", value: number) {
    const next = Math.max(0, Math.min(99, value));
    setRows((prev) => {
      const row = prev[id];
      const updated = { ...row, [side]: next };
      const changed = updated.home !== row.savedHome || updated.away !== row.savedAway;
      updated.status = changed ? "dirty" : "idle";
      return { ...prev, [id]: updated };
    });

    if (!authed) return;
    if (timers.current[id]) clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => save(id), SAVE_DELAY);
  }

  return { authed, fixtures, rows, base, preview, dirty, previewKey, setScore };
}
