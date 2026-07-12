"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";

/**
 * Whether the signed-in user may edit this tournament, per the backend policy.
 * `null` while unknown (loading or signed out) so callers can hold off on gating.
 */
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

  // Signed-out sessions can still play the local demo, so never gate them.
  return status === "authed" ? fetched : null;
}
