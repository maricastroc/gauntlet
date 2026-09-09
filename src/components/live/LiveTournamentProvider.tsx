"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useLiveTournament, type LiveTournamentState } from "@/lib/live/useLiveTournament";

const LiveTournamentContext = createContext<LiveTournamentState>({
  status: "connecting",
  lastUpdateAt: null,
});

export function LiveTournamentProvider({
  tournamentId,
  children,
}: {
  tournamentId: number | null;
  children: ReactNode;
}) {
  const live = useLiveTournament(tournamentId);
  return <LiveTournamentContext.Provider value={live}>{children}</LiveTournamentContext.Provider>;
}

export function useLiveStatus(): LiveTournamentState {
  return useContext(LiveTournamentContext);
}
