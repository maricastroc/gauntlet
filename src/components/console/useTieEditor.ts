"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BracketTie } from "@/lib/types";
import { api } from "@/lib/api/client";
import { notifyApiError } from "@/lib/toast";
import { useAuth } from "@/lib/auth/context";

export type TieRowStatus = "idle" | "dirty" | "needs-penalties" | "saving" | "saved" | "error";

export interface TieRowState {
  fixtureId: number;
  home: number;
  away: number;
  homePen: number;
  awayPen: number;
  version: number;
  status: TieRowStatus;
  savedHome: number;
  savedAway: number;
  savedHomePen: number;
  savedAwayPen: number;
}

const SAVE_DELAY = 700;

export function tieIsEditable(tie: BracketTie): boolean {
  return Boolean(tie.home.team && tie.away.team && tie.fixtureId != null);
}

function statusFor(row: TieRowState): TieRowStatus {
  const draw = row.home === row.away;
  if (draw && row.homePen === row.awayPen) return "needs-penalties";
  const changed =
    row.home !== row.savedHome ||
    row.away !== row.savedAway ||
    (draw && (row.homePen !== row.savedHomePen || row.awayPen !== row.savedAwayPen));
  return changed ? "dirty" : "idle";
}

export function useTieEditor(ties: BracketTie[]) {
  const { status, token } = useAuth();
  const authed = status === "authed" && token !== null;

  const editable = useMemo(() => ties.filter(tieIsEditable), [ties]);

  const [rows, setRows] = useState<Record<number, TieRowState>>(() => {
    const init: Record<number, TieRowState> = {};
    for (const tie of editable) {
      const home = tie.home.score ?? 0;
      const away = tie.away.score ?? 0;
      const homePen = tie.home.penalties ?? 0;
      const awayPen = tie.away.penalties ?? 0;
      init[tie.id] = {
        fixtureId: tie.fixtureId!,
        home,
        away,
        homePen,
        awayPen,
        version: tie.version ?? 0,
        status: "idle",
        savedHome: home,
        savedAway: away,
        savedHomePen: homePen,
        savedAwayPen: awayPen,
      };
    }
    return init;
  });

  const [savedNonce, setSavedNonce] = useState(0);

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

  async function save(tieId: number) {
    if (!authed || !token) return;
    const row = rowsRef.current[tieId];
    if (!row) return;
    const draw = row.home === row.away;
    if (draw && row.homePen === row.awayPen) return; // a knockout tie can't end level

    setRows((prev) => ({ ...prev, [tieId]: { ...prev[tieId], status: "saving" } }));
    try {
      await api.submitKnockoutResult(token, row.fixtureId, {
        home_score: row.home,
        away_score: row.away,
        home_penalties: draw ? row.homePen : null,
        away_penalties: draw ? row.awayPen : null,
        expected_version: row.version,
      });
      if (!mounted.current) return;
      setRows((prev) => {
        const current = prev[tieId];
        return {
          ...prev,
          [tieId]: {
            ...current,
            version: current.version + 1,
            status: "saved",
            savedHome: current.home,
            savedAway: current.away,
            savedHomePen: current.homePen,
            savedAwayPen: current.awayPen,
          },
        };
      });
      setSavedNonce((n) => n + 1);
    } catch (err) {
      notifyApiError(err);
      if (!mounted.current) return;
      setRows((prev) => ({ ...prev, [tieId]: { ...prev[tieId], status: "error" } }));
    }
  }

  function update(tieId: number, patch: Partial<TieRowState>) {
    setRows((prev) => {
      const row = prev[tieId];
      if (!row) return prev;
      const merged = { ...row, ...patch };
      merged.status = statusFor(merged);
      return { ...prev, [tieId]: merged };
    });

    if (!authed) return;
    if (timers.current[tieId]) clearTimeout(timers.current[tieId]);
    // A level tie with no penalty separation is skipped by save() until it resolves.
    timers.current[tieId] = setTimeout(() => save(tieId), SAVE_DELAY);
  }

  const clamp = (value: number) => Math.max(0, Math.min(99, value));

  function setScore(tieId: number, side: "home" | "away", value: number) {
    update(tieId, side === "home" ? { home: clamp(value) } : { away: clamp(value) });
  }

  function setPenalty(tieId: number, side: "home" | "away", value: number) {
    update(tieId, side === "home" ? { homePen: clamp(value) } : { awayPen: clamp(value) });
  }

  return { authed, rows, setScore, setPenalty, savedNonce };
}
