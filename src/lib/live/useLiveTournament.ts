"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/client";
import { reduceStreamEvent } from "@/lib/live/streamEvent";

export type LiveStatus = "connecting" | "live" | "reconnecting" | "offline";

export interface LiveTournamentState {
  status: LiveStatus;
  lastUpdateAt: number | null;
}

const COALESCE_MS = 400;

export function useLiveTournament(tournamentId: number | null): LiveTournamentState {
  const router = useRouter();
  const [status, setStatus] = useState<LiveStatus>("connecting");
  const [lastUpdateAt, setLastUpdateAt] = useState<number | null>(null);

  useEffect(() => {
    if (tournamentId == null) return;
    if (typeof window === "undefined" || typeof EventSource === "undefined") return;

    let lastRevision = -1;
    let coalesceTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const source = new EventSource(`${API_BASE_URL}/tournaments/${tournamentId}/stream`);

    const runRefresh = () => {
      coalesceTimer = null;
      try {
        router.refresh();
        setLastUpdateAt(Date.now());
      } catch {
        //
      }
    };

    const scheduleRefresh = () => {
      if (coalesceTimer != null) return;
      coalesceTimer = setTimeout(runRefresh, COALESCE_MS);
    };

    const onUpdate = (ev: MessageEvent) => {
      const decision = reduceStreamEvent(lastRevision, ev.data, tournamentId);
      if (decision.action === "refresh") {
        lastRevision = decision.nextRevision;
        scheduleRefresh();
      }
    };

    const onOpen = () => {
      if (!disposed) setStatus("live");
    };

    const onError = () => {
      if (disposed) return;
      setStatus(source.readyState === EventSource.CLOSED ? "offline" : "reconnecting");
    };

    const onVisible = () => {
      if (!disposed && document.visibilityState === "visible") scheduleRefresh();
    };

    source.addEventListener("update", onUpdate as EventListener);
    source.addEventListener("open", onOpen);
    source.addEventListener("error", onError);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      disposed = true;
      if (coalesceTimer != null) clearTimeout(coalesceTimer);
      source.removeEventListener("update", onUpdate as EventListener);
      source.removeEventListener("open", onOpen);
      source.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisible);
      source.close();
    };
  }, [tournamentId, router]);

  return { status, lastUpdateAt };
}
