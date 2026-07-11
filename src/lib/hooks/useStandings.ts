import { useMemo } from "react";
import { useRequest } from "@/lib/hooks/useRequest";
import { toStandingRow, type ApiStanding } from "@/lib/api/client";
import type { StandingRow } from "@/lib/types";

export function useStandings(groupId: number | null) {
  const { data, error, isLoading, isValidating, mutate } = useRequest<ApiStanding[]>(
    groupId ? { url: `/groups/${groupId}/standings` } : null,
  );

  const standings = useMemo<StandingRow[]>(() => (data ?? []).map(toStandingRow), [data]);

  return { standings, error, isLoading, isValidating, refresh: mutate };
}
