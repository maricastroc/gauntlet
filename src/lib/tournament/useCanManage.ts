"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";

export function useCanManage(tournamentId: number): boolean | null {
  const { status, token } = useAuth();
  const [fetched, setFetched] = useState<boolean | null>(null);

  useEffect(() => {
    if (status !== "authed" || !token) return;
    let active = true;
    api
      .getManagedTournament(token, tournamentId)
      .then((detail) => {
        if (active) setFetched(detail.canManage ?? false);
      })
      .catch(() => {
        if (active) setFetched(false);
      });
    return () => {
      active = false;
    };
  }, [status, token, tournamentId]);

  return status === "authed" ? fetched : null;
}
